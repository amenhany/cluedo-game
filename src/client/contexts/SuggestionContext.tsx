import { AudioManager } from '@/lib/AudioManager';
import type { Suggestion, Card, Room, PlayerState, GameState } from '@/types/game';
import React, { createContext, useContext } from 'react';
import spotlightSfx from '@/assets/audio/sfx/spotlight.m4a';
import doorSound from '@/assets/audio/sfx/door.wav';
import suggestionMusic from '@/assets/audio/music/game/suggestion.wav';

type SuggestionContextType = {
   canSuggest: boolean;
   completeSuggestion: boolean;
   resolver: PlayerState | null;
   suggestion: GameState['pendingSuggestion'];
   isHighlighted: (s: Card) => boolean;
   setHighlighted: (type: keyof Suggestion, s: Card) => void;
   startSuggestion: (room: Room) => void;
   makeSuggestion: () => void;
};

const SuggestionContext = createContext<SuggestionContextType>({
   canSuggest: false,
   completeSuggestion: false,
   resolver: null,
   suggestion: undefined,
   isHighlighted: () => false,
   setHighlighted: () => {},
   startSuggestion: () => {},
   makeSuggestion: () => {},
});

export const useSuggestion = () => useContext(SuggestionContext);

export function SuggestionContextProvider({
   moves,
   suggestion,
   resolver,
   canSuggest,
   children,
}: {
   moves: Record<string, (...args: any[]) => void>;
   suggestion: GameState['pendingSuggestion'];
   canSuggest: boolean;
   resolver: PlayerState | null;
   children: React.ReactNode;
}) {
   const completeSuggestion =
      (suggestion && suggestion.suspect && suggestion.weapon && suggestion.room) !== null;

   const startSuggestion: SuggestionContextType['startSuggestion'] = () => {
      if (canSuggest) {
         moves.startSuggestion();
         AudioManager.getInstance().playSfx(spotlightSfx);
         // setTimeout(() => AudioManager.getInstance().playMusic(suggestionMusic), 1500);
      }
   };

   const isHighlighted: SuggestionContextType['isHighlighted'] = (s) => {
      if (!suggestion) return false;
      const cards = [suggestion.suspect, suggestion.weapon, suggestion.room];
      return cards.includes(s);
   };

   const setHighlighted: SuggestionContextType['setHighlighted'] = (type, s) => {
      if (!resolver) {
         AudioManager.getInstance().playSfx(doorSound);
         moves.setSuggestion(type, s);
      }
   };

   const makeSuggestion: SuggestionContextType['makeSuggestion'] = () => {
      if (completeSuggestion && canSuggest) {
         moves.makeSuggestion();
      }
   };

   return (
      <SuggestionContext.Provider
         value={{
            canSuggest,
            completeSuggestion,
            resolver,
            suggestion,
            isHighlighted,
            setHighlighted,
            startSuggestion,
            makeSuggestion,
         }}
      >
         {children}
      </SuggestionContext.Provider>
   );
}
