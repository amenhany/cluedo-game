import { motion, spring } from 'framer-motion';
import type { GameState, Room } from '@/types/game';

const ROOM_COORDS: Record<Room, { x: string | number; y: string | number; r: number }> = {
   kitchen: { x: '84.6%', y: '82.5%', r: 160 },
   lounge: { x: '82.8%', y: '14.5%', r: 175 },
   study: { x: '17.5%', y: '11%', r: 150 },
   ballroom: { x: '50.3%', y: '80.3%', r: 190 },
   diningRoom: { x: '80.85%', y: '50%', r: 190 },
   hall: { x: '50.5%', y: '16.5%', r: 170 },
   library: { x: '17%', y: '34.85%', r: 150 },
   billiardRoom: { x: '15.85%', y: '57.3%', r: 150 },
   conservatory: { x: '15.8%', y: '84.5%', r: 150 },
};

export default function SpotlightOverlay({
   suggestion,
}: {
   suggestion: GameState['pendingSuggestion'];
}) {
   if (!suggestion?.room) return null;
   const { x, y, r = 0 } = ROOM_COORDS[suggestion.room];

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
