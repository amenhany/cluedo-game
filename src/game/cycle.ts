import type { TurnOrderConfig } from 'boardgame.io';

export const SkipEliminated: TurnOrderConfig = {
    first: () => 0,

    next: ({ G, ctx }) => {
        const playOrder = ctx.playOrder;
        let nextIndex = (ctx.playOrderPos + 1) % playOrder.length;

        for (let i = 0; i < playOrder.length; i++) {
            const nextPlayer = playOrder[nextIndex];
            if (!G.players[nextPlayer].isEliminated) {
                return nextIndex;
            }
            nextIndex = (nextIndex + 1) % playOrder.length;
        }

        return undefined;
    },
};
