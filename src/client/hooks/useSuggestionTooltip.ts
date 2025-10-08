import { useSuggestion } from '@/contexts/SuggestionContext';
import { cluedoGraph } from '@/game/board/boardGraph';
import { t } from '@/lib/lang';
import type { TooltipConfig } from '@/types/client';
import type { GameState, PlayerState, Stage } from '@/types/game';
import type { PlayerID } from 'boardgame.io';
import { useEffect, useState } from 'react';

export function useSuggestionTooltip({
    players,
    playerID,
    moves,
    stage,
    prevSuggestion,
}: {
    players: Record<PlayerID, PlayerState>;
    playerID?: PlayerID;
    moves: Record<string, (...args: any[]) => void>;
    stage: Stage | null;
    prevSuggestion: GameState['prevSuggestion'];
}): TooltipConfig | null {
    const { canSuggest, completeSuggestion, resolver, suggestion, startSuggestion } =
        useSuggestion();
    const playerNode = (playerID && cluedoGraph[players[playerID].position]) || null;
    const roomNode = playerNode?.type === 'room' ? playerNode : null;

    const [suggestionId, setSuggestionId] = useState(prevSuggestion?.id);

    useEffect(() => {
        if (prevSuggestion && prevSuggestion.id !== suggestionId) {
            const timeout = setTimeout(() => setSuggestionId(prevSuggestion.id), 4000);
            return () => clearTimeout(timeout);
        }
    }, [prevSuggestion]);

    if (prevSuggestion && prevSuggestion.id !== suggestionId) {
        if (prevSuggestion.resolver === null)
            return { label: t('hud.tooltip.no_resolution') };
        if (playerID !== prevSuggestion.resolver && playerID !== prevSuggestion.suggester)
            return {
                label: t('hud.tooltip.shown_card', {
                    resolver: players[prevSuggestion.resolver].name,
                    suggester: players[prevSuggestion.suggester].name,
                }),
            };
    }

    if (roomNode && canSuggest && !suggestion)
        return {
            label: t('hud.tooltip.can_suggest'),
            onClick: () => startSuggestion(roomNode.id),
            secondaryLabel:
                stage === 'RoomAction' ? t('hud.tooltip.end_turn') : undefined,
            onSecondaryClick: () => moves.endTurn(),
        };

    if (!suggestion || !players) return null;

    if (suggestion.suggester === playerID && !resolver)
        return !completeSuggestion
            ? {
                  label:
                      suggestion.suspect === null
                          ? t('hud.tooltip.suspect')
                          : t('hud.tooltip.weapon'),
                  delay: 1.35,
              }
            : { label: t('hud.tooltip.suggest'), onClick: () => moves.makeSuggestion() };

    if (suggestion.suggester !== playerID && !resolver)
        return {
            label: t('hud.tooltip.wait', { player: players[suggestion.suggester].name }),
            waitingDots: true,
            noQueue: true,
        };

    if (resolver && resolver.id !== playerID)
        return {
            label: t('hud.tooltip.wait', { player: resolver.name }),
            waitingDots: true,
            noQueue: true,
        };

    if (resolver && resolver.id === playerID) {
        const suggestionCards = [suggestion.suspect, suggestion.weapon, suggestion.room];
        const hasPlayableCard = resolver.hand.some(
            (card) =>
                suggestionCards.includes(card) &&
                !players[suggestion.suggester].seenCards.includes(card)
        );
        return hasPlayableCard
            ? {
                  label: t('hud.tooltip.show_card', {
                      suggester: players[suggestion.suggester].name,
                  }),
              }
            : {
                  label: t('hud.tooltip.no_card'),
                  secondaryLabel: t('hud.tooltip.end_turn'),
                  onSecondaryClick: () => moves.noCard(),
                  noQueue: true,
              };
    }

    return null;
}
