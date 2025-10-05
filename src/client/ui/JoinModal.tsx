import type { JoinOptions } from '@/types/client';
import { useState, type ChangeEvent } from 'react';
import Modal from './Modal';
import { useSceneTransition } from '@/contexts/SceneTransitionContext';
import selectSfx from '@/assets/audio/sfx/card_select.wav';
import lockedSfx from '@/assets/audio/sfx/card_locked.wav';
import { AudioManager } from '@/lib/AudioManager';

export default function JoinModal({
   onJoin,
   onClose,
}: {
   onJoin: (options: JoinOptions) => void;
   onClose: () => void;
}) {
   const [options, setOptions] = useState<JoinOptions>({
      playerName: '',
      ip: '',
   });
   const [isDisabled, setIsDisabled] = useState(false);
   const invalid = options.playerName.trim() === '' || options.ip.trim() === '';
   const { triggerTransition } = useSceneTransition();

   function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') {
         e.preventDefault();
         handleJoin();
      }
   }

   function handleChange(evt: ChangeEvent<HTMLInputElement>) {
      setOptions((currData) => ({
         ...currData,
         [evt.target.name]: evt.target.value.trim(),
      }));
   }

   function handleJoin() {
      if (isDisabled) return;
      if (invalid) {
         AudioManager.getInstance().playSfx(lockedSfx);
         return;
      }
      setIsDisabled(true);
      triggerTransition(() => onJoin(options), 'iris');
   }

   return (
      <Modal title="Join Game" texture="card" onClose={onClose} className="game-modal">
         <ul>
            <li>
               <label htmlFor="playerName">Player Name</label>
               <input
                  name="playerName"
                  id="playerName"
                  value={options.playerName}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => AudioManager.getInstance().playSfx(selectSfx)}
               />
            </li>
            <li>
               <label htmlFor="ip">Server IP</label>
               <input
                  name="ip"
                  id="ip"
                  value={options.ip}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => AudioManager.getInstance().playSfx(selectSfx)}
               />
            </li>
         </ul>

         <button
            onClick={handleJoin}
            aria-disabled={invalid || isDisabled}
            className="game-button"
         >
            JOIN
         </button>
      </Modal>
   );
}
