import type { PlayerID } from 'boardgame.io';
import bravo1 from '@/assets/audio/sfx/bravo1.wav';
import bravo2 from '@/assets/audio/sfx/bravo2.wav';
import bravo3 from '@/assets/audio/sfx/bravo3.wav';
import bravo4 from '@/assets/audio/sfx/bravo4.wav';
import death1 from '@/assets/audio/sfx/death1.wav';
import death2 from '@/assets/audio/sfx/death2.wav';
import begin from '@/assets/audio/sfx/begin.wav';
import suspenseSfx from '@/assets/audio/sfx/suspense.m4a';
import loseSfx from '@/assets/audio/sfx/lose.wav';
import victoryMusic from '@/assets/audio/music/game/victory.wav';
import { useEffect, useRef, useState } from 'react';
import { AudioManager } from '@/lib/AudioManager';
import type { PlayerState } from '@/types/game';
import Backdrop from '@/ui/Backdrop';
import bravoImage from '@/assets/textures/text/bravo.png';
import diedImage from '@/assets/textures/text/died.png';
import wallopImage1 from '@/assets/textures/text/wallop1.png';
import wallopImage2 from '@/assets/textures/text/wallop2.png';
import { motion } from 'motion/react';
import { SUSPENSE_DELAY_MS } from '@/game/constants';

export default function GameOver({
   winner,
   playerID,
   players,
}: {
   winner: PlayerID | null | undefined;
   playerID: PlayerID | undefined;
   players: Record<PlayerID, PlayerState>;
}) {
   if (!playerID) return;

   const isEliminated = players[playerID].isEliminated;
   const audioManager = AudioManager.getInstance();
   const [wallop, setWallop] = useState<string | null>(null);
   const countRef = useRef(0);

   useEffect(() => {
      countRef.current = 0;
      const maxSwitches = 20;
      const interval = setInterval(() => {
         setWallop(
            countRef.current % 2 && countRef.current < 15 ? wallopImage2 : wallopImage1
         );
         countRef.current++;
         if (countRef.current >= maxSwitches) {
            clearInterval(interval);
            setWallop(null);
         }
      }, 100);
      setTimeout(() => audioManager.playSfx(begin), 200);

      return () => clearInterval(interval);
   }, []);

   useEffect(() => {
      if (isEliminated)
         setTimeout(
            () => audioManager.playRandomSfx(death1, death2),
            SUSPENSE_DELAY_MS + 100
         );
   }, [isEliminated]);

   useEffect(() => {
      if (winner === undefined) return;
      const timeout = setTimeout(
         () => handleWin(winner ? players[winner] : null),
         SUSPENSE_DELAY_MS
      );
      return () => clearTimeout(timeout);
   }, [winner]);

   function handleWin(winner: PlayerState | null) {
      audioManager.stopMusic();
      if (winner?.id === playerID) {
         audioManager.playRandomSfx(bravo1, bravo2, bravo3, bravo4);
         setTimeout(() => audioManager.playMusic(victoryMusic), 700);
      } else if (winner !== null) {
         audioManager.playSfx(suspenseSfx);
         setTimeout(() => audioManager.playMusic(loseSfx), SUSPENSE_DELAY_MS);
      } else {
         audioManager.playMusic(loseSfx);
      }
   }

   return (
      <>
         {wallop && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 1, 0] }}
               transition={{
                  duration: 2,
                  times: [0, 0.1, 0.8, 1],
               }}
            >
               <Backdrop onClick={() => {}}>
                  <motion.img
                     src={wallop}
                     alt="Wallop!"
                     style={{ width: '100%', pointerEvents: 'none' }}
                     initial={{ scale: 3, opacity: 1 }}
                     animate={{ scale: [3, 1, 1, 3], opacity: [1, 1, 1, 0] }}
                     transition={{
                        duration: 1.5,
                        times: [0, 0.1, 0.9, 1],
                     }}
                  />
               </Backdrop>
            </motion.div>
         )}
         {isEliminated && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 1, 0] }}
               transition={{
                  delay: SUSPENSE_DELAY_MS / 1000,
                  duration: 5,
                  times: [0, 0.1, 0.8, 1],
               }}
            >
               <Backdrop onClick={() => {}}>
                  <img src={diedImage} alt="You Died!" />
               </Backdrop>
            </motion.div>
         )}

         {winner === playerID && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 1, 0] }}
               transition={{
                  delay: SUSPENSE_DELAY_MS / 1000,
                  duration: 5,
                  times: [0, 0.1, 0.8, 1],
               }}
            >
               <Backdrop onClick={() => {}}>
                  <img src={bravoImage} alt="BRAVO!" />
               </Backdrop>
            </motion.div>
         )}
      </>
   );
}
