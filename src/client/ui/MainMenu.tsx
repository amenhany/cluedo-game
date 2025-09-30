import music1 from '@/assets/audio/music/menu/menu1.mp3';
import music3 from '@/assets/audio/music/menu/menu3.mp3';
import music2 from '@/assets/audio/music/menu/menu2.mp3';
import music4 from '@/assets/audio/music/menu/menu4.mp3';
import music5 from '@/assets/audio/music/menu/menu5.mp3';
import cover1 from '@/assets/textures/albums/menu1.jpeg';
import cover2 from '@/assets/textures/albums/menu2.jpeg';
import cover3 from '@/assets/textures/albums/menu3.jpeg';
import cover4 from '@/assets/textures/albums/menu4.jpeg';
import cover5 from '@/assets/textures/albums/menu5.jpg';
import modalOpen from '@/assets/audio/sfx/modal_open.wav';
import cardUp from '@/assets/audio/sfx/card_up.wav';
import cardDown from '@/assets/audio/sfx/card_down.wav';
import select from '@/assets/audio/sfx/select.wav';

import '@/assets/styles/menu.scss';
import AudioPlayer from './AudioPlayer';
import { useState } from 'react';
import { Settings, DoorOpen, DoorClosed } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import SettingsScreen from './Settings';
import { AudioManager } from '@/lib/AudioManager';
import { useSettings } from '@/contexts/SettingsContext';
import type { HostOptions, JoinOptions } from '@/types/client';
import HostModal from './HostModal';
import JoinModal from './JoinModal';

const tracks = [
   {
      audio: music1,
      cover: cover1,
      name: 'Indi Thika Feek',
      author: 'Fairuz',
   },
   {
      audio: music2,
      cover: cover2,
      name: 'Khalleek Be El Bait',
      author: 'Fairuz',
   },
   {
      audio: music3,
      cover: cover3,
      name: 'Albi Ou Meftahou',
      author: 'Farid al-Atrash',
   },
   {
      audio: music4,
      cover: cover4,
      name: "Can't Take My Eyes off You",
      author: 'Frankie Valli',
   },
   {
      audio: music5,
      cover: cover5,
      name: 'Bahlam Maak',
      author: 'Najaat Al Saghira',
   },
];

export default function MainMenu({
   onHost,
   onJoin,
}: {
   onHost: (options: HostOptions) => void;
   onJoin: (options: JoinOptions) => void;
}) {
   const [hoverClose, setHoverClose] = useState(false);
   const [openSettings, setOpenSettings] = useState(false);
   const [hostModal, setHostModal] = useState(false);
   const [joinModal, setJoinModal] = useState(false);
   const { settings } = useSettings();

   return (
      <div
         className="menu"
         style={{ filter: settings?.filter === 'b&w' ? 'grayscale(100%)' : 'none' }}
      >
         <h1>
            <span>C</span>LUEDO
         </h1>
         <div className="button-container">
            <button
               onClick={() => {
                  AudioManager.getInstance().playSfx(cardUp);
                  setHostModal(true);
               }}
            >
               <p>Host Game</p>
            </button>
            <button
               onClick={() => {
                  AudioManager.getInstance().playSfx(cardUp);
                  setJoinModal(true);
               }}
            >
               <p>Join Game</p>
            </button>
            <motion.button
               className="button-icon"
               variants={{
                  initial: {
                     rotate: 0,
                  },
                  active: {
                     rotate: 30,
                  },
               }}
               initial="initial"
               whileHover="active"
               onClick={() => {
                  setOpenSettings(true);
                  AudioManager.getInstance().playSfx(modalOpen);
               }}
            >
               <Settings size={40} />
            </motion.button>
            <button
               onClick={() => {
                  AudioManager.getInstance().playSfx(select);
                  setTimeout(close, 100);
               }}
               className="button-icon"
               onMouseEnter={() => setHoverClose(true)}
               onMouseLeave={() => setHoverClose(false)}
            >
               {hoverClose ? <DoorOpen size={40} /> : <DoorClosed size={40} />}
            </button>
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
