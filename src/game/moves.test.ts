import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as moves from './moves';
import type { GameState } from '../types/game';
import type { RandomAPI } from 'boardgame.io/dist/types/src/plugins/random/random';
import type { EventsAPI } from 'boardgame.io/dist/types/src/plugins/plugin-events';
import type { LogAPI } from 'boardgame.io/dist/types/src/plugins/plugin-log';
import type { Ctx } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';

function makeMockGame(): GameState {
    return {
        players: {
            '0': {
                id: '0',
                character: 'scarlett',
                hand: [],
                position: '6-4',
                steps: 0,
                availableMoves: [],
                seenCards: [],
                isEliminated: false,
            },
            '1': {
                id: '0',
                character: 'scarlett',
                hand: ['dagger'],
                position: 'study',
                steps: 0,
                availableMoves: [],
                seenCards: [],
                isEliminated: false,
            },
            '2': {
                id: '1',
                character: 'mustard',
                hand: ['spanner'],
                position: 'diningRoom',
                steps: 0,
                availableMoves: [],
                seenCards: [],
                isEliminated: false,
            },
        },
        weapons: {
            candlestick: 'hall',
            dagger: 'study',
            leadPipe: 'kitchen',
            revolver: 'library',
            rope: 'ballroom',
            spanner: 'diningRoom',
        },
        envelope: [],
        deck: [],
    };
}

const mockCtx = { currentPlayer: '0', numPlayers: 3 } as unknown as Ctx;

function mockRandom() {
    return {
        Die: () => Math.ceil(Math.random() * 6),
    } as unknown as RandomAPI;
}

function makeEvents() {
    return {
        setStage: vi.fn(),
        endTurn: vi.fn(),
        endGame: vi.fn(),
        setActivePlayers: vi.fn(),
    } as unknown as EventsAPI;
}

describe('moves', () => {
    let G: GameState;
    let events: EventsAPI;

    beforeEach(() => {
        G = makeMockGame();
        events = makeEvents();
        vi.clearAllMocks();
    });

    it('rollDice sets steps and availableMoves', () => {
        moves.rollDice({
            G,
            playerID: '0',
            events,
            random: mockRandom(),
            log: null as unknown as LogAPI,
            ctx: null as unknown as Ctx,
        });

        expect(G.players['0'].steps).toBeGreaterThan(0);
        expect(G.players['0'].availableMoves?.length).toBeGreaterThan(0);
    });

    it('rollDice cannot be called twice', () => {
        moves.rollDice({
            G,
            playerID: '0',
            events,
            random: mockRandom(),
            log: null as unknown as LogAPI,
            ctx: null as unknown as Ctx,
        });

        const steps = G.players['0'].steps;
        moves.rollDice({
            G,
            playerID: '0',
            events,
            random: mockRandom(),
            log: null as unknown as LogAPI,
            ctx: null as unknown as Ctx,
        });

        expect(G.players['0'].steps).toEqual(steps);
    });

    it('movePlayer does nothing if node not allowed', () => {
        G.players['0'].availableMoves = ['7-4'];
        moves.movePlayer(
            {
                G,
                playerID: '0',
                events,
                random: mockRandom(),
                log: null as unknown as LogAPI,
                ctx: null as unknown as Ctx,
            },
            '8-4'
        );
        expect(G.players['0'].position).toBe('6-4'); // unchanged
        expect(events.endTurn).not.toHaveBeenCalled();
        expect(events.setStage).not.toHaveBeenCalled();
    });

    it('movePlayer updates position if node allowed', () => {
        G.players['0'].availableMoves = ['7-4'];
        moves.movePlayer(
            {
                G,
                playerID: '0',
                events,
                random: mockRandom() as unknown as RandomAPI,
                log: null as unknown as LogAPI,
                ctx: null as unknown as Ctx,
            },
            '7-4'
        );
        expect(G.players['0'].position).toBe('7-4');
        expect(G.players['0'].steps).toEqual(0);
        expect(G.players['0'].availableMoves).toEqual([]);
        expect(events.endTurn).toHaveBeenCalled();
        expect(events.setStage).not.toHaveBeenCalled();
    });

    it('movePlayer changes stage to Suggest if entered a room', () => {
        G.players['0'].availableMoves = ['kitchen'];
        moves.movePlayer(
            {
                G,
                playerID: '0',
                events,
                random: mockRandom() as unknown as RandomAPI,
                log: null as unknown as LogAPI,
                ctx: null as unknown as Ctx,
            },
            'kitchen'
        );
        expect(G.players['0'].position).toBe('kitchen');
        expect(G.players['0'].steps).toEqual(0);
        expect(G.players['0'].availableMoves).toEqual([]);
        expect(events.endTurn).not.toHaveBeenCalled();
        expect(events.setStage).toHaveBeenCalledWith('RoomAction');
    });

    it('useSecretRoom moves player if secret passage exists', () => {
        moves.useSecretPassage({
            G,
            playerID: '1',
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
            ctx: mockCtx,
        });
        expect(G.players['1'].position).toBe('kitchen');

        const result = moves.useSecretPassage({
            G,
            playerID: '2',
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
            ctx: mockCtx,
        });
        expect(result).toBe(INVALID_MOVE);
        expect(G.players['2'].position).toBe('diningRoom');
        expect(events.setStage).toHaveBeenCalledWith('RoomAction');
    });
});

