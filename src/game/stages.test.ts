import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as moves from './moves';
import { INVALID_MOVE } from 'boardgame.io/core';
import type { GameState } from '../types/game';
import type { EventsAPI } from 'boardgame.io/dist/types/src/plugins/plugin-events';
import type { RandomAPI } from 'boardgame.io/dist/types/src/plugins/random/random';
import type { LogAPI } from 'boardgame.io/dist/types/src/plugins/plugin-log';
import type { Ctx } from 'boardgame.io';

function makeMockGame(): GameState {
    return {
        players: {
            '0': {
                id: '0',
                name: 'player0',
                character: 'scarlett',
                hand: [],
                position: 'hall',
                steps: 0,
                availableMoves: [],
                seenCards: [],
                isEliminated: false,
            },
            '1': {
                id: '1',
                name: 'player1',
                character: 'mustard',
                hand: ['rope'],
                position: 'study',
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
        rules: {
            returnPlayersAfterSuggestion: true,
        },
    };
}

const mockCtx = { currentPlayer: '0', numPlayers: 2 } as unknown as Ctx;

function mockRandom() {
    return { Die: () => 6 } as unknown as RandomAPI;
}

function makeEvents() {
    return {
        setStage: vi.fn(),
        setActivePlayers: vi.fn(),
        endTurn: vi.fn(),
    } as unknown as EventsAPI;
}

describe('core flow rules', () => {
    let G: GameState;
    let events: EventsAPI;

    beforeEach(() => {
        G = makeMockGame();
        events = makeEvents();
        vi.clearAllMocks();
    });

    it('movePlayer should end turn if valid hall move', () => {
        G.players['0'].availableMoves = ['7-4'];
        moves.movePlayer(
            {
                G,
                ctx: mockCtx,
                playerID: '0',
                events,
                random: mockRandom(),
                log: null as unknown as LogAPI,
            },
            '7-4'
        );
        expect(G.players['0'].steps).toBe(0);
        expect(G.players['0'].availableMoves).toEqual([]);
        expect(events.endTurn).toHaveBeenCalled();
    });

    it('showCard should end turn, clear suggestion and return suspect', () => {
        G.players['1'].position = 'study';
        G.pendingSuggestion = {
            suggester: '0',
            suspect: 'mustard',
            weapon: 'rope',
            room: 'study',
            suspectOrigin: '7-4',
        };
        moves.showCard(
            {
                G,
                ctx: mockCtx,
                playerID: '1',
                events,
                random: mockRandom(),
                log: null as unknown as LogAPI,
            },
            'rope'
        );
        expect(events.endTurn).toHaveBeenCalled();
        expect(G.players['1'].position).toBe('7-4');
        expect(G.pendingSuggestion).toBeUndefined();
    });

    it('noCard should end turn if no matches left', () => {
        G.pendingSuggestion = {
            suggester: '0',
            suspect: 'scarlett',
            weapon: 'dagger',
            room: 'study',
            suspectOrigin: 'study',
        };
        G.players['1'].hand = [];
        moves.noCard({
            G,
            ctx: mockCtx,
            playerID: '1',
            events,
            random: mockRandom(),
            log: null as unknown as LogAPI,
        });
        expect(events.endTurn).toHaveBeenCalled();
        expect(G.pendingSuggestion).toBeUndefined();
    });

    it('endTurn resets steps and moves for current player', () => {
        G.players['0'].steps = 3;
        G.players['0'].availableMoves = ['7-4'];
        moves.movePlayer(
            {
                G,
                ctx: mockCtx,
                playerID: '0',
                events,
                random: mockRandom(),
                log: null as unknown as LogAPI,
            },
            '7-4'
        );
        expect(events.endTurn).toHaveBeenCalled();
        expect(G.players['0'].steps).toBe(0);
        expect(G.players['0'].availableMoves).toEqual([]);
    });

    it('startSuggestion moves current player to Suggest stage', () => {
        G.players['0'].position = 'study';
        moves.startSuggestion({
            G,
            ctx: mockCtx,
            playerID: '0',
            events,
            random: mockRandom(),
            log: null as unknown as LogAPI,
        });
        expect(events.setStage).toHaveBeenCalledWith('Suggest');
    });

    it('movePlayer into a room sets stage RoomAction', () => {
        G.players['0'].availableMoves = ['kitchen'];
        moves.movePlayer(
            {
                G,
                ctx: mockCtx,
                playerID: '0',
                events,
                random: mockRandom(),
                log: null as unknown as LogAPI,
            },
            'kitchen'
        );
        expect(G.players['0'].position).toBe('kitchen');
        expect(events.setStage).toHaveBeenCalledWith('RoomAction');
    });

    it('useSecretPassage sets stage RoomAction', () => {
        G.players['1'].position = 'study'; // assume study has secret passage
        moves.useSecretPassage({
            G,
            ctx: mockCtx,
            playerID: '1',
            events,
            random: mockRandom(),
            log: null as unknown as LogAPI,
        });
        expect(events.setStage).toHaveBeenCalledWith('RoomAction');
    });

    it('makeSuggestion advances to ResolveSuggestion for next player', () => {
        G.players['0'].position = 'study';
        G.pendingSuggestion = {
            suggester: '0',
            suspect: 'scarlett',
            weapon: 'rope',
            room: 'study',
            suspectOrigin: 'study',
        };
        moves.makeSuggestion({
            G,
            ctx: mockCtx,
            playerID: '0',
            events,
            random: mockRandom(),
            log: null as unknown as LogAPI,
        });
        expect(events.setActivePlayers).toHaveBeenCalled();
    });

    it('movePlayer into a CLUE sets stage Endgame', () => {
        G.players['0'].availableMoves = ['end'];
        moves.movePlayer(
            {
                G,
                ctx: mockCtx,
                playerID: '0',
                events,
                random: mockRandom(),
                log: null as unknown as LogAPI,
            },
            'end'
        );
        expect(G.players['0'].position).toBe('end');
        expect(events.setStage).toHaveBeenCalledWith('Endgame');
    });

    it('disallowed moves return INVALID_MOVE in wrong stage', () => {
        const result = moves.showCard(
            {
                G,
                ctx: mockCtx,
                playerID: '0',
                events,
                random: mockRandom(),
                log: null as unknown as LogAPI,
            },
            'rope'
        );
        expect(result).toBe(INVALID_MOVE);
    });
});
