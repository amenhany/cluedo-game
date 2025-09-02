import {
    endTurn,
    makeSuggestion,
    movePiece,
    noCard,
    rollDice,
    showCard,
    useSecretPassage,
} from './moves';

export const TurnAction = {
    moves: {
        rollDice,
        movePiece,
        useSecretPassage,
        makeSuggestion,
    },
};

export const Suggest = {
    moves: {
        makeSuggestion,
        endTurn,
    },
    next: 'TurnAction',
};

export const ResolveSuggestion = {
    moves: {
        showCard,
        noCard,
    },
    next: 'TurnAction',
};