describe('startSuggestion', () => {
    let G: GameState;
    let events: EventsAPI;

    beforeEach(() => {
        G = makeMockGame();
        events = makeEvents();
        vi.clearAllMocks();
    });

    it('creates a fresh pendingSuggestion when in a room', () => {
        expect(G.pendingSuggestion).toBeUndefined(); // nothing before

        const result = moves.startSuggestion({
            G,
            playerID: '1',
            ctx: mockCtx,
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
        });

        expect(result).toBeUndefined(); // valid move returns nothing
        expect(G.pendingSuggestion).toEqual({
            suggester: '1',
            suspect: null,
            weapon: null,
            room: 'study',
            suspectOrigin: null,
        });
        expect(events.setStage).toHaveBeenCalledWith('Suggest');
    });

    it('returns INVALID_MOVE if player not in a room', () => {
        expect(G.pendingSuggestion).toBeUndefined();

        const result = moves.startSuggestion({
            G,
            playerID: '0', // "6-4" is hallway
            ctx: mockCtx,
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
        });

        expect(result).toBe(INVALID_MOVE);
        expect(G.pendingSuggestion).toBeUndefined();
        expect(events.setStage).not.toHaveBeenCalled();
    });

    it('overwrites any previous suggestion with a fresh one', () => {
        G.pendingSuggestion = {
            suggester: '0',
            suspect: 'scarlett',
            weapon: 'rope',
            room: 'kitchen',
            suspectOrigin: null,
        };

        moves.startSuggestion({
            G,
            playerID: '1',
            ctx: mockCtx,
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
        });

        expect(G.pendingSuggestion).toEqual({
            suggester: '1',
            suspect: null,
            weapon: null,
            room: 'study',
            suspectOrigin: null,
        });
    });
});

describe('setSuggestion', () => {
    let G: GameState;
    let events: EventsAPI;

    beforeEach(() => {
        G = makeMockGame();
        events = makeEvents();
        vi.clearAllMocks();
        G.players['0'].position = 'kitchen';
    });

    it('sets a suspect in pendingSuggestion with their old position then changes their position', () => {
        const move = moves.setSuggestion(
            {
                G,
                playerID: '0',
                ctx: mockCtx,
                events,
                random: mockRandom() as unknown as RandomAPI,
                log: null as unknown as LogAPI,
            },
            'suspect',
            'mustard'
        );

        expect(move).toBeUndefined(); // successful moves return nothing
        expect(G.pendingSuggestion).toMatchObject({
            suggester: '0',
            suspect: 'mustard',
            weapon: null,
            room: 'kitchen',
            suspectOrigin: 'diningRoom',
        });
        expect(G.players['2'].position).toBe('kitchen');
    });

    it('returns INVALID_MOVE if not in a room', () => {
        G.players['0'].position = '7-4';
        const result = moves.setSuggestion(
            {
                G,
                playerID: '0',
                ctx: mockCtx,
                events,
                random: mockRandom() as unknown as RandomAPI,
                log: null as unknown as LogAPI,
            },
            'weapon',
            'dagger'
        );

        expect(result).toBe(INVALID_MOVE);
        expect(G.pendingSuggestion).toBeUndefined();
    });

    it('preserves previously set fields', () => {
        G.pendingSuggestion = {
            suggester: '0',
            suspect: 'scarlett',
            weapon: null,
            room: 'kitchen',
            suspectOrigin: null,
        };

        moves.setSuggestion(
            {
                G,
                playerID: '0',
                ctx: mockCtx,
                events,
                random: mockRandom() as unknown as RandomAPI,
                log: null as unknown as LogAPI,
            },
            'weapon',
            'candlestick'
        );

        expect(G.pendingSuggestion).toMatchObject({
            suggester: '0',
            suspect: 'scarlett',
            weapon: 'candlestick',
            room: 'kitchen',
        });
    });
});

