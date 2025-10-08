import type { TooltipConfig } from '@/types/client';
import type { PlayerState, Stage } from '@/types/game';
import type { PlayerID } from 'boardgame.io';

export function useNotesTooltip({
    players,
    playerID,
    stage,
    winner,
}: {
    players: Record<PlayerID, PlayerState>;
    playerID?: PlayerID;
    stage: Stage | null;
    winner: PlayerState | null | undefined;
}): TooltipConfig | null {
    if (
        playerID &&
        stage === 'Endgame' &&
        !players[playerID].isEliminated &&
        winner === undefined
    ) {
        return {
            label: 'Open your notes',
        };
    }

    return null;
}
