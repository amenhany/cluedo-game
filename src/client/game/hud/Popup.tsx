import '@/assets/styles/popup.scss';
import { motion } from 'motion/react';
import Backdrop from '@/ui/Backdrop';
import type { PopupConfig } from '@/types/client';

export default function Popup({ children, onClick, bottomText = '' }: PopupConfig) {
   return (
      <Backdrop onClick={onClick}>
         <motion.div
            className="letterbox-bar top-bar"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
         />

         <motion.div
            className="letterbox-bar bottom-bar"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
         >
            <motion.span
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0, delay: 0.4 }}
            >
               {bottomText}
            </motion.span>
         </motion.div>

         <motion.div
            className="show-card"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
         >
            {children}
         </motion.div>
      </Backdrop>
   );
}
