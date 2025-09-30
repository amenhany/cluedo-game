import type { PlayerID } from 'boardgame.io';
import bravo1 from '@/assets/audio/sfx/bravo1.wav';
import bravo2 from '@/assets/audio/sfx/bravo2.wav';
import bravo3 from '@/assets/audio/sfx/bravo3.wav';
import bravo4 from '@/assets/audio/sfx/bravo4.wav';
import death1 from '@/assets/audio/sfx/death1.wav';
import death2 from '@/assets/audio/sfx/death2.wav';
import suspenseSfx from '@/assets/audio/sfx/suspense.m4a';
import victoryMusic from '@/assets/audio/music/game/victory.wav';
import { useEffect, useRef } from 'react';
import { AudioManager } from '@/lib/AudioManager';
import type { PlayerState } from '@/types/game';
import { useTooltip } from '@/contexts/TooltipContext';
import Backdrop from '@/ui/Backdrop';
import bravoImage from '@/assets/textures/bravo.png';
import diedImage from '@/assets/textures/died.png';
import { motion } from 'motion/react';

const DELAY_MS = 1600;

export default function GameOver({
   winner,
   playerID,
   players,
}: {
   winner: PlayerID | null | undefined;
   playerID: PlayerID | undefined;
   players: Record<PlayerID, PlayerState> | undefined;
}) {
   if (!players || !playerID) return;

   const isEliminated = players[playerID].isEliminated;
   const prevPlayers = useRef<Record<PlayerID, PlayerState>>(undefined);
   const audioManager = AudioManager.getInstance();
   const { setTooltip } = useTooltip();

   useEffect(() => {
      if (isEliminated)
         setTimeout(() => audioManager.playRandomSfx(death1, death2), DELAY_MS + 100);
   }, [isEliminated]);

   useEffect(() => {
      if (winner === undefined) return;
      const timeout = setTimeout(
         () => handleWin(winner ? players[winner] : null),
         DELAY_MS
      );
      return () => clearTimeout(timeout);
   }, [winner]);

   useEffect(() => {
      if (prevPlayers.current === undefined) {
         prevPlayers.current = players;
         return;
      }
      Object.values(players).forEach((player) => {
         if (
            player.isEliminated !== prevPlayers.current![player.id].isEliminated &&
            player.id !== playerID
         ) {
            const timeout = setTimeout(() => {
               setTooltip({
                  label: `${player.character} is eliminated!`,
                  duration: 5000,
               });
               prevPlayers.current = players;
            }, DELAY_MS);
            return () => clearTimeout(timeout);
         }
      });
   }, [players]);

   function handleWin(winner: PlayerState | null) {
      audioManager.stopMusic();
      if (winner?.id === playerID) {
         audioManager.playRandomSfx(bravo1, bravo2, bravo3, bravo4);
         setTimeout(() => audioManager.playMusic(victoryMusic), 700);
      } else if (winner !== null) {
         audioManager.playSfx(suspenseSfx);
         setTooltip({
            label: `${winner.character} wins the game!`,
         });
      } else {
         setTooltip({
            label: 'Everybody loses!',
         });
      }
   }

   return (
      <>
         {isEliminated && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 1, 0] }}
               transition={{
                  delay: DELAY_MS / 1000,
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
                  delay: DELAY_MS / 1000,
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
