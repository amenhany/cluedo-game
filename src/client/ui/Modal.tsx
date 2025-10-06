import { motion } from 'motion/react';
import Backdrop from './Backdrop';
import { useEffect } from 'react';
import board from '@/assets/textures/board_modal.png';
import card from '@/assets/textures/card_short.png';

type Texture = 'board' | 'card';

const TEXTURE_MAPPING: Record<Texture, string> = {
   board,
   card,
};

export default function Modal({
   onClose,
   title,
   texture,
   className,
   children,
}: {
   onClose: () => void;
   title: string;
   children: React.ReactNode;
   className?: string;
   texture: Texture;
}) {
   useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
         if (event.key === 'Escape') onClose();
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
   }, []);

   return (
      <Backdrop onClick={onClose}>
         <motion.div
            className={`modal ${className}`}
            onClick={(e) => e.stopPropagation()}
            variants={{
               boardHidden: { scale: 0, opacity: 0 },
               boardVisible: { scale: 1, opacity: 1 },
               cardHidden: { y: '100vh' },
               cardVisible: { y: 0 },
            }}
            initial={`${texture}Hidden`}
            animate={`${texture}Visible`}
            exit={`${texture}Hidden`}
            transition={{
               duration: 0.8,
               type: 'spring',
               damping: texture === 'card' ? 16 : 12,
            }}
         >
            <img src={TEXTURE_MAPPING[texture]} className="modal-bg" />
            <h2 className="modal-title">{title}</h2>
            {children}
         </motion.div>
      </Backdrop>
   );
}
