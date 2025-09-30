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
   children,
}: {
   onClose: () => void;
   title: string;
   children: React.ReactNode;
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
            className="modal"
            onClick={(e) => e.stopPropagation()}
            variants={{
               hidden: { scale: 0, opacity: 0 },
               visible: { scale: 1, opacity: 1 },
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.8, type: 'spring' }}
         >
            <img src={TEXTURE_MAPPING[texture]} className="modal-bg" />
            <h2 className="modal-title">{title}</h2>
            {children}
         </motion.div>
      </Backdrop>
   );
}
