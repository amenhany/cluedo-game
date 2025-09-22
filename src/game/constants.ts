import type { Character, NodeID, Room, Weapon } from '../types/game';

export const CARDS: {
    suspects: Character[];
    weapons: Weapon[];
    rooms: Room[];
} = {
    suspects: ['scarlett', 'mustard', 'plum', 'peacock', 'green', 'white'],
    weapons: ['candlestick', 'dagger', 'leadPipe', 'revolver', 'rope', 'spanner'],
    rooms: [
        'kitchen',
        'ballroom',
        'conservatory',
        'diningRoom',
        'lounge',
        'hall',
        'study',
        'library',
        'billiardRoom',
    ],
};

export const CHARACTERS: Record<number, Character> = {
    0: 'scarlett',
    1: 'mustard',
    2: 'white',
    3: 'green',
    4: 'peacock',
    5: 'plum',
};

export const SUSPECT_POSITIONS: Record<Character, NodeID> = {
    scarlett: '11-7', // 16-0
    mustard: '11-7', // 23-7
    white: '14-24',
    green: '9-24',
    peacock: '0-18',
    plum: '0-5',
};

// export const SUSPECT_POSITIONS: Record<Character, NodeID> = {
//     scarlett: 'conservatory',
//     mustard: 'conservatory',
//     white: 'conservatory',
//     green: 'conservatory',
//     peacock: 'conservatory',
//     plum: 'conservatory',
// };

export const BOARD_COLUMNS = 25;
export const BOARD_ROWS = 25;
export const OFFSET_X = 1;
export const OFFSET_Y = 0;
