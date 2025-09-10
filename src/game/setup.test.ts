import { beforeAll, describe, expect, it } from 'vitest';
import { CARDS } from './constants';
import { InitializeGame } from 'boardgame.io/internal';
import { Cluedo } from '.';
import type { GameState } from '../types/game';

describe('Game Setup Tests', () => {
    let gameState: GameState;
    beforeAll(() => {
        gameState = InitializeGame({ game: Cluedo, numPlayers: 4 }).G;
    });

    it('envelope has exactly 3 cards, 1 of each type', () => {
        const [suspect, weapon, room] = gameState.envelope;

        expect(CARDS.suspects).toContain(suspect);
        expect(CARDS.weapons).toContain(weapon);
        expect(CARDS.rooms).toContain(room);
    });

    it('deck does not contain envelope cards', () => {
        gameState.envelope.forEach((card) => {
            expect(gameState.deck).not.toContain(card);
        });
    });

    it('deals cards evenly among players', () => {
        const handSizes = Object.values(gameState.players).map((p) => p.hand.length);
        const min = Math.min(...handSizes);
        const max = Math.max(...handSizes);

        expect(max - min).toBeLessThanOrEqual(1);
    });

    it('remaining deck not dealt', () => {
        Object.values(gameState.players).forEach((player) => {
            player.hand.forEach((card) => {
                expect(gameState.deck).not.toContain(card);
            });
        });
    });
});
