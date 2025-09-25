import type { TooltipConfig } from '@/types/client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Tooltip({
   label,
   delay = 0,
   onClick,
   secondaryLabel,
   onSecondaryClick,
   waitingDots = false,
}: TooltipConfig) {
   if (!label) return null;

   return (
      <div className="tooltip-container no-scroll-zone">
         {onClick ? (
            <button onClick={onClick}>{label}</button>
         ) : (
            <motion.h1
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2, delay, ease: 'easeIn' }}
            >
               {label}
               {waitingDots && <WaitingDots />}
            </motion.h1>
         )}
         {secondaryLabel && <button onClick={onSecondaryClick}>{secondaryLabel}</button>}
      </div>
   );
}

function WaitingDots({ duration = 700 }: { duration?: number }) {
   const [active, setActive] = useState(0);

   useEffect(() => {
      const interval = setInterval(() => {
         setActive((prev) => (prev + 1) % 4); // cycle 0–3
      }, duration);
      return () => clearInterval(interval);
   }, []);

   return (
      <span style={{ display: 'inline-block', width: '1.5em', textAlign: 'left' }}>
         <span style={{ visibility: active >= 1 ? 'visible' : 'hidden' }}>.</span>
         <span style={{ visibility: active >= 2 ? 'visible' : 'hidden' }}>.</span>
         <span style={{ visibility: active >= 3 ? 'visible' : 'hidden' }}>.</span>
      </span>
   );
}
