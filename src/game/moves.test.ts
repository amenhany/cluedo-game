import { describe, it, expect, vi, beforeEach } from 'vitest';
import { moves } from './moves';
import type { GameState } from '../types/game';
import type { RandomAPI } from 'boardgame.io/dist/types/src/plugins/random/random';
import type { EventsAPI } from 'boardgame.io/dist/types/src/plugins/plugin-events';
import type { LogAPI } from 'boardgame.io/dist/types/src/plugins/plugin-log';
import type { Ctx } from 'boardgame.io';

function makeMockGame(): GameState {
    return {
        players: {
            '0': {
                id: '0',
                character: 'scarlet',
                hand: [],
                position: '6-4',
                steps: 0,
                availableMoves: [],
            },
        },
        envelope: [],
        deck: [],
    };
}

function mockRandom() {
    return {
        Die: () => Math.ceil(Math.random() * 6),
    } as unknown as RandomAPI;
}

const events = {
    endTurn: vi.fn(),
} as unknown as EventsAPI;

describe('moves', () => {
    let G: GameState;
    beforeEach(() => {
        G = makeMockGame();
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
    });
});
