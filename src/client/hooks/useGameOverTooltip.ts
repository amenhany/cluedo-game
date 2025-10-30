import { useSettings } from '@/contexts/SettingsContext';
import { SUSPENSE_DELAY_MS } from '@/game/constants';
import { AudioManager } from '@/lib/AudioManager';
import { t } from '@/lib/lang';
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
    const { settings } = useSettings();

    useEffect(() => {
        for (const player of Object.values(players)) {
            if (
                player.isEliminated &&
                player.hand.length !== 0 &&
                !eliminatedPlayers.current.includes(player.id)
            ) {
                AudioManager.getInstance().setMusicVolume(0);
                const timeout = setTimeout(() => {
                    setEliminatedPlayer(player);
                    setTimeout(() => {
                        setEliminatedPlayer(null);
                        if (settings)
                            AudioManager.getInstance().setMusicVolume(
                                settings.musicVolume
                            );
                    }, 5000);
                }, SUSPENSE_DELAY_MS);
                eliminatedPlayers.current.push(player.id);

                return () => clearTimeout(timeout);
            }
        }
    }, [players, playerID]);

    useEffect(() => {
        AudioManager.getInstance().stopMusic();
        setTimeout(() => setLocalWinner(winner), SUSPENSE_DELAY_MS);
    }, [winner]);

    if (localWinner === null) {
        return {
            label: t('hud.tooltip.lose'),
        };
    } else if (localWinner && localWinner.id !== playerID) {
        return {
            label: t('hud.tooltip.winner', { player: localWinner.name }),
        };
    }

    if (eliminatedPlayer && eliminatedPlayer.id !== playerID) {
        return {
            label: t('hud.tooltip.elimination', { player: eliminatedPlayer.name }),
        };
    }

    return null;
}
