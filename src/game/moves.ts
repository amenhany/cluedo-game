import type { Ctx, MoveFn, PlayerID } from 'boardgame.io';
import type {
    Card,
    GameState,
    NodeID,
    PlayerState,
    RoomNode,
    Stage,
    Suggestion,
    Weapon,
} from '../types/game';
import { getReachableNodes } from './board/getReachableNodes';
import { cluedoGraph } from './board/boardGraph';
import { INVALID_MOVE } from 'boardgame.io/core';
import type { EventsAPI } from 'boardgame.io/dist/types/src/plugins/plugin-events';

export const rollDice: MoveFn<GameState> = ({ G, playerID, random }) => {
    const player = G.players[playerID];
    if (
        (player.steps && player.steps > 0) ||
        (player.availableMoves && player.availableMoves.length > 0)
    ) {
        return;
    }
    const steps = random.Die(6);
    const currentPos = G.players[playerID].position;

    const availablePos = getReachableNodes(cluedoGraph, currentPos, steps);
    player.steps = steps;
    player.availableMoves = availablePos;
};

export const movePlayer: MoveFn<GameState> = (
    { G, playerID, events },
    nodeID: NodeID
) => {
    const player = G.players[playerID];
    const allowed = player.availableMoves ?? [];
    if (!allowed.includes(nodeID)) return INVALID_MOVE;
    player.position = nodeID;
    player.steps = 0;
    player.availableMoves = [];

    const nodeType = cluedoGraph[nodeID].type;
    switch (nodeType) {
        case 'tile':
            events.endTurn();
            break;
        case 'room':
            events.setStage('RoomAction');
            break;
        case 'end':
            events.setStage('Endgame');
            break;
    }
};

export const useSecretPassage: MoveFn<GameState> = ({ G, playerID, events }) => {
    const player = G.players[playerID];
    const room = cluedoGraph[player.position] as RoomNode;
    if (cluedoGraph[player.position].type !== 'room' || room.secretPassage === undefined)
        return INVALID_MOVE;
    player.position = room.secretPassage;
    player.steps = 0;
    player.availableMoves = [];
    events.setStage('RoomAction');
};

export const endTurn: MoveFn<GameState> = ({ events }) => {
    events.endTurn();
};

function nextPlayer(
    currentPlayer: PlayerID,
    ctx: Ctx,
    events: EventsAPI,
    stageName: Stage,
    players: Record<PlayerID, PlayerState>
) {
    const next = ((Number(currentPlayer) + 1) % ctx.numPlayers).toString();
    if (players[next].isEliminated)
        return nextPlayer(next, ctx, events, stageName, players);
    if (next === ctx.currentPlayer) return true;
    events.setActivePlayers({
        value: {
            [next]: stageName,
        },
    });
    return false;
}

export const startSuggestion: MoveFn<GameState> = ({ G, playerID, events }) => {
    const suggester = G.players[playerID];
    const room = cluedoGraph[suggester.position];
    if (room.type !== 'room') return INVALID_MOVE;
    G.pendingSuggestion = {
        suggester: playerID,
        suspect: null,
        weapon: null,
        room: room.id,
        suspectOrigin: null,
    };
    G.players[playerID].steps = 0;
    G.players[playerID].availableMoves = [];
    events.setStage('Suggest');
};

