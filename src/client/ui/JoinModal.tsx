import type { JoinOptions } from '@/types/client';
import { useState, type ChangeEvent } from 'react';
import Modal from './Modal';
import { useSceneTransition } from '@/contexts/SceneTransitionContext';
import selectSfx from '@/assets/audio/sfx/card_select.wav';
import lockedSfx from '@/assets/audio/sfx/card_locked.wav';
import { AudioManager } from '@/lib/AudioManager';
import { isServerAlive } from '@/lib/util';

export default function JoinModal({
   onJoin,
   onClose,
}: {
   onJoin: (options: JoinOptions) => Promise<void>;
   onClose: () => void;
}) {
   const [options, setOptions] = useState<JoinOptions>({
      playerName: '',
      ip: '',
   });
   const [isDisabled, setIsDisabled] = useState(false);
   const [error, setError] = useState<string | null>(null);
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

   async function handleJoin() {
      if (isDisabled) return;
      if (invalid) {
         AudioManager.getInstance().playSfx(lockedSfx);
         return;
      }

      const isIpValid = await isServerAlive(options.ip);
      if (!isIpValid) {
         setError('Invalid IP');
         AudioManager.getInstance().playSfx(lockedSfx);
         return;
      }

      setError(null);
      setIsDisabled(true);
      triggerTransition(() => {
         onJoin(options).catch((e) => {
            if (e.message.slice(-3) === '409') setError('Server is full! (6)');
            else setError(e.details);
            setIsDisabled(false);
         });
      }, 'iris');
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
         {error && <span className="error-message">{error}</span>}
      </Modal>
   );
}
