import type { Ctx, DefaultPluginAPIs } from 'boardgame.io';
import type { Card, GameState, Room, SetupData, Weapon } from '../types/game.js';
import { CARDS, SUSPECT_POSITIONS } from './constants.js';

export const setup = (
    {
        ctx,
        random,
    }: {
        ctx: Ctx;
        random: DefaultPluginAPIs['random'];
    },
    setupData: SetupData | undefined
): GameState => {
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

    const rules = setupData?.rules || {
        returnPlayersAfterSuggestion: false,
    };

    const players: GameState['players'] = {};
    const realPlayers = setupData?.players;
    const takenCharacters = realPlayers?.map((player) => player.data.character) || [];

    for (let i = 0; i < 6; i++) {
        const player = realPlayers?.find((p) => p.id === i);
        let character = player?.data.character;
        if (!character) {
            character = CARDS.suspects.find((c) => !takenCharacters.includes(c))!;
            takenCharacters.push(character);
        }
        players[i] = {
            id: i.toString(),
            name: player?.name || '',
            character,
            position: SUSPECT_POSITIONS[character],
            hand: [],
            seenCards: [],
            isEliminated: false,
        };

        if (setupData && setupData.players.find((p) => p.id === i) === undefined)
            players[i].isEliminated = true;
    }

    const playerCount = realPlayers?.length ?? ctx.numPlayers;
    const rem = deck.length % playerCount;
    const handArr = realPlayers?.map((p) => ({ ...p, hand: [] as Card[] }));

    if (handArr) {
        for (let i = 0; i < deck.length - rem; i++) {
            handArr[i % playerCount].hand.push(deck[i]);
        }

        handArr.forEach((p) => {
            const id = p.id.toString();
            if (players[id]) players[id].hand = p.hand;
        });
    }

    if (rem) deck = deck.slice(-1 * rem);
    else deck = [];

    const weapons = generateWeaponPositions(random);

    return {
        players,
        weapons,
        rules,
        envelope,
        deck,
    };
};

function generateWeaponPositions(
    random: DefaultPluginAPIs['random']
): Record<Weapon, Room> {
    const shuffledRooms = random.Shuffle([...CARDS.rooms]);
    const shuffledWeapons = random.Shuffle([...CARDS.weapons]);

    const mapping: Record<Weapon, Room> = {} as Record<Weapon, Room>;

    for (let i = 0; i < shuffledWeapons.length; i++) {
        const weapon = shuffledWeapons[i];
        mapping[weapon as Weapon] = shuffledRooms[i] as Room;
    }

    return mapping;
}
