import { PORT } from '@/game/constants';
import type { HostOptions } from '@/types/client';
import { useState, type ChangeEvent } from 'react';
import Modal from './Modal';
import { useSceneTransition } from '@/contexts/SceneTransitionContext';
import lockedSfx from '@/assets/audio/sfx/card_locked.wav';
import selectSfx from '@/assets/audio/sfx/card_select.wav';
import { AudioManager } from '@/lib/AudioManager';

export default function HostModal({
   onHost,
   onClose,
}: {
   onHost: (options: HostOptions) => void;
   onClose: () => void;
}) {
   const [options, setOptions] = useState<HostOptions>({
      playerName: '',
      port: PORT,
   });
   const [isDisabled, setIsDisabled] = useState(false);
   const invalid = options.playerName.trim() === '';
   const { triggerTransition } = useSceneTransition();

   function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') {
         e.preventDefault();
         handleHost();
      }
   }

   function handleChange(evt: ChangeEvent<HTMLInputElement>) {
      setOptions((currData) => ({
         ...currData,
         [evt.target.name]: evt.target.value.trim(),
      }));
   }

   function handleHost() {
      if (isDisabled) return;
      if (invalid) {
         AudioManager.getInstance().playSfx(lockedSfx);
         return;
      }
      setIsDisabled(true);
      triggerTransition(() => onHost(options), 'iris');
   }

   return (
      <Modal title="Host Game" texture="card" onClose={onClose}>
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
               <label htmlFor="port">Port</label>
               <input
                  name="port"
                  id="port"
                  value={options.port}
                  type="number"
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => AudioManager.getInstance().playSfx(selectSfx)}
               />
            </li>
         </ul>

         <button onClick={handleHost} aria-disabled={invalid || isDisabled}>
            Host
         </button>
      </Modal>
   );
}
