import { Client } from 'boardgame.io/client';
import { Cluedo } from '.';
import { expect, it } from 'vitest';
import type { Ctx, Game } from 'boardgame.io';

it('should end the game when all players are eliminated', () => {
    const CluedoCustomScenario = {
        ...Cluedo,
        setup: () => ({
            players: {
                '0': {
                    id: '0',
                    character: 'scarlett',
                    hand: [],
                    position: 'hall',
                    steps: 0,
                    availableMoves: [],
                    seenCards: [],
                    isEliminated: true,
                },
                '1': {
                    id: '1',
                    character: 'mustard',
                    hand: [],
                    position: 'study',
                    steps: 0,
                    availableMoves: [],
                    seenCards: [],
                    isEliminated: true,
                },
            },
            weapons: {},
            envelope: [],
            deck: [],
        }),
    };

    const client = Client({ game: CluedoCustomScenario as Game });
    const { ctx } = client.getState() as { ctx: Ctx };
    expect(ctx.gameover).toEqual({ winner: null });
});
