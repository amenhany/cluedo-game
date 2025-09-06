import Modal from './Modal';
import SegmentedSlider from './SegmentedSlider';
import { useSettings } from '@/contexts/SettingsContext';
import buttonSfx from '@/assets/audio/sfx/settings_button.wav';
import { AudioManager } from '@/lib/AudioManager';
import type { Settings } from '@/types/electron';

const LANGUAGE_MAPPING: Record<Lang, string> = {
   en: 'English',
   ar: 'Arabic',
};

export default function Settings({ onClose }: { onClose: () => void }) {
   const { settings, update } = useSettings();

   function toggleList<K extends keyof Settings>(option: K, list: Settings[K][]) {
      if (!settings) return;
      const currentIndex = list.indexOf(settings[option]);
      const nextIndex = (currentIndex + 1) % list.length;
      update({ [option]: list[nextIndex] });

      AudioManager.getInstance().playSfx(buttonSfx);
   }

   return (
      <Modal onClose={onClose} title="Settings" texture="board">
         <ul>
            <li>
               <label>Master Volume</label>
               <SegmentedSlider
                  value={settings ? settings.masterVolume * 10 : 10}
                  onChange={(value) => update({ masterVolume: value / 10 })}
               />
            </li>
            <li>
               <label>Music Volume</label>
               <SegmentedSlider
                  value={settings ? settings.musicVolume * 10 : 10}
                  onChange={(value) => update({ musicVolume: value / 10 })}
               />
            </li>
            <li>
               <label>SFX Volume</label>
               <SegmentedSlider
                  value={settings ? settings.sfxVolume * 10 : 10}
                  onChange={(value) => update({ sfxVolume: value / 10 })}
               />
            </li>
            <li>
               <label>Language</label>
               <button
                  onClick={() =>
                     toggleList('lang', Object.keys(LANGUAGE_MAPPING) as Lang[])
                  }
               >
                  {settings ? LANGUAGE_MAPPING[settings.lang] : LANGUAGE_MAPPING['en']}
               </button>
            </li>
            <li>
               <label>Filter</label>
               <button onClick={() => toggleList('filter', ['none', 'b&w'])}>
                  {settings && settings.filter.toUpperCase()}
               </button>
            </li>
         </ul>
      </Modal>
   );
}
