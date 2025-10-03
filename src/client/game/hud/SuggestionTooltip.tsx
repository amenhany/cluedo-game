import { useSuggestion } from '@/contexts/SuggestionContext';
import { useTooltip } from '@/contexts/TooltipContext';
import { cluedoGraph } from '@/game/board/boardGraph';
import { t } from '@/lib/lang';
import type { Card, GameState, PlayerState, Stage } from '@/types/game';
import type { PlayerID } from 'boardgame.io';
import { useEffect, useState } from 'react';

export default function SuggestionTooltip({
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
   deck: Card[];
   prevSuggestion: GameState['prevSuggestion'];
}) {
   const playerNode = (playerID && cluedoGraph[players[playerID].position]) || null;
   const roomNode = (playerNode?.type === 'room' && playerNode) || null;
   const { setTooltip, tooltip } = useTooltip();
   const { canSuggest, completeSuggestion, resolver, suggestion, startSuggestion } =
      useSuggestion();
   const [suggestionId, setSuggestionId] = useState(prevSuggestion?.id);

   function handleSuggest() {
      moves.makeSuggestion();
   }

   useEffect(() => {
      console.log(prevSuggestion, suggestionId);
      if (prevSuggestion && prevSuggestion.id !== suggestionId) {
         const timeout = setTimeout(() => {
            setSuggestionId(prevSuggestion.id);
         }, 4000);
         if (prevSuggestion.resolver === null) {
            setTooltip({ label: t('hud.tooltip.no_resolution'), duration: 4000 });
            return;
         } else if (
            playerID !== prevSuggestion.resolver &&
            playerID !== prevSuggestion.suggester
         ) {
            setTooltip({
               label: t('hud.tooltip.shown_card', {
                  resolver: players[prevSuggestion.resolver].name,
                  suggester: players[prevSuggestion.suggester].name,
               }),
               duration: 4000,
            });
            return;
         } else {
            setTooltip(null);
            clearTimeout(timeout);
         }
      } else {
         setTooltip(null);
      }

      if (roomNode && canSuggest && !suggestion) {
         setTooltip({
            label: t('hud.tooltip.can_suggest'),
            onClick: () => startSuggestion(roomNode.id),
            secondaryLabel:
               stage === 'RoomAction' ? t('hud.tooltip.end_turn') : undefined,
            onSecondaryClick: () => moves.endTurn(),
         });
         return;
      }
      if (!suggestion || !players) return;

      if (suggestion.suggester === playerID && !resolver) {
         !completeSuggestion
            ? setTooltip({
                 label:
                    suggestion.suspect === null
                       ? t('hud.tooltip.suspect')
                       : t('hud.tooltip.weapon'),
                 delay: 1.35,
              })
            : setTooltip({
                 label: t('hud.tooltip.suggest'),
                 onClick: handleSuggest,
              });
         return;
      }

      if (suggestion.suggester !== playerID && !resolver) {
         setTooltip({
            label: t('hud.tooltip.wait', { player: players[suggestion.suggester].name }),
            waitingDots: true,
            noQueue: true,
         });
         return;
      }

      if (resolver && resolver.id !== playerID) {
         setTooltip({
            label: t('hud.tooltip.wait', { player: resolver.name }),
            waitingDots: true,
            noQueue: true,
         });
         return;
      }

      if (resolver && resolver.id === playerID) {
         const suggestionCards = [
            suggestion.suspect,
            suggestion.weapon,
            suggestion.room,
         ] as Card[];
         const hasPlayableCard = resolver.hand.some(
            (card) =>
               suggestionCards.includes(card) &&
               !players[suggestion.suggester].seenCards.includes(card)
         );
         if (!hasPlayableCard) {
            setTooltip({
               label: t('hud.tooltip.no_card'),
               secondaryLabel: t('hud.tooltip.end_turn'),
               onSecondaryClick: () => moves.noCard(),
               noQueue: true,
            });
         } else {
            setTooltip({
               label: t('hud.tooltip.show_card', {
                  suggester: players[suggestion.suggester].name,
               }),
            });
         }
      }
   }, [
      canSuggest,
      completeSuggestion,
      suggestion,
      resolver,
      stage,
      prevSuggestion,
      suggestionId,
      tooltip,
   ]);

   return null;
}
