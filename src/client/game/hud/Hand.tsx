import type { Card as TCard, Suggestion } from '@/types/game';
import { motion } from 'motion/react';
import { useState } from 'react';
import Card from './Card';

export default function Hand({
   hand,
   moves,
}: {
   hand: {
      card: TCard;
      type: keyof Suggestion;
      playable: boolean;
   }[];
   moves: Record<string, (...args: any[]) => void>;
}) {
   const [isHandExpanded, setIsHandExpanded] = useState(false);

   return (
      <>
         <div
            className="hand-trigger"
            onMouseEnter={() => setIsHandExpanded((prev) => !prev)}
         />

         <motion.div
            className={`hand ${isHandExpanded ? 'expanded' : ''}`}
            animate={{ bottom: isHandExpanded ? '3vh' : '-31vh' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
         >
            {hand.map((card) => (
               <Card
                  key={card.card}
                  id={card.card}
                  type={card.type}
                  playable={card.playable}
                  onClick={
                     card.playable
                        ? () => {
                             moves.showCard(card.card);
                             setIsHandExpanded(false);
                          }
                        : () => {}
                  }
               />
            ))}
         </motion.div>
      </>
   );
}