export const setSuggestion: MoveFn<GameState> = <K extends keyof Suggestion>(
    { G, playerID }: { G: GameState; playerID: PlayerID },
    type: K,
    card: Suggestion[K]
) => {
    const suggester = G.players[playerID];
    const room = cluedoGraph[suggester.position];
    if (room.type !== 'room') return INVALID_MOVE;
    const originalSuspect = G.pendingSuggestion?.suspect;
    const originalPosition = G.pendingSuggestion?.suspectOrigin;
    let originalWeapon = G.pendingSuggestion?.weapon;
    G.pendingSuggestion = {
        suggester: playerID,
        suspect: originalSuspect || null,
        weapon: originalWeapon || null,
        room: room.id,
        suspectOrigin: originalPosition || null,
        [type]: card,
    };

    if (type === 'weapon') {
        if (card === originalWeapon) {
            G.pendingSuggestion.weapon = null;
            return;
        }
        if (!originalWeapon)
            originalWeapon = (Object.keys(G.weapons) as Weapon[]).find(
                (w) => G.weapons[w] === room.id
            );
        if (originalWeapon) {
            const weaponPosition = G.weapons[card as Weapon];
            G.weapons[originalWeapon] = weaponPosition;
        }
        G.weapons[card as Weapon] = room.id;
    }

    if (type === 'suspect') {
        const newSuspect = Object.values(G.players).find(
            (player) => player.character === card
        )!;
        G.pendingSuggestion.suspectOrigin = newSuspect.position;
        newSuspect.position = room.id;

        if (card === originalSuspect) G.pendingSuggestion.suspect = null;

        if (originalSuspect && originalPosition) {
            Object.values(G.players).find(
                (player) => player.character === originalSuspect
            )!.position = originalPosition;
        }
    }
};

export const makeSuggestion: MoveFn<GameState> = ({ G, playerID, ctx, events }) => {
    const suggestion = G.pendingSuggestion;
    const suggester = G.players[playerID];
    const room = cluedoGraph[suggester.position];
    if (!suggestion || room.type !== 'room' || suggester.position !== suggestion.room)
        return INVALID_MOVE;
    if (Object.values(suggestion).some((value) => value === null)) return INVALID_MOVE;
    nextPlayer(playerID, ctx, events, 'ResolveSuggestion', G.players);
};

export const showCard: MoveFn<GameState> = ({ G, playerID, events }, card: Card) => {
    const suggestion = G.pendingSuggestion;
    if (!suggestion) return INVALID_MOVE;
    if (suggestion.suggester === playerID) return INVALID_MOVE;

    const cards = [suggestion.suspect, suggestion.weapon, suggestion.room];
    const playerHand = G.players[playerID].hand;
    const suggesterSeen = G.players[suggestion.suggester].seenCards;

    if (
        !playerHand.includes(card) ||
        !cards.includes(card) ||
        suggesterSeen.includes(card)
    )
        return INVALID_MOVE;

    if (suggestion.suspect && suggestion.suspectOrigin) {
        Object.values(G.players).find(
            (player) => player.character === suggestion.suspect
        )!.position = suggestion.suspectOrigin;
    }

    suggesterSeen.push(card);
    G.pendingSuggestion = undefined;
    events.endTurn();
};

export const noCard: MoveFn<GameState> = ({ G, playerID, ctx, events }) => {
    const suggestion = G.pendingSuggestion;
    if (!suggestion) return INVALID_MOVE;
    if (suggestion.suggester === playerID) return INVALID_MOVE;

    const cards = [suggestion.suspect, suggestion.weapon, suggestion.room];
    const playerHand = G.players[playerID].hand;
    const suggesterSeen = G.players[suggestion.suggester].seenCards;

    const hasUnseenCard = playerHand.some(
        (card) => cards.includes(card) && !suggesterSeen.includes(card)
    );
    if (hasUnseenCard) return INVALID_MOVE;

    const loop = nextPlayer(playerID, ctx, events, 'ResolveSuggestion', G.players);
    if (loop) {
        const unseenDeck = G.deck.filter((card) => !suggesterSeen.includes(card));
        if (unseenDeck.length) {
            suggesterSeen.push(unseenDeck[Math.floor(Math.random() * unseenDeck.length)]);
        }
        if (suggestion.suspect && suggestion.suspectOrigin) {
            Object.values(G.players).find(
                (player) => player.character === suggestion.suspect
            )!.position = suggestion.suspectOrigin;
        }
        G.pendingSuggestion = undefined;
        events.endTurn();
    }
};

export const makeAccusation: MoveFn<GameState> = (
    { G, playerID, events },
    accusation: Suggestion
) => {
    const correct = Object.values(accusation).every((card) => G.envelope.includes(card));
    if (correct) events.endGame({ winner: playerID });
    else G.players[playerID].isEliminated = true;
};

export const reset = ({ G }: { G: GameState }) => {
    G.pendingSuggestion = undefined;
    Object.values(G.players).forEach((player) => {
        player.steps = 0;
        player.availableMoves = [];
    });
};
