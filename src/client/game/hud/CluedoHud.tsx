import type { Ctx, PlayerID } from 'boardgame.io';
import type {
   Card as TCard,
   Character,
   PlayerState,
   Room,
   Stage,
   Weapon,
   Suggestion,
   GameState,
} from '@/types/game';
import { AnimatePresence } from 'motion/react';
import Dice from './Dice';
import '@/assets/styles/hud.scss';
import { useSettings } from '@/contexts/SettingsContext';
import { useSuggestion } from '@/contexts/SuggestionContext';
import { t } from '@/lib/lang';
import { TooltipProvider } from '@/contexts/TooltipContext';
import SuggestionTooltip from './SuggestionTooltip';
import Hand from './Hand';
import Card from './Card';
import { CARDS } from '@/game/constants';
import Popup from './Popup';
import { useEffect, useRef, useState } from 'react';
import type { PopupConfig } from '@/types/client';
import { AudioManager } from '@/lib/AudioManager';
import popupSfx from '@/assets/audio/sfx/popup.m4a';
import DetectiveNotes from './DetectiveNotes';
import GameOver from './GameOver';

type HudProps = {
   players?: Record<PlayerID, PlayerState>;
   deck: GameState['deck'];
   prevSuggestion: GameState['prevSuggestion'];
   ctx: Ctx;
   currentPlayer: PlayerID;
   playerID?: PlayerID;
   moves: Record<string, (...args: any[]) => void>;
   active: boolean;
   stage: Stage | null;
};

export default function CluedoHud(props: HudProps) {
   const { players, currentPlayer, playerID, moves, active, stage, deck, ctx } = props;
   const { settings } = useSettings();
   const { resolver, suggestion } = useSuggestion();
   const suggestionCards = suggestion
      ? [suggestion.suspect, suggestion.weapon, suggestion.room]
      : [];

   const [popupConfig, setPopupConfig] = useState<PopupConfig & { visible: boolean }>({
      children: <></>,
      onClick: () => {
         setPopupConfig((prev) => ({ ...prev, visible: false }));
      },
      visible: false,
   });
   const seenCards = (players && playerID && players[playerID].seenCards) || [];
   const prevSeenCards = useRef<TCard[]>([]);
   const prevResolver = useRef<PlayerState | null>(null);

   useEffect(() => {
      if (prevSeenCards.current.length !== seenCards.length && seenCards.length) {
         const card = seenCards[seenCards.length - 1];
         const type = getCardType(card);
         const name = deck.includes(card) ? 'The deck' : prevResolver.current?.character;
         setPopupConfig((prev) => ({
            ...prev,
            visible: true,
            children: <Card id={card} playable={false} type={type!}></Card>,
            bottomText: `${name} has ${t(`${type}.${card}`)}!`,
         }));
         AudioManager.getInstance().playSfx(popupSfx);
         setTimeout(() => {
            setPopupConfig((prev) => ({ ...prev, visible: false }));
         }, 4000);
         prevSeenCards.current = seenCards;
      }

      if (resolver) prevResolver.current = resolver;
   }, [resolver, seenCards]);

   return (
      <div
         className="hud"
         style={{ filter: settings?.filter === 'b&w' ? 'grayscale(100%)' : 'none' }}
      >
         <TooltipProvider>
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

            <SuggestionTooltip {...props} />
            {players && playerID && (
               <Hand
                  hand={players[playerID].hand.map((card) => ({
                     type: getCardType(card) as keyof Suggestion,
                     card,
                     playable:
                        (suggestion &&
                           resolver?.id === playerID &&
                           !players[suggestion.suggester].seenCards.includes(card) &&
                           suggestionCards.includes(card)) ||
                        false,
                  }))}
                  moves={{ showCard: moves.showCard }}
               />
            )}

            <DetectiveNotes
               stage={stage}
               makeAccusation={moves.makeAccusation}
               players={players || {}}
               playerID={playerID}
               ctx={ctx}
            />

            <GameOver
               playerID={playerID}
               winner={ctx.gameover?.winner}
               players={players}
            />

            <AnimatePresence>
               {popupConfig.visible && (
                  <Popup
                     onClick={popupConfig.onClick}
                     bottomText={popupConfig.bottomText}
                  >
                     {popupConfig.children}
                  </Popup>
               )}
            </AnimatePresence>
            {/* <Popup onClick={() => {}} bottomText="Ahmad has Miss Scarlett!">
               <Card type="suspect" id="scarlett" playable={false} />
            </Popup> */}
         </TooltipProvider>
      </div>
   );
}

function getCardType(card: TCard) {
   if (CARDS.suspects.includes(card as Character)) return 'suspect';
   else if (CARDS.weapons.includes(card as Weapon)) return 'weapon';
   else if (CARDS.rooms.includes(card as Room)) return 'room';
}
