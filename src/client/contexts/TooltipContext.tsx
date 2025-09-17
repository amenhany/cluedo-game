import Tooltip from '../game/hud/Tooltip';
import type { TooltipConfig } from '@/types/client';
import { AnimatePresence } from 'motion/react';
import { createContext, useContext, useState, type ReactNode } from 'react';

type TooltipContextType = {
   setTooltip: (config: TooltipConfig | null) => void;
};

const TooltipContext = createContext<TooltipContextType>({ setTooltip: () => {} });

export function TooltipProvider({ children }: { children: ReactNode }) {
   const [tooltip, setTooltip] = useState<TooltipConfig | null>(null);

   return (
      <TooltipContext.Provider value={{ setTooltip }}>
         {children}
         <AnimatePresence>{tooltip && <Tooltip {...tooltip} />}</AnimatePresence>
      </TooltipContext.Provider>
   );
}

export const useTooltip = () => useContext(TooltipContext);
