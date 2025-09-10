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
} from './moves';

export const TurnAction = {
    moves: {
        rollDice,
        movePlayer,
        useSecretPassage,
        startSuggestion,
    },
};

export const RoomAction = {
    moves: {
        startSuggestion,
        endTurn,
    },
    next: 'TurnAction',
};

export const Suggest = {
    moves: {
        setSuggestion,
        makeSuggestion,
    },
};

export const ResolveSuggestion = {
    moves: {
        showCard,
        noCard,
    },
    next: 'TurnAction',
};
