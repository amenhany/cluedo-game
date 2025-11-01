import type { Card as TCard, Suggestion } from '@/types/game';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
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
   const triggerRef = useRef<HTMLDivElement>(null);
   const wasInsideTrigger = useRef(false);

   useEffect(() => {
      function handleMouseMove(e: MouseEvent) {
         const trigger = triggerRef.current;
         if (!trigger) return;

         const rect = trigger.getBoundingClientRect();
         const inside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;

         // Toggle only when entering the trigger zone
         if (inside && !wasInsideTrigger.current) {
            setIsHandExpanded((prev) => !prev);
         }

         wasInsideTrigger.current = inside;
      }

      function handleKeyDown(e: KeyboardEvent) {
         if (isHandExpanded && e.key === 'Escape') {
            setIsHandExpanded(false);
         }

         if (e.key === ' ') {
            const active = document.activeElement;
            const isTyping =
               active &&
               (active.tagName === 'INPUT' ||
                  active.tagName === 'TEXTAREA' ||
                  active.getAttribute('contenteditable') === 'true');

            if (isTyping) return;
            e.preventDefault();
            setIsHandExpanded((prev) => !prev);
         }
      }

      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
         window.removeEventListener('mousemove', handleMouseMove);
         document.removeEventListener('keydown', handleKeyDown);
      };
   }, []);

   return (
      <>
         <div className="hand-trigger no-scroll-zone" ref={triggerRef} />
         <motion.div
            className={`hand ${isHandExpanded ? 'expanded no-scroll-zone' : ''}`}
            initial={{ bottom: '-30%' }}
            animate={{ bottom: isHandExpanded ? '4%' : '-30%' }}
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
