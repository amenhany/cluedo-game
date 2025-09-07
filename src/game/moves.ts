import type { Ctx, MoveFn, PlayerID } from 'boardgame.io';
import type {
    Card,
    Character,
    GameState,
    NodeID,
    Room,
    RoomNode,
    Stage,
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

export const movePiece: MoveFn<GameState> = ({ G, playerID, events }, nodeID: NodeID) => {
    const player = G.players[playerID];
    const allowed = player.availableMoves ?? [];
    if (!allowed.includes(nodeID)) return INVALID_MOVE;
    player.position = nodeID;
    player.steps = 0;
    player.availableMoves = [];

    if (cluedoGraph[nodeID].type === 'tile') events.endTurn();
    else events.setStage('Suggest');
};

export const useSecretPassage: MoveFn<GameState> = ({ G, playerID, events }) => {
    const player = G.players[playerID];
    const room = cluedoGraph[player.position] as RoomNode;
    if (cluedoGraph[player.position].type !== 'room' || room.secretPassage === undefined)
        return INVALID_MOVE;
    player.position = room.secretPassage;
    player.steps = 0;
    player.availableMoves = [];
    events.setStage('Suggest');
};

export const endTurn: MoveFn<GameState> = ({ events }) => {
    events.endTurn();
};

function nextPlayer(
    currentPlayer: PlayerID,
    ctx: Ctx,
    events: EventsAPI,
    stageName: Stage
) {
    const nextPlayer = ((Number(currentPlayer) + 1) % ctx.numPlayers).toString();
    if (nextPlayer === ctx.currentPlayer) return true;
    events.setActivePlayers({
        value: {
            [nextPlayer]: stageName,
        },
    });
    return false;
}

export const makeSuggestion: MoveFn<GameState> = (
    { G, playerID, ctx, events },
    suggestion: { suspect: Character; weapon: Weapon; room: Room }
) => {
    const suggester = G.players[playerID];
    const room = cluedoGraph[suggester.position];
    if (room.type !== 'room' || suggester.position !== suggestion.room)
        return INVALID_MOVE;
    G.pendingSuggestion = { suggester: playerID, cards: Object.values(suggestion) };
    nextPlayer(playerID, ctx, events, 'ResolveSuggestion');
};

export const showCard: MoveFn<GameState> = ({ G, playerID, events }, card: Card) => {
    if (
        !G.pendingSuggestion ||
        G.pendingSuggestion.suggester === playerID ||
        !G.players[playerID].hand.includes(card) ||
        !G.pendingSuggestion.cards.includes(card) ||
        G.players[G.pendingSuggestion.suggester].seenCards.includes(card)
    )
        return INVALID_MOVE;

    G.players[G.pendingSuggestion.suggester].seenCards.push(card);
    events.endTurn();
};

export const noCard: MoveFn<GameState> = ({ G, playerID, ctx, events }) => {
    const suggestion = G.pendingSuggestion;
    if (!suggestion) return INVALID_MOVE;
    if (suggestion.suggester === playerID) return INVALID_MOVE;

    const playerHand = G.players[playerID].hand;
    const suggesterSeen = G.players[suggestion.suggester].seenCards;

    const hasUnseenCard = playerHand.some(
        (card) => suggestion.cards.includes(card) && !suggesterSeen.includes(card)
    );
    if (hasUnseenCard) return INVALID_MOVE;

    const loop = nextPlayer(playerID, ctx, events, 'ResolveSuggestion');
    if (loop) {
        const unseenDeck = G.deck.filter((card) => !suggesterSeen.includes(card));
        if (unseenDeck.length)
            suggesterSeen.push(unseenDeck[Math.floor(Math.random() * unseenDeck.length)]);
        events.endTurn();
    }
};
