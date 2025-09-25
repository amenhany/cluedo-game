import { useTooltip } from '@/contexts/TooltipContext';
import { AudioManager } from '@/lib/AudioManager';
import type { NullableSuggestion, PlayerState, Stage, Suggestion } from '@/types/game';
import { useEffect, useRef, useState } from 'react';
import openSfx from '@/assets/audio/sfx/card_up.m4a';
import closeSfx from '@/assets/audio/sfx/card_down.m4a';
import { CARDS } from '@/game/constants';
import { motion } from 'motion/react';
import type { Ctx, PlayerID } from 'boardgame.io';
import NoteTable from './NoteTable';
import { t } from '@/lib/lang';
import suspenseSfx from '@/assets/audio/sfx/suspense.m4a';
import notesImage from '@/assets/textures/card_modal.png';
import HoverButton from './HoverButton';

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
   const { setTooltip } = useTooltip();
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

   useEffect(() => {
      if (stage === 'Endgame' && !accusing) {
         setTooltip({
            label: 'Open your notes',
         });
      } else if (accusing) {
         // setTooltip(null);
      }
   }, [stage, accusing]);

   function handleAccusation() {
      if (Object.values(acccusation).includes(null) || accusing || stage !== 'Endgame')
         return;
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
                     disabled={
                        Object.values(acccusation).includes(null) ||
                        stage !== 'Endgame' ||
                        accusing
                     }
                     tooltip={
                        playerID && players && players[playerID]?.isEliminated
                           ? null
                           : stage !== 'Endgame'
                           ? 'Go to CLUE!'
                           : Object.values(acccusation).includes(null)
                           ? `
                              Select a
                              ${
                                 acccusation.suspect === null
                                    ? ' Suspect'
                                    : acccusation.weapon === null
                                    ? ' Weapon'
                                    : acccusation.room === null && ' Room'
                              }!`
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
