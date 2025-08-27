import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { AudioManager } from '../lib/AudioManager';
import startSfx from '@/assets/audio/sfx/start.wav';

type TransitionType = 'iris' | 'fade';

type SceneTransitionContextType = {
   triggerTransition: (
      callback: () => void | Promise<void>,
      type?: TransitionType
   ) => void;
};

const SceneTransitionContext = createContext<SceneTransitionContextType>({
   triggerTransition: () => {},
});

export const useSceneTransition = () => useContext(SceneTransitionContext);

export const SceneTransitionProvider: React.FC<{ children: React.ReactNode }> = ({
   children,
}) => {
   const [transitionType, setTransitionType] = useState<TransitionType>('fade');
   const callbackQueue = useRef<(() => void) | null>(null);
   const radius = useRef(
      (Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) / 2) *
         (100 / Math.max(window.innerWidth, window.innerHeight))
   );
   const controls = useAnimationControls();

   useEffect(() => {
      controls.set('close');
      controls.start('open');
   }, []);

   const triggerTransition = (
      callback: () => void | Promise<void>,
      type: TransitionType = 'fade'
   ) => {
      setTransitionType(type);
      radius.current =
         (Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) / 2) *
         (100 / Math.max(window.innerWidth, window.innerHeight));
      controls.start('close').then(async () => {
         await callbackQueue.current?.();
         setTimeout(() => {
            controls.start('open');
            callbackQueue.current = null;
         }, 1500);
      });
      callbackQueue.current = callback;
      AudioManager.getInstance().stopMusic();
      AudioManager.getInstance().playSfx(startSfx);
   };

   return (
      <SceneTransitionContext.Provider value={{ triggerTransition }}>
         {children}

         <motion.div
            style={{
               position: 'fixed',
               inset: 0,
               backgroundColor: 'black',
               pointerEvents: 'none',
               zIndex: 9999,
            }}
            variants={{
               close: {
                  opacity: 1,
                  transition: { duration: 2 },
               },
               open: {
                  opacity: 0,
                  transition: { duration: 1 },
               },
            }}
            initial="close"
            animate={controls}
         />

         <svg
            className="iris-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            style={{
               position: 'fixed',
               top: 0,
               left: 0,
               width: '100%',
               height: '100%',
               zIndex: 9999,
               pointerEvents: 'none',
               display: transitionType === 'iris' ? 'block' : 'none',
            }}
         >
            <mask id="irisMask">
               <rect width="100%" height="100%" fill="white" />
               <motion.circle
                  cx="50"
                  cy="50"
                  fill="black"
                  r={10}
                  variants={{
                     close: {
                        r: 0,
                        transition: { duration: 1.2, ease: 'linear' },
                     },
                     open: {
                        r: radius.current,
                        transition: { duration: 1, ease: 'linear' },
                     },
                  }}
                  initial="open"
                  animate={controls}
               />
            </mask>
            <rect width="100%" height="100%" fill="black" mask="url(#irisMask)" />
         </svg>
      </SceneTransitionContext.Provider>
   );
};
