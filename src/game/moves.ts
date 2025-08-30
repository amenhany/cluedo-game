import type { Move } from 'boardgame.io';
import type { GameState, NodeID } from '../types/game';
import { getReachableNodes } from './board/getReachableNodes';
import { cluedoGraph } from './board/boardGraph';
import { INVALID_MOVE } from 'boardgame.io/core';

const rollDice: Move<GameState> = ({ G, playerID, random }) => {
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

const movePiece: Move<GameState> = ({ G, playerID, events }, nodeID: NodeID) => {
    const player = G.players[playerID];
    const allowed = player.availableMoves ?? [];
    if (!allowed.includes(nodeID)) return INVALID_MOVE;
    player.position = nodeID;
    player.steps = 0;
    player.availableMoves = [];

    if (cluedoGraph[nodeID].type === 'tile') events.endTurn();
};

export const moves = {
    rollDice,
    movePiece,
};
