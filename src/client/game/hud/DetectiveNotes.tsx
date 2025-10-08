import { AudioManager } from '@/lib/AudioManager';
import type { NullableSuggestion, PlayerState, Stage, Suggestion } from '@/types/game';
import { useEffect, useRef, useState } from 'react';
import openSfx from '@/assets/audio/sfx/card_up.wav';
import closeSfx from '@/assets/audio/sfx/card_down.wav';
import { CARDS } from '@/game/constants';
import { motion } from 'motion/react';
import type { Ctx, PlayerID } from 'boardgame.io';
import NoteTable from './NoteTable';
import { t } from '@/lib/lang';
import suspenseSfx from '@/assets/audio/sfx/suspense.m4a';
import notesImage from '@/assets/textures/card_modal.png';
import HoverButton from './HoverButton';
import appear from '@/assets/audio/sfx/appear.wav';
import locked from '@/assets/audio/sfx/card_locked.wav';

export default function DetectiveNotes({
   stage,
   players,
   playerID,
   makeAccusation,
}: {
   stage: Stage | null;
   players: Record<PlayerID, PlayerState>;
   playerID?: PlayerID;
   ctx: Ctx;
   makeAccusation: (accusation: Suggestion) => void;
}) {
   const audioManager = AudioManager.getInstance();
   const [accusing, setAccusing] = useState(false);
   const [isOpen, setIsOpen] = useState(false);
   const [acccusation, setAccusation] = useState<NullableSuggestion>({
      suspect: null,
      weapon: null,
      room: null,
   });
   const accusationButtonDisabled =
      Object.values(acccusation).includes(null) || accusing || stage !== 'Endgame';
   const notesRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
         if (isOpen && notesRef.current && !notesRef.current.contains(e.target as Node)) {
            setIsOpen(false);
            audioManager.playSfx(closeSfx);
         }
      }

      function handleKeyDown(e: KeyboardEvent) {
         if (isOpen && e.key === 'Escape') {
            setIsOpen(false);
            audioManager.playSfx(closeSfx);
         }
      }

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
         document.removeEventListener('keydown', handleKeyDown);
      };
   }, [isOpen]);

   function handleAccusation() {
      if (accusationButtonDisabled) {
         audioManager.playSfx(locked);
         return;
      }
      audioManager.playSfx(suspenseSfx);
      setAccusing(true);
      setIsOpen(false);
      makeAccusation(acccusation as Suggestion);
   }

   return (
      <>
         <div
            className="notes-trigger no-scroll-zone"
            onMouseEnter={() => {
               setIsOpen((prev) => !prev);
               isOpen ? audioManager.playSfx(closeSfx) : audioManager.playSfx(openSfx);
            }}
         />
         <motion.div
            ref={notesRef}
            className={`notes no-scroll-zone ${isOpen ? 'expanded' : ''}`}
            initial={{ bottom: '-50%', left: '25%' }}
            animate={{ bottom: isOpen ? '48%' : '-42%', left: isOpen ? '50%' : '25%' }}
            transition={{ type: 'spring', stiffness: 250, damping: 28 }}
         >
            <img src={notesImage} alt="Detective Notes" className="notes-bg" />
            <div className="notes-body">
               <NoteTable
                  type="suspect"
                  arr={CARDS.suspects}
                  players={players}
                  playerID={playerID}
                  accusation={acccusation}
                  setAccusation={setAccusation}
                  displayNames={true}
               />
               <NoteTable
                  type="weapon"
                  arr={CARDS.weapons}
                  players={players}
                  playerID={playerID}
                  accusation={acccusation}
                  setAccusation={setAccusation}
               />
               <NoteTable
                  type="room"
                  arr={CARDS.rooms}
                  players={players}
                  playerID={playerID}
                  accusation={acccusation}
                  setAccusation={setAccusation}
               />
               <div className="accusation">
                  <HoverButton
                     id="accusation-button"
                     onClick={handleAccusation}
                     onMouseEnter={() => {
                        if (accusationButtonDisabled) {
                           return;
                        }
                        AudioManager.getInstance().playSfx(appear);
                     }}
                     aria-disabled={accusationButtonDisabled}
                     tooltip={
                        playerID && players[playerID]?.isEliminated
                           ? null
                           : stage !== 'Endgame'
                           ? t('hud.notes.tooltip.clue')
                           : Object.values(acccusation).includes(null)
                           ? acccusation.suspect === null
                              ? t('hud.notes.tooltip.suspect')
                              : acccusation.weapon === null
                              ? t('hud.notes.tooltip.weapon')
                              : acccusation.room === null
                              ? t('hud.notes.tooltip.room')
                              : null
                           : null
                     }
                  >
                     {t('hud.notes.accusation')}
                  </HoverButton>
               </div>
            </div>
         </motion.div>
      </>
   );
}
