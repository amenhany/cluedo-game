import { motion, spring } from 'framer-motion';
import type { GameState, Room } from '@/types/game';

const ROOM_COORDS: Record<Room, { x: number; y: number; r: number }> = {
   kitchen: { x: 1008, y: 990, r: 160 },
   lounge: { x: 980, y: 170, r: 175 },
   study: { x: 200, y: 125, r: 150 },
   ballroom: { x: 596, y: 966, r: 190 },
   diningRoom: { x: 962, y: 600, r: 190 },
   hall: { x: 598, y: 200, r: 170 },
   library: { x: 200, y: 418, r: 150 },
   billiardRoom: { x: 190, y: 688, r: 150 },
   conservatory: { x: 188, y: 1015, r: 150 },
};

export default function SpotlightOverlay({
   suggestion,
}: {
   suggestion: GameState['pendingSuggestion'];
}) {
   if (!suggestion?.room) return null;
   const { x, y, r } = ROOM_COORDS[suggestion.room];

   return (
      <svg
         style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
         }}
      >
         <defs>
            <mask id="spotlightMask">
               <rect width="100%" height="100%" fill="white" />
               <motion.circle
                  cx={x}
                  cy={y}
                  r={0}
                  fill="black"
                  animate={{ r }}
                  transition={{
                     delay: 0,
                     duration: 0.05,
                     type: spring,
                     damping: 18,
                     stiffness: 200,
                  }}
               />
            </mask>
         </defs>
         <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.7)"
            mask="url(#spotlightMask)"
         />
      </svg>
   );
}
