import { useSuggestion } from '@/contexts/SuggestionContext';
import { useTooltip } from '@/contexts/TooltipContext';
import { cluedoGraph } from '@/game/board/boardGraph';
import type { Card, PlayerState, Stage } from '@/types/game';
import type { PlayerID } from 'boardgame.io';
import { useEffect, useRef } from 'react';

export default function SuggestionTooltip({
   players,
   playerID,
   moves,
   stage,
}: {
   players?: Record<PlayerID, PlayerState>;
   playerID?: PlayerID;
   moves: Record<string, (...args: any[]) => void>;
   stage: Stage | null;
}) {
   const playerNode =
      (players && playerID && cluedoGraph[players[playerID].position]) || null;
   const roomNode = (playerNode?.type === 'room' && playerNode) || null;
   const prevSuggester = useRef<PlayerID | null>(null);
   const { setTooltip } = useTooltip();
   const { canSuggest, completeSuggestion, resolver, suggestion, startSuggestion } =
      useSuggestion();
   const seenCards = (players && playerID && players[playerID].seenCards) || [];
   const prevSeenCards = useRef<Card[]>([]);

   function handleSuggest() {
      moves.makeSuggestion();
   }

   useEffect(() => {
      if (
         prevSuggester.current === playerID &&
         !suggestion &&
         prevSeenCards.current.length === seenCards.length
      ) {
         setTooltip({ label: 'No card was shown' });
         setTimeout(() => {
            prevSuggester.current = null;
            setTooltip(null);
         }, 4000);
         return;
      } else {
         setTooltip(null);
         prevSeenCards.current = seenCards;
      }

      if (suggestion) prevSuggester.current = suggestion.suggester;

      if (roomNode && canSuggest && !suggestion) {
         setTooltip({
            label: 'Make a Suggestion',
            onClick: () => startSuggestion(roomNode.id),
            secondaryLabel: stage === 'RoomAction' ? 'End Turn' : undefined,
            onSecondaryClick: moves.endTurn,
         });
         return;
      }
      if (!suggestion || !players) return;

      if (suggestion.suggester === playerID && !resolver) {
         !completeSuggestion
            ? setTooltip({
                 label:
                    suggestion.suspect === null
                       ? 'Please select a Suspect'
                       : 'Please select a Weapon',
                 delay: 1.35,
              })
            : setTooltip({
                 label: 'Suggest',
                 onClick: handleSuggest,
              });
         return;
      }

      if (suggestion.suggester !== playerID && !resolver) {
         setTooltip({
            label: `Waiting for ${players[suggestion.suggester].character}`,
            waitingDots: true,
         });
         return;
      }

      if (resolver && resolver.id !== playerID) {
         setTooltip({
            label: `Waiting for ${resolver.character}`,
            waitingDots: true,
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
               label: 'No card to show?',
               secondaryLabel: 'End Turn',
               onSecondaryClick: moves.noCard,
            });
         } else {
            setTooltip({
               label: `Show a card to ${players[suggestion.suggester].character}`,
            });
         }
      }
   }, [canSuggest, completeSuggestion, suggestion, resolver, stage]);

   return null;
}
