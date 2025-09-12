import type { StageConfig } from 'boardgame.io';
import {
    endTurn,
    setSuggestion,
    makeSuggestion,
    movePlayer,
    noCard,
    rollDice,
    showCard,
    useSecretPassage,
    startSuggestion,
    makeAccusation,
} from './moves';

export const TurnAction: StageConfig = {
    moves: {
        rollDice: {
            move: rollDice,
            noLimit: true,
        },
        movePlayer,
        useSecretPassage,
        startSuggestion,
    },
};

export const RoomAction: StageConfig = {
    moves: {
        startSuggestion,
        endTurn,
    },
    next: 'TurnAction',
};

export const Suggest: StageConfig = {
    moves: {
        setSuggestion: {
            move: setSuggestion,
            noLimit: true,
        },
        makeSuggestion,
    },
};

export const ResolveSuggestion: StageConfig = {
    moves: {
        showCard,
        noCard,
    },
    next: 'TurnAction',
};

export const Endgame: StageConfig = {
    moves: {
        makeAccusation,
    },
    next: 'TurnAction',
};
