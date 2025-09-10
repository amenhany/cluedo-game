import { setup } from './setup';
import { ResolveSuggestion, RoomAction, Suggest, TurnAction } from './stages';

export const Cluedo = {
    setup: setup,
    turn: {
        stage: 'TurnAction',
        activePlayers: {
            currentPlayer: 'TurnAction',
        },
        stages: {
            TurnAction,
            RoomAction,
            Suggest,
            ResolveSuggestion,
        },
    },
};
