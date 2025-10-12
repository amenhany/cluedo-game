import type { ClientOptions } from '@/types/client';
import type { Character } from '@/types/game';
import { createContext, useContext, type ReactNode } from 'react';

type MatchContextType = Partial<ClientOptions> & {
   playAgain: (playerName: string, character: Character) => void;
   leaveGame: () => void;
   isHost: boolean;
};

const MatchContext = createContext<MatchContextType>({
   server: '',
   playerID: '',
   credentials: '',
   matchID: '',
   playAgain: () => {},
   leaveGame: () => {},
   isHost: false,
});

export function MatchProvider({
   children,
   ...props
}: MatchContextType & { children: ReactNode }) {
   return <MatchContext.Provider value={props}>{children}</MatchContext.Provider>;
}

export const useMatch = () => useContext(MatchContext);
