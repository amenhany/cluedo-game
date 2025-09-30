import type { Game } from 'boardgame.io';
import { reset } from './moves.js';
import { setup } from './setup.js';
import * as stages from './stages.js';
import type { GameState, SetupData } from '@/types/game.js';
import { SkipEliminated } from './cycle.js';

export const Cluedo: Game<GameState, Record<string, unknown>, SetupData> = {
    name: 'cluedo',
    setup,
    turn: {
        order: SkipEliminated,
        activePlayers: {
            currentPlayer: 'TurnAction',
        },
        stages,
        minMoves: 1,
        onEnd: reset,
    },
    endIf: ({ G }) => {
        if (Object.values(G.players).every((player) => player.isEliminated))
            return { winner: null };
    },
    disableUndo: true,
};
