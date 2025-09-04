import type { Ctx } from 'boardgame.io';
import type { Character, GameState, Room, Tile, Weapon } from '../types/game';
import type { RandomAPI } from 'boardgame.io/dist/types/src/plugins/random/random';

export const CARDS: {
    suspects: Character[];
    weapons: Weapon[];
    rooms: Room[];
} = {
    suspects: ['scarlet', 'mustard', 'plum', 'peacock', 'green', 'white'],
    weapons: ['candlestick', 'knife', 'leadPipe', 'revolver', 'rope', 'wrench'],
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

const CHARACTERS: Record<number, Character> = {
    0: 'scarlet',
    1: 'mustard',
    2: 'white',
    3: 'green',
    4: 'peacock',
    5: 'plum',
};

const START_POSITIONS: Record<number, Tile> = {
    0: '16-0', // Scarlet '16-0'
    1: '23-7', // Mustard
    2: '14-24', // White
    3: '9-24', // Green
    4: '0-18', // Peacock
    5: '0-5', // Plum
};

export const setup = ({ ctx, random }: { ctx: Ctx; random: RandomAPI }): GameState => {
    const envelope: GameState['envelope'] = [
        random.Shuffle(CARDS.suspects)[0],
        random.Shuffle(CARDS.weapons)[0],
        random.Shuffle(CARDS.rooms)[0],
    ];

    // Remaining deck
    let deck: GameState['deck'] = [
        ...CARDS.suspects.filter((c) => !envelope.includes(c)),
        ...CARDS.weapons.filter((c) => !envelope.includes(c)),
        ...CARDS.rooms.filter((c) => !envelope.includes(c)),
    ];
    deck = random.Shuffle(deck);

    const players: GameState['players'] = {};

    for (let i = 0; i < ctx.numPlayers; i++) {
        players[i] = {
            id: i.toString(),
            character: CHARACTERS[i],
            position: START_POSITIONS[i],
            hand: [],
            seenCards: [],
        };
    }

    const rem = deck.length % ctx.numPlayers;
    for (let i = 0; i < deck.length - rem; i++) {
        players[i % ctx.numPlayers].hand.push(deck[i]);
    }
    if (rem) deck = deck.slice(-1 * rem);
    else deck = [];

    return {
        players,
        envelope,
        deck,
    };
};
