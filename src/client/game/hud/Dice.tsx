import { useEffect, useState } from 'react';
import { AudioManager } from '@/lib/AudioManager';
import { motion } from 'motion/react';
import slap1 from '@/assets/audio/sfx/slap1.wav';
import slap2 from '@/assets/audio/sfx/slap2.wav';

export default function Dice(props: {
   face: number;
   onRoll: () => void;
   disabled: boolean;
   visible: boolean;
}) {
   const [isDisabled, setIsDisabled] = useState(props.disabled);
   const [dieFace, setDieFace] = useState(1);

   useEffect(() => {
      if (props.face === 0) return;

      if (props.face === dieFace) {
         setDieFace(1);
         requestAnimationFrame(() => setDieFace(props.face));
      } else {
         setDieFace(props.face);
      }
   }, [props.face]);

   useEffect(() => setIsDisabled(props.disabled), [props.disabled]);

   function handleRoll() {
      if (isDisabled) return;
      props.onRoll();
      AudioManager.getInstance().playRandomSfx(slap1, slap2);
      setIsDisabled(true);
   }

   return (
      <motion.button
         onClick={handleRoll}
         className={`dice-button no-scroll-zone ${isDisabled ? 'disabled' : 'active'}`}
         animate={{ x: props.visible ? 0 : -200 }}
         transition={{ duration: 0.2 }}
         disabled={isDisabled}
      >
         <div className={`dice show-${dieFace}`}>
            <div id="dice-one-side-one" className="side one">
               <div className="dot one-1"></div>
            </div>
            <div id="dice-one-side-two" className="side two">
               <div className="dot two-1"></div>
               <div className="dot two-2"></div>
            </div>
            <div id="dice-one-side-three" className="side three">
               <div className="dot three-1"></div>
               <div className="dot three-2"></div>
               <div className="dot three-3"></div>
            </div>
            <div id="dice-one-side-four" className="side four">
               <div className="dot four-1"></div>
               <div className="dot four-2"></div>
               <div className="dot four-3"></div>
               <div className="dot four-4"></div>
            </div>
            <div id="dice-one-side-five" className="side five">
               <div className="dot five-1"></div>
               <div className="dot five-2"></div>
               <div className="dot five-3"></div>
               <div className="dot five-4"></div>
               <div className="dot five-5"></div>
            </div>
            <div id="dice-one-side-six" className="side six">
               <div className="dot six-1"></div>
               <div className="dot six-2"></div>
               <div className="dot six-3"></div>
               <div className="dot six-4"></div>
               <div className="dot six-5"></div>
               <div className="dot six-6"></div>
            </div>
         </div>
      </motion.button>
   );
}
