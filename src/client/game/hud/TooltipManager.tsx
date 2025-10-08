import { useTooltip } from '@/contexts/TooltipContext';
import { useGameOverTooltip } from '@/hooks/useGameOverTooltip';
import { useNotesTooltip } from '@/hooks/useNotesTooltip';
import { useSuggestionTooltip } from '@/hooks/useSuggestionTooltip';
import type { GameState, PlayerState, Stage } from '@/types/game';
import type { PlayerID } from 'boardgame.io';
import { useEffect, useMemo } from 'react';

type TooltipProps = {
   players: Record<PlayerID, PlayerState>;
   prevSuggestion: GameState['prevSuggestion'];
   playerID?: PlayerID;
   stage: Stage | null;
   winner: PlayerState | null | undefined;
   moves: Record<string, (...args: any[]) => void>;
};

export default function TooltipManager(props: TooltipProps) {
   const { setTooltip } = useTooltip();
   const suggestionTooltip = useSuggestionTooltip(props);
   const gameOverTooltip = useGameOverTooltip(props);
   const notesTooltip = useNotesTooltip(props);

   const activeTooltip = useMemo(
      () => gameOverTooltip ?? suggestionTooltip ?? notesTooltip ?? null,
      [gameOverTooltip, suggestionTooltip, notesTooltip]
   );

   useEffect(() => {
      setTooltip((prev) => {
         if (JSON.stringify(prev) === JSON.stringify(activeTooltip)) return prev;
         return activeTooltip;
      });
   }, [activeTooltip, setTooltip]);

   return <></>;
}
