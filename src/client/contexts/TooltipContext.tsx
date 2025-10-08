import Tooltip from '../game/hud/Tooltip';
import type { TooltipConfig } from '@/types/client';
import { AnimatePresence } from 'motion/react';
import { createContext, useContext, useState, type ReactNode } from 'react';

type TooltipContextType = {
   setTooltip: React.Dispatch<React.SetStateAction<TooltipConfig | null>>;
   tooltip: TooltipConfig | null;
};

const TooltipContext = createContext<TooltipContextType>({
   setTooltip: () => {},
   tooltip: null,
});

export function TooltipProvider({ children }: { children: ReactNode }) {
   const [tooltip, setTooltip] = useState<TooltipConfig | null>(null);

   return (
      <TooltipContext.Provider value={{ setTooltip, tooltip }}>
         {children}
         <AnimatePresence>{tooltip && <Tooltip {...tooltip} />}</AnimatePresence>
      </TooltipContext.Provider>
   );
}

export const useTooltip = () => useContext(TooltipContext);
