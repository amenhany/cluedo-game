import type { PlayerID } from 'boardgame.io';
import type { PlayerState, Stage } from '@/types/game';
import { AnimatePresence, motion } from 'motion/react';
import Dice from './Dice';
import Card from './Card';
import '@/assets/styles/hud.scss';
import { useSettings } from '@/contexts/SettingsContext';
import { useSuggestion } from '@/contexts/SuggestionContext';
import { cluedoGraph } from '@/game/board/boardGraph';
import { useEffect, useState } from 'react';
import { t } from '@/lib/lang';

type HudProps = {
   players?: Record<PlayerID, PlayerState>;
   currentPlayer: PlayerID;
   playerID?: PlayerID;
   moves: Record<string, (...args: any[]) => void>;
   active: boolean;
   stage: Stage | null;
};

export default function CluedoHud({
   players,
   currentPlayer,
   playerID,
   moves,
   active,
   stage,
}: HudProps) {
   const { settings } = useSettings();
   const playerNode =
      (players && playerID && cluedoGraph[players[playerID].position]) || null;
   const roomNode = (playerNode?.type === 'room' && playerNode) || null;
   const { canSuggest, completeSuggestion, resolver, suggestion, startSuggestion } =
      useSuggestion();

   function handleSuggest() {
      moves.makeSuggestion();
   }

   console.log(roomNode?.id, suggestion, canSuggest);

   return (
      <div
         className="hud"
         style={{ filter: settings?.filter === 'b&w' ? 'grayscale(100%)' : 'none' }}
      >
         <AnimatePresence>
            {active && !suggestion && (
               <Dice
                  key="dice"
                  face={
                     playerID && players && players[playerID].steps
                        ? players[playerID].steps
                        : 0
                  }
                  onRoll={moves.handleRoll}
                  disabled={!(active && stage === 'TurnAction')}
               />
            )}
         </AnimatePresence>

         <div className="turn-container">
            <h1>
               {players &&
                  (currentPlayer !== playerID
                     ? `${players[currentPlayer].character}'s Turn`
                     : 'Your Turn')}
            </h1>
         </div>

         {suggestion && (
            <div className="suggestion">
               <h2>Suggestion</h2>
               <ul>
                  <li>
                     Suspect :{' '}
                     {suggestion.suspect ? t(`suspect.${suggestion.suspect}`) : 'NONE'}
                  </li>
                  <li>
                     Weapon :{' '}
                     {suggestion.weapon ? t(`weapon.${suggestion.weapon}`) : 'NONE'}
                  </li>
                  <li>
                     Room : {suggestion.room ? t(`room.${suggestion.room}`) : 'NONE'}
                  </li>
               </ul>
            </div>
         )}

         {(canSuggest || (suggestion?.suggester === playerID && !resolver)) &&
            roomNode !== null && (
               <div className="suggest-container">
                  {!suggestion ? (
                     <>
                        <button onClick={() => startSuggestion(roomNode.id)}>
                           Make a Suggestion
                        </button>
                        {stage === 'RoomAction' && (
                           <button onClick={moves.endTurn}>End Turn</button>
                        )}
                     </>
                  ) : !completeSuggestion ? (
                     <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                           duration: 0.2,
                           delay: 1.35,
                           ease: 'easeIn',
                        }}
                     >
                        Please select a
                        {suggestion.suspect === null
                           ? ' Suspect'
                           : suggestion.weapon === null && ' Weapon'}
                     </motion.h1>
                  ) : (
                     <button onClick={handleSuggest}>Suggest</button>
                  )}
               </div>
            )}

         {suggestion && players && suggestion.suggester !== playerID && !resolver && (
            <div className="suggest-container">
               <h1>
                  Waiting for {players[suggestion.suggester].character}
                  <WaitingDots />
               </h1>
            </div>
         )}

         {resolver && resolver.id !== playerID && (
            <div className="suggest-container">
               <h1>
                  Waiting for {resolver?.character}
                  <WaitingDots />
               </h1>
            </div>
         )}

         <motion.div
            className="deck"
            initial={{ bottom: '-50vh' }}
            whileHover={{ bottom: '50vh' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
         >
            {playerID &&
               players &&
               players[playerID].hand.map((card) => <Card key={card} id={card} />)}
         </motion.div>
      </div>
   );
}

function WaitingDots({ duration = 700 }: { duration?: number }) {
   const [active, setActive] = useState(0);

   useEffect(() => {
      const interval = setInterval(() => {
         setActive((prev) => (prev + 1) % 4); // cycle 0–3
      }, duration);
      return () => clearInterval(interval);
   }, []);

   return (
      <span style={{ display: 'inline-block', width: '1.5em', textAlign: 'left' }}>
         <span style={{ visibility: active >= 1 ? 'visible' : 'hidden' }}>.</span>
         <span style={{ visibility: active >= 2 ? 'visible' : 'hidden' }}>.</span>
         <span style={{ visibility: active >= 3 ? 'visible' : 'hidden' }}>.</span>
      </span>
   );
}
