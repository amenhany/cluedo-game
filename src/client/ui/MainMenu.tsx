import music1 from '@/assets/audio/music/menu/menu1.mp3';
import music3 from '@/assets/audio/music/menu/menu3.mp3';
import music2 from '@/assets/audio/music/menu/menu2.mp3';
import music4 from '@/assets/audio/music/menu/menu4.mp3';
import music5 from '@/assets/audio/music/menu/menu5.mp3';
import music6 from '@/assets/audio/music/menu/menu6.mp3';
import cover1 from '@/assets/textures/albums/menu1.jpeg';
import cover2 from '@/assets/textures/albums/menu2.jpeg';
import cover3 from '@/assets/textures/albums/menu3.jpeg';
import cover4 from '@/assets/textures/albums/menu4.jpeg';
import cover5 from '@/assets/textures/albums/menu5.jpg';
import cardUp from '@/assets/audio/sfx/card_up.wav';
import cardDown from '@/assets/audio/sfx/card_down.wav';

import '@/assets/styles/menu.scss';
import AudioPlayer from './AudioPlayer';
import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { AudioManager } from '@/lib/AudioManager';
import { useSettings } from '@/contexts/SettingsContext';
import type { HostOptions, JoinOptions } from '@/types/client';
import HostModal from './HostModal';
import JoinModal from './JoinModal';
import { t } from '@/lib/lang';
import NavButtons from './NavButtons';
import SettingsScreen from './SettingsScreen';

export default function MainMenu({
   onHost,
   onJoin,
}: {
   onHost: (options: HostOptions) => void;
   onJoin: (options: JoinOptions) => Promise<void>;
}) {
   const [openSettings, setOpenSettings] = useState(false);
   const [hostModal, setHostModal] = useState(false);
   const [joinModal, setJoinModal] = useState(false);
   const { settings } = useSettings();
   const tracks = [
      {
         audio: music1,
         cover: cover1,
         name: 'credits.music.track1',
         author: 'credits.music.author1',
      },
      {
         audio: music2,
         cover: cover2,
         name: 'credits.music.track2',
         author: 'credits.music.author1',
      },
      {
         audio: music3,
         cover: cover3,
         name: 'credits.music.track3',
         author: 'credits.music.author2',
      },
      {
         audio: music4,
         cover: cover4,
         name: 'credits.music.track4',
         author: 'credits.music.author3',
      },
      {
         audio: music5,
         cover: cover5,
         name: 'credits.music.track5',
         author: 'credits.music.author4',
      },
      {
         audio: music6,
         cover: cover1,
         name: 'credits.music.track6',
         author: 'credits.music.author1',
      },
   ];

   return (
      <div
         className="menu"
         style={{ filter: settings?.filter === 'b&w' ? 'grayscale(100%)' : 'none' }}
      >
         <h1>
            <span>{t('menu.main.title')[0]}</span>
            {t('menu.main.title').slice(1)}
         </h1>
         <div className="button-container">
            <button
               onClick={() => {
                  AudioManager.getInstance().playSfx(cardUp);
                  setHostModal(true);
               }}
            >
               <p>{t('menu.main.host')}</p>
            </button>
            <button
               onClick={() => {
                  AudioManager.getInstance().playSfx(cardUp);
                  setJoinModal(true);
               }}
            >
               <p>{t('menu.main.join')}</p>
            </button>
            <NavButtons setOpenSettings={setOpenSettings} />
         </div>
         <AudioPlayer tracks={tracks} />
         <AnimatePresence>
            {openSettings && <SettingsScreen onClose={() => setOpenSettings(false)} />}
            {hostModal && (
               <HostModal
                  onHost={onHost}
                  onClose={() => {
                     AudioManager.getInstance().playSfx(cardDown);
                     setHostModal(false);
                  }}
               />
            )}
            {joinModal && (
               <JoinModal
                  onJoin={onJoin}
                  onClose={() => {
                     AudioManager.getInstance().playSfx(cardDown);
                     setJoinModal(false);
                  }}
               />
            )}
         </AnimatePresence>
      </div>
   );
}
