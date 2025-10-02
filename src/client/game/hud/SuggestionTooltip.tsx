import { useSuggestion } from '@/contexts/SuggestionContext';
import { useTooltip } from '@/contexts/TooltipContext';
import { cluedoGraph } from '@/game/board/boardGraph';
import type { Card, GameState, PlayerState, Stage } from '@/types/game';
import type { PlayerID } from 'boardgame.io';
import { useEffect, useRef } from 'react';

export default function SuggestionTooltip({
   players,
   playerID,
   moves,
   stage,
   prevSuggestion,
}: {
   players?: Record<PlayerID, PlayerState>;
   playerID?: PlayerID;
   moves: Record<string, (...args: any[]) => void>;
   stage: Stage | null;
   deck: Card[];
   prevSuggestion: GameState['prevSuggestion'];
}) {
   const playerNode =
      (players && playerID && cluedoGraph[players[playerID].position]) || null;
   const roomNode = (playerNode?.type === 'room' && playerNode) || null;
   const { setTooltip } = useTooltip();
   const { canSuggest, completeSuggestion, resolver, suggestion, startSuggestion } =
      useSuggestion();
   const suggestionIdRef = useRef(prevSuggestion?.id);

   function handleSuggest() {
      moves.makeSuggestion();
   }

   useEffect(() => {
      if (players && prevSuggestion && prevSuggestion.id !== suggestionIdRef.current) {
         const timeout = setTimeout(() => {
            suggestionIdRef.current = prevSuggestion.id;
         }, 4000);
         if (prevSuggestion.resolver === null)
            setTooltip({ label: `No card was shown`, duration: 4000 });
         else if (
            playerID !== prevSuggestion.resolver &&
            playerID !== prevSuggestion.suggester
         )
            setTooltip({
               label: `${players[prevSuggestion.resolver].name} showed a card to ${
                  players[prevSuggestion.suggester].name
               }`,
               duration: 4000,
            });
         else {
            setTooltip(null);
            clearTimeout(timeout);
         }
      } else {
         setTooltip(null);
      }

      if (roomNode && canSuggest && !suggestion) {
         setTooltip({
            label: 'Make a Suggestion',
            onClick: () => startSuggestion(roomNode.id),
            secondaryLabel: stage === 'RoomAction' ? 'End Turn' : undefined,
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
            label: `Waiting for ${players[suggestion.suggester].name}`,
            waitingDots: true,
            noQueue: true,
         });
         return;
      }

      if (resolver && resolver.id !== playerID) {
         setTooltip({
            label: `Waiting for ${resolver.name}`,
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
               label: 'No card to show?',
               secondaryLabel: 'End Turn',
               onSecondaryClick: () => moves.noCard(),
            });
         } else {
            setTooltip({
               label: `Show a card to ${players[suggestion.suggester].name}`,
            });
         }
      }
   }, [canSuggest, completeSuggestion, suggestion, resolver, stage, prevSuggestion]);

   return null;
}
