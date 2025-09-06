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
            },
            '1': {
                id: '0',
                character: 'scarlett',
                hand: ['dagger'],
                position: 'study',
                steps: 0,
                availableMoves: [],
                seenCards: [],
            },
            '2': {
                id: '1',
                character: 'mustard',
                hand: ['spanner'],
                position: 'diningRoom',
                steps: 0,
                availableMoves: [],
                seenCards: [],
            },
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

    it('movePiece does nothing if node not allowed', () => {
        G.players['0'].availableMoves = ['7-4'];
        moves.movePiece(
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

    it('movePiece updates position if node allowed', () => {
        G.players['0'].availableMoves = ['7-4'];
        moves.movePiece(
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

    it('movePiece changes stage to Suggest if entered a room', () => {
        G.players['0'].availableMoves = ['kitchen'];
        moves.movePiece(
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
        expect(events.setStage).toHaveBeenCalledWith('Suggest');
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
        expect(events.setStage).toHaveBeenCalledWith('Suggest');
    });
});

describe('suggestions', () => {
    let G: GameState;
    let events: EventsAPI;

    beforeEach(() => {
        G = makeMockGame();
        events = makeEvents();
        vi.clearAllMocks();
        G.pendingSuggestion = {
            suggester: '1',
            cards: ['dagger', 'spanner', 'study'],
        };
    });

    it('makeSuggestion sets pendingSuggestion and advances turn', () => {
        moves.makeSuggestion(
            {
                G,
                playerID: '1',
                events,
                random: mockRandom() as unknown as RandomAPI,
                log: null as unknown as LogAPI,
                ctx: mockCtx,
            },
            { suspect: 'scarlett', weapon: 'dagger', room: 'study' }
        );

        expect(G.pendingSuggestion).toEqual({
            suggester: '1',
            cards: ['scarlett', 'dagger', 'study'],
        });
        expect(events.setActivePlayers).toHaveBeenCalled();
    });

    it('showCard adds card to suggester seenCards and ends stage', () => {
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
        expect(events.endTurn).toHaveBeenCalled();
    });
});
