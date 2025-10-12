import { beforeAll, describe, expect, it } from 'vitest';
import { CARDS } from './constants';
import { InitializeGame } from 'boardgame.io/internal';
import { Cluedo } from '.';
import type { GameState, SetupData } from '../types/game';

function makeSetupData(players: SetupData['players']): SetupData {
    return {
        started: true,
        rules: { returnPlayersAfterSuggestion: true, spectatorsCanShowCards: true },
        players,
    };
}

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
        const handSizes = Object.values(gameState.players)
            .filter((p) => !p.isEliminated)
            .map((p) => p.hand.length);
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

describe('setupData with unordered or missing player IDs', () => {
    it('handles players not in order (e.g. 2,0,1)', () => {
        const setupData = makeSetupData([
            { id: 2, name: 'C', data: { character: CARDS.suspects[2] } },
            { id: 0, name: 'A', data: { character: CARDS.suspects[0] } },
            { id: 1, name: 'B', data: { character: CARDS.suspects[1] } },
        ]);

        const { G: state } = InitializeGame({
            game: Cluedo,
            numPlayers: setupData.players.length,
            setupData,
        });

        // IDs 0,1,2 should be active
        for (const id of [0, 1, 2]) {
            const p = state.players[id];
            expect(p.isEliminated).toBe(false);
            expect(p.character).toBe(CARDS.suspects[id]);
        }

        // IDs beyond max (3,4,5) should be eliminated
        for (const id of [3, 4, 5]) {
            expect(state.players[id].isEliminated).toBe(true);
        }
    });

    it('handles missing IDs in between (e.g. players 0, 2, 5)', () => {
        const setupData = makeSetupData([
            { id: 0, name: 'Host', data: { character: CARDS.suspects[0] } },
            { id: 2, name: 'Skip1', data: { character: CARDS.suspects[2] } },
            { id: 5, name: 'Skip2', data: { character: CARDS.suspects[5] } },
        ]);

        const { G: state }: { G: GameState } = InitializeGame({
            game: Cluedo,
            numPlayers: setupData.players.length,
            setupData,
        });

        // IDs 0,2,5 are active
        expect(state.players[0].isEliminated).toBe(false);
        expect(state.players[2].isEliminated).toBe(false);
        expect(state.players[5].isEliminated).toBe(false);

        // Missing IDs should be eliminated
        for (const id of [1, 3, 4]) {
            expect(state.players[id].isEliminated).toBe(true);
        }

        // Ensure all used characters match provided ones
        const activeCharacters = Object.values(state.players)
            .filter((p) => !p.isEliminated)
            .map((p) => p.character);

        expect(activeCharacters).toContain(CARDS.suspects[0]);
        expect(activeCharacters).toContain(CARDS.suspects[2]);
        expect(activeCharacters).toContain(CARDS.suspects[5]);
    });

    it('still deals cards evenly even when IDs skipped', () => {
        const setupData = makeSetupData([
            { id: 0, name: 'A', data: { character: CARDS.suspects[0] } },
            { id: 1, name: 'B', data: { character: CARDS.suspects[2] } },
        ]);

        const { G: state }: { G: GameState } = InitializeGame({
            game: Cluedo,
            numPlayers: setupData.players.length,
            setupData,
        });

        const activeHands = Object.values(state.players)
            .filter((p) => !p.isEliminated)
            .map((p) => p.hand.length);

        const min = Math.min(...activeHands);
        const max = Math.max(...activeHands);
        expect(max - min).toBeLessThanOrEqual(1);
    });
});
