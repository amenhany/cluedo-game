import { motion } from 'motion/react';
import Backdrop from './Backdrop';
import { useEffect } from 'react';

export default function Modal({
   onClose,
   title,
   children,
}: {
   onClose: () => void;
   title: string;
   children: React.ReactNode;
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
            <h2 className="modalTitle">{title}</h2>
            {children}
         </motion.div>
      </Backdrop>
   );
}
