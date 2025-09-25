import Tooltip from '../game/hud/Tooltip';
import type { TooltipConfig } from '@/types/client';
import { AnimatePresence } from 'motion/react';
import {
   createContext,
   useContext,
   useRef,
   useState,
   useEffect,
   type ReactNode,
} from 'react';

type TooltipContextType = {
   setTooltip: (config: TooltipConfig | null) => void;
   tooltip: TooltipConfig | null;
};

const TooltipContext = createContext<TooltipContextType>({
   setTooltip: () => {},
   tooltip: null,
});

export function TooltipProvider({ children }: { children: ReactNode }) {
   const [tooltip, setTooltip] = useState<TooltipConfig | null>(null);
   const [queue, setQueue] = useState<TooltipConfig[]>([]);
   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const setTooltipWithQueue = (config: TooltipConfig | null) => {
      if (!config) {
         if (timerRef.current) clearTimeout(timerRef.current);
         setQueue([]);
         setTooltip(null);
         return;
      }

      if (tooltip) {
         if (!tooltip.duration) {
            setQueue((prev) => [...prev, tooltip]);
            setTooltip(config); // Replace immediately
         } else {
            setQueue((prev) => [...prev, config]);
         }
      } else {
         setTooltip(config);
      }
   };

   useEffect(() => {
      if (tooltip?.duration) {
         timerRef.current = setTimeout(() => {
            setTooltip(null);
            setQueue((prev) => {
               if (prev.length > 0) {
                  const [next, ...rest] = prev;
                  setTooltip(next);
                  return rest;
               }
               return [];
            });
         }, tooltip.duration);
      }
      return () => {
         if (timerRef.current) clearTimeout(timerRef.current);
      };
   }, [tooltip]);

   return (
      <TooltipContext.Provider value={{ setTooltip: setTooltipWithQueue, tooltip }}>
         {children}
         <AnimatePresence>{tooltip && <Tooltip {...tooltip} />}</AnimatePresence>
      </TooltipContext.Provider>
   );
}

export const useTooltip = () => useContext(TooltipContext);
