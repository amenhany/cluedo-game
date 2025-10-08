import { SUSPENSE_DELAY_MS } from '@/game/constants';
import type { TooltipConfig } from '@/types/client';
import type { PlayerState } from '@/types/game';
import type { PlayerID } from 'boardgame.io';
import { useEffect, useRef, useState } from 'react';

export function useGameOverTooltip({
    players,
    playerID,
    winner,
}: {
    players: Record<PlayerID, PlayerState>;
    playerID?: PlayerID;
    winner: PlayerState | null | undefined;
}): TooltipConfig | null {
    const eliminatedPlayers = useRef<PlayerID[]>([]);
    const [eliminatedPlayer, setEliminatedPlayer] = useState<PlayerState | null>(null);
    const [localWinner, setLocalWinner] = useState<PlayerState | null>();

    useEffect(() => {
        for (const player of Object.values(players)) {
            if (
                player.isEliminated &&
                player.hand.length !== 0 &&
                !eliminatedPlayers.current.includes(player.id)
            ) {
                const timeout = setTimeout(() => {
                    setEliminatedPlayer(player);
                    setTimeout(() => setEliminatedPlayer(null), 5000);
                }, SUSPENSE_DELAY_MS);
                eliminatedPlayers.current.push(player.id);

                return () => clearTimeout(timeout);
            }
        }
    }, [players, playerID]);

    useEffect(() => {
        setTimeout(() => setLocalWinner(winner), SUSPENSE_DELAY_MS);
    }, [winner]);

    if (localWinner === null) {
        return {
            label: 'Everybody loses!',
        };
    } else if (localWinner && localWinner.id !== playerID) {
        return {
            label: `${localWinner.name} wins the game!`,
        };
    }

    if (eliminatedPlayer && eliminatedPlayer.id !== playerID) {
        return {
            label: `${eliminatedPlayer.name} is eliminated!`,
        };
    }

    return null;
}
