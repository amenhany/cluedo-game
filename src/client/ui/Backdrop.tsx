import { motion } from 'motion/react';
import '@/assets/styles/settings.scss';

export default function Backdrop({
   children,
   onClick,
}: {
   children: React.ReactNode;
   onClick: React.MouseEventHandler<HTMLDivElement>;
}) {
   return (
      <motion.div
         className="backdrop"
         onClick={onClick}
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.8, type: 'spring' }}
      >
         {children}
      </motion.div>
   );
}
