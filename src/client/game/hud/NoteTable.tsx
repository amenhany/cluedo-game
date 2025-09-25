import { AudioManager } from '@/lib/AudioManager';
import { t } from '@/lib/lang';
import type { Card, Suggestion, PlayerState, NullableSuggestion } from '@/types/game';
import type { PlayerID } from 'boardgame.io';
import { useState } from 'react';
import clickSfx from '@/assets/audio/sfx/card_select.m4a';

export default function NoteTable({
   arr,
   type,
   players,
   accusation,
   setAccusation,
   displayNames = false,
}: {
   arr: Card[];
   type: keyof Suggestion;
   players: Record<PlayerID, PlayerState>;
   accusation: NullableSuggestion;
   setAccusation: React.Dispatch<React.SetStateAction<NullableSuggestion>>;
   displayNames?: boolean;
}) {
   const [tick, setTick] = useState<Record<string, '✓' | 'X' | ''>>();

   function cycleTick(id: string) {
      if (tick === undefined) return setTick({ [id]: '✓' });
      const list: ('✓' | 'X' | '')[] = ['✓', 'X', ''];
      const currentIndex = list.indexOf(tick[id]);
      const nextIndex = (currentIndex + 1) % list.length;
      setTick((prev) => ({
         ...prev,
         [id]: list[nextIndex],
      }));

      AudioManager.getInstance().playSfx(clickSfx);
   }

   function selectAccusor(id: Card) {
      if (Object.values(accusation).includes(id)) {
         setAccusation((prev) => ({ ...prev, [type]: null }));
      } else
         setAccusation((prev) => ({
            ...prev,
            [type]: id,
         }));

      AudioManager.getInstance().playSfx(clickSfx);
   }

   return (
      <table>
         <thead>
            <tr>
               <th scope="col">{t(`hud.notes.${type}`)}</th>
               {Object.values(players).map((player) => {
                  if (!player.hand.length) return;
                  const char = player.character[0].toUpperCase();
                  return <th key={player.id}>{displayNames && char}</th>;
               })}
               <th className="accusation-column"></th>
            </tr>
         </thead>
         <tbody>
            {arr.map((item) => (
               <tr key={item}>
                  <th scope="row">{t(`${type}.${item}`)}</th>
                  {Object.entries(players).map(([id, player]) => {
                     if (!player.hand.length) return;
                     const key = `${item}-${id}`;
                     return (
                        <td key={key}>
                           <div className="center">
                              <button className="tick" onClick={() => cycleTick(key)}>
                                 {tick && tick[key] ? tick[key] : ''}
                              </button>
                           </div>
                        </td>
                     );
                  })}
                  <td>
                     <div className="center">
                        <button className="accusor" onClick={() => selectAccusor(item)}>
                           {Object.values(accusation).includes(item) && 'O'}
                        </button>
                     </div>
                  </td>
               </tr>
            ))}
         </tbody>
      </table>
   );
}
