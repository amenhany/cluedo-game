import type { Ctx } from 'boardgame.io';
import type { GameState, Room, Weapon } from '../types/game';
import type { RandomAPI } from 'boardgame.io/dist/types/src/plugins/random/random';
import { CARDS, CHARACTERS, SUSPECT_POSITIONS } from './constants';

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
            position: SUSPECT_POSITIONS[CHARACTERS[i]],
            hand: [],
            seenCards: [],
            isEliminated: false,
        };
    }

    const rem = deck.length % ctx.numPlayers;
    for (let i = 0; i < deck.length - rem; i++) {
        players[i % ctx.numPlayers].hand.push(deck[i]);
    }
    if (rem) deck = deck.slice(-1 * rem);
    else deck = [];

    const weapons = generateWeaponPositions(random);

    return {
        players,
        weapons,
        envelope,
        deck,
    };
};

function generateWeaponPositions(random: RandomAPI): Record<Weapon, Room> {
    const shuffledRooms = random.Shuffle([...CARDS.rooms]);
    const shuffledWeapons = random.Shuffle([...CARDS.weapons]);

    const mapping: Record<Weapon, Room> = {} as Record<Weapon, Room>;

    for (let i = 0; i < shuffledWeapons.length; i++) {
        const weapon = shuffledWeapons[i];
        mapping[weapon] = shuffledRooms[i];
    }

    return mapping;
}
