import { setup } from './setup';
import { ResolveSuggestion, Suggest, TurnAction } from './stages';

export const Cluedo = {
    setup: setup,
    turn: {
        stage: 'TurnAction',
        activePlayers: {
            currentPlayer: 'TurnAction',
        },
        stages: {
            TurnAction,
            Suggest,
            ResolveSuggestion,
        },
    },
};