describe('setSuggestion - weapon handling', () => {
    let G: GameState;
    let events: EventsAPI;

    beforeEach(() => {
        G = makeMockGame();
        events = makeEvents();
        vi.clearAllMocks();
        G.players['0'].position = 'kitchen';
        G.pendingSuggestion = {
            suggester: '0',
            suspect: 'scarlett',
            weapon: 'dagger', // original weapon
            room: 'kitchen',
            suspectOrigin: '6-4',
        };
    });

    it('moves the new weapon into the suggestion room', () => {
        moves.setSuggestion(
            {
                G,
                playerID: '0',
                ctx: mockCtx,
                events,
                random: mockRandom(),
                log: null as unknown as LogAPI,
            },
            'weapon',
            'rope'
        );

        expect(G.pendingSuggestion?.weapon).toBe('rope');
        expect(G.weapons['rope']).toBe('kitchen');
    });

    it('swaps position of weapons between rooms', () => {
        moves.setSuggestion(
            {
                G,
                playerID: '0',
                ctx: mockCtx,
                events,
                random: mockRandom(),
                log: null as unknown as LogAPI,
            },
            'weapon',
            'rope'
        );

        expect(G.weapons['dagger']).toBe('ballroom');
        expect(G.weapons['rope']).toBe('kitchen');
    });

    it('does nothing special if first weapon is being set', () => {
        G.pendingSuggestion!.weapon = null; // reset
        moves.setSuggestion(
            {
                G,
                playerID: '0',
                ctx: mockCtx,
                events,
                random: mockRandom(),
                log: null as unknown as LogAPI,
            },
            'weapon',
            'candlestick'
        );

        expect(G.weapons['candlestick']).toBe('kitchen');
        // nothing to "restore" since no original weapon
    });
});

describe('makeSuggestion', () => {
    let G: GameState;
    let events: EventsAPI;

    beforeEach(() => {
        G = makeMockGame();
        events = makeEvents();
        vi.clearAllMocks();
    });

    it('returns INVALID_MOVE if no pendingSuggestion', () => {
        const result = moves.makeSuggestion({
            G,
            playerID: '0',
            ctx: mockCtx,
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
        });
        expect(result).toBe(INVALID_MOVE);
    });

    it('returns INVALID_MOVE if suggestion has null fields', () => {
        G.pendingSuggestion = {
            suggester: '0',
            suspect: null,
            weapon: 'dagger',
            room: 'kitchen',
            suspectOrigin: null,
        };

        const result = moves.makeSuggestion({
            G,
            playerID: '0',
            ctx: mockCtx,
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
        });
        expect(result).toBe(INVALID_MOVE);
    });

    it('returns INVALID_MOVE if suggester moved out of the room', () => {
        G.pendingSuggestion = {
            suggester: '0',
            suspect: 'mustard',
            weapon: 'dagger',
            room: 'kitchen',
            suspectOrigin: null,
        };
        G.players['0'].position = 'ballroom'; // not same room

        const result = moves.makeSuggestion({
            G,
            playerID: '0',
            ctx: mockCtx,
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
        });
        expect(result).toBe(INVALID_MOVE);
    });

    it('advances game if suggestion is complete and valid', () => {
        G.players['0'].position = 'kitchen';
        G.pendingSuggestion = {
            suggester: '0',
            suspect: 'mustard',
            weapon: 'dagger',
            room: 'kitchen',
            suspectOrigin: 'diningRoom',
        };

        const result = moves.makeSuggestion({
            G,
            playerID: '0',
            ctx: mockCtx,
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
        });

        expect(result).not.toEqual(INVALID_MOVE);
        expect(events.setActivePlayers).toHaveBeenCalled();
    });
});

