import type { Character, NodeID, Room, Weapon } from '../types/game.js';

export const CARDS: {
    suspects: Character[];
    weapons: Weapon[];
    rooms: Room[];
} = {
    suspects: ['scarlett', 'mustard', 'white', 'green', 'peacock', 'plum'],
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

export const SUSPECT_COLORS: Record<Character, string> = {
    scarlett: '#ff6b6b', // softer, slightly coral red — warm but not blinding
    mustard: '#ffd93d', // golden yellow — readable without glowing harshly
    white: '#e5e5e5', // off-white — avoids pure white glare
    green: '#4cd964', // apple green — lively but easy on the eyes
    peacock: '#5ac8fa', // soft cyan-blue — vibrant but not neon
    plum: '#af52de', // elegant violet — rich but not over-saturated
};

export const SUSPECT_POSITIONS: Record<Character, NodeID> = {
    scarlett: '16-0',
    mustard: '23-7', // 11-7 for End
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

export const PORT = 25565;

export const SUSPENSE_DELAY_MS = 1600;
