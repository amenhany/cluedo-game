import type { Game } from 'boardgame.io';
import { reset } from './moves';
import { setup } from './setup';
import * as stages from './stages';
import type { GameState } from '@/types/game';
import { SkipEliminated } from './cycle';

export const Cluedo: Game<GameState> = {
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