describe('resolve suggestions', () => {
    let G: GameState;
    let events: EventsAPI;

    beforeEach(() => {
        G = makeMockGame();
        events = makeEvents();
        vi.clearAllMocks();
        G.pendingSuggestion = {
            suggester: '1',
            suspect: 'scarlett',
            weapon: 'spanner',
            room: 'study',
            suspectOrigin: '6-4',
        };
    });

    it('showCard adds card to suggester seenCards and ends turn and resets suspect position', () => {
        G.players['0'].position = 'study';
        moves.showCard(
            {
                G,
                playerID: '2',
                events,
                random: mockRandom() as unknown as RandomAPI,
                log: null as unknown as LogAPI,
                ctx: mockCtx,
            },
            'spanner'
        );

        expect(G.players['1'].seenCards).toContain('spanner');
        expect(events.endTurn).toHaveBeenCalled();
        expect(G.pendingSuggestion).toBeUndefined();
        expect(G.players['0'].position).toBe('6-4');
    });

    it('skipShow passes if no unseen matching card, advances turn', () => {
        G.pendingSuggestion!.suggester = '0';
        G.players['1'].hand = ['spanner'];
        G.players['0'].seenCards = ['spanner'];

        moves.noCard({
            G,
            playerID: '1',
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
            ctx: mockCtx,
        });

        expect(events.setActivePlayers).toHaveBeenCalled();
    });

    it('skipShow invalid if player has unseen matching card', () => {
        G.pendingSuggestion!.suggester = '0';
        G.players['1'].hand = ['spanner']; // unseen by suggester
        G.players['0'].seenCards = [];

        const result = moves.noCard({
            G,
            playerID: '1',
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
            ctx: mockCtx,
        });
        expect(result).toBe(INVALID_MOVE);
        expect(events.setActivePlayers).not.toHaveBeenCalled();
    });

    it('loops back and reveals from deck if nobody can show', () => {
        G.players['0'].position = 'study';
        G.players['2'].hand = ['spanner'];
        G.players['1'].seenCards = ['spanner'];
        G.deck = ['ballroom'];
        moves.noCard({
            G,
            playerID: '2',
            events,
            random: mockRandom() as unknown as RandomAPI,
            log: null as unknown as LogAPI,
            ctx: mockCtx,
        });
        expect(G.players['1'].seenCards).toContain('ballroom');
        expect(G.players['0'].position).toBe('6-4');
        expect(G.pendingSuggestion).toBeUndefined();
        expect(events.endTurn).toHaveBeenCalled();
    });
});

describe('makeAccusation & suggestion turn order', () => {
    let G: GameState;
    let events: EventsAPI;

    beforeEach(() => {
        G = makeMockGame();
        events = makeEvents();
        vi.clearAllMocks();

        G.envelope = ['scarlett', 'dagger', 'study'];
    });

    it('eliminates a player if accusation is wrong', () => {
        moves.makeAccusation(
            {
                G,
                playerID: '0',
                ctx: mockCtx,
                events,
                random: mockRandom(),
                log: null as any,
            },
            {
                suspect: 'mustard',
                weapon: 'spanner',
                room: 'diningRoom',
            }
        );

        expect(G.players['0'].isEliminated).toBe(true);
        expect(events.endGame).not.toHaveBeenCalled();
        expect(events.endTurn).toHaveBeenCalled();
    });

    it('ends game with winner if accusation is correct', () => {
        moves.makeAccusation(
            {
                G,
                playerID: '1',
                ctx: mockCtx,
                events,
                random: mockRandom(),
                log: null as any,
            },
            {
                suspect: 'scarlett',
                weapon: 'dagger',
                room: 'study',
            }
        );

        expect(G.players['1'].isEliminated).toBe(false);
        expect(events.endGame).toHaveBeenCalledWith({ winner: '1' });
    });

    it('skips eliminated players when resolving suggestion', () => {
        // Simulate: player 1 is eliminated
        G.players['1'].isEliminated = true;

        // Player 0 makes a valid suggestion
        G.players['0'].position = 'study';
        G.pendingSuggestion = {
            suggester: '0',
            suspect: 'scarlett',
            weapon: 'dagger',
            room: 'study',
            suspectOrigin: '6-4',
        };

        moves.makeSuggestion({
            G,
            playerID: '0',
            ctx: { ...mockCtx, currentPlayer: '0' } as Ctx,
            events,
            random: mockRandom(),
            log: null as any,
        });

        // Should skip player 2 (eliminated) and set active players to 1
        expect(events.setActivePlayers).toHaveBeenCalledWith({
            value: { '2': 'ResolveSuggestion' },
        });
    });
});
