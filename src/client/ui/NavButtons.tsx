import { AudioManager } from '@/lib/AudioManager';
import { DoorClosed, DoorOpen, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import modalOpen from '@/assets/audio/sfx/modal_open.wav';
import select from '@/assets/audio/sfx/select.wav';
import HoverButton from '../game/hud/HoverButton';

export default function NavButtons({
   setOpenSettings,
   exitFn,
   exitTooltip,
}: {
   setOpenSettings: React.Dispatch<React.SetStateAction<boolean>>;
   exitFn?: () => void;
   exitTooltip?: string;
}) {
   const [hoverClose, setHoverClose] = useState(false);

   return (
      <>
         <motion.button
            className="button-icon"
            variants={{
               initial: {
                  rotate: 0,
               },
               active: {
                  rotate: 30,
               },
            }}
            initial="initial"
            whileHover="active"
            onClick={() => {
               setOpenSettings(true);
               AudioManager.getInstance().playSfx(modalOpen);
            }}
         >
            <Settings size={40} />
         </motion.button>
         <HoverButton
            tooltip={exitTooltip || null}
            onClick={() => {
               AudioManager.getInstance().playSfx(select);
               setTimeout(exitFn || close, 100);
            }}
            className="button-icon"
            onMouseEnter={() => setHoverClose(true)}
            onMouseLeave={() => setHoverClose(false)}
         >
            {hoverClose ? <DoorOpen size={40} /> : <DoorClosed size={40} />}
         </HoverButton>
      </>
   );
}
