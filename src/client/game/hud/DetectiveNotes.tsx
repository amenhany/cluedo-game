import { useTooltip } from '@/contexts/TooltipContext';
import { AudioManager } from '@/lib/AudioManager';
import type { NullableSuggestion, PlayerState, Stage, Suggestion } from '@/types/game';
import { useEffect, useState } from 'react';
import openSfx from '@/assets/audio/sfx/card_up.m4a';
import closeSfx from '@/assets/audio/sfx/card_down.m4a';
import { CARDS } from '@/game/constants';
import { motion } from 'motion/react';
import type { Ctx, PlayerID } from 'boardgame.io';
import NoteTable from './NoteTable';
import { t } from '@/lib/lang';
import suspenseSfx from '@/assets/audio/sfx/suspense.m4a';
import notesImage from '@/assets/textures/card_modal.png';

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

   useEffect(() => {
      if (stage === 'Endgame' && !accusing) {
         setTooltip({
            label: 'Open your notes',
         });
      } else if (accusing) {
         setTooltip(null);
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
            className="notes-trigger"
            onMouseEnter={() => {
               if (!playerID || players[playerID].isEliminated) return;
               setIsOpen((prev) => !prev);
               isOpen ? audioManager.playSfx(closeSfx) : audioManager.playSfx(openSfx);
            }}
         />
         <motion.div
            className={`notes ${isOpen ? 'expanded' : ''}`}
            animate={{ bottom: isOpen ? '6vh' : '-82vh', left: isOpen ? '50%' : '25%' }}
            transition={{ type: 'spring', stiffness: 250, damping: 28 }}
         >
            <img src={notesImage} alt="Detective Notes" className="notes-bg" />
            <div className="tables">
               <NoteTable
                  type="suspect"
                  arr={CARDS.suspects}
                  players={players}
                  accusation={acccusation}
                  setAccusation={setAccusation}
                  displayNames={true}
               />
               <NoteTable
                  type="weapon"
                  arr={CARDS.weapons}
                  players={players}
                  accusation={acccusation}
                  setAccusation={setAccusation}
               />
               <NoteTable
                  type="room"
                  arr={CARDS.rooms}
                  players={players}
                  accusation={acccusation}
                  setAccusation={setAccusation}
               />
            </div>
            <div className="accusation">
               <button
                  id="accusation-button"
                  onClick={handleAccusation}
                  disabled={
                     Object.values(acccusation).includes(null) ||
                     stage !== 'Endgame' ||
                     accusing
                  }
               >
                  {t('hud.notes.accusation')}
               </button>
               {stage !== 'Endgame' ? (
                  <span>Go to CLUE!</span>
               ) : (
                  Object.values(acccusation).includes(null) && (
                     <span>
                        Select a
                        {acccusation.suspect === null
                           ? ' Suspect'
                           : acccusation.weapon === null
                           ? ' Weapon'
                           : acccusation.room === null && ' Room'}
                        !
                     </span>
                  )
               )}
            </div>
         </motion.div>
      </>
   );
}
