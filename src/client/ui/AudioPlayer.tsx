import { useEffect, useState } from 'react';
import record from '@/assets/textures/record.png';
import { ChevronDown, SkipForward } from 'lucide-react';
import { backInOut, motion, useAnimationControls } from 'motion/react';
import { AudioManager } from '@/lib/AudioManager';
import { t } from '@/lib/lang';

type Track = {
   audio: string;
   cover: string;
   name: string;
   author: string;
};

export default function AudioPlayer({ tracks }: { tracks: Track[] }) {
   const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isShown, setIsShown] = useState(false);
   const audioManager = AudioManager.getInstance();
   const controls = useAnimationControls();

   useEffect(() => {
      const timeout = setTimeout(playTrack, 2000);
      const interval = setInterval(playTrack, 1000 * 60 * 7);
      return () => {
         clearInterval(interval);
         clearTimeout(timeout);
         audioManager.stopMusic();
      };
   }, []);

   useEffect(() => {
      setTimeout(() => controls.start('open'), 500);
      setIsShown(true);
      const timeout = setTimeout(() => setIsShown(false), 6000);
      return () => clearTimeout(timeout);
   }, [currentTrack]);

   useEffect(() => {
      if (!isShown) {
         controls.start('close');
      } else {
         controls.start('open');
      }
   }, [isShown]);

   function playTrack() {
      audioManager.stopMusic();
      const track = tracks.filter((track) => track.audio !== currentTrack?.audio)[
         Math.floor(Math.random() * (tracks.length - 1))
      ];
      setCurrentTrack(track);
      setIsPlaying(true);
      audioManager.playMusic(track.audio, false, () => setIsPlaying(false));
   }

   function handleShowButton() {
      if (isShown) {
         setIsShown(false);
      } else {
         setIsShown(true);
      }
   }

   if (!currentTrack) return <></>;
   return (
      <motion.div
         className="audio-player"
         variants={{
            open: {
               y: 0,
            },
            close: {
               y: '100%',
            },
         }}
         initial="close"
         animate={controls}
         exit="close"
         transition={{
            duration: 0.5,
            type: 'tween',
            ease: backInOut,
         }}
      >
         <div
            className={'show-arrow' + (isShown ? ' down' : ' up')}
            onClick={handleShowButton}
         >
            <ChevronDown />
         </div>
         <div className="container">
            <div className={'audio-art' + (isPlaying ? ' playing' : '')}>
               <img src={record} alt="Record" className="record" />
               <img src={currentTrack.cover} alt="Album Cover" className="album-cover" />
            </div>
            <div className="audio-info">
               <h2>{t(currentTrack.name)}</h2>
               <h3>{t(currentTrack.author)}</h3>
               {tracks.length && (
                  <button onClick={playTrack}>
                     <SkipForward />
                  </button>
               )}
            </div>
         </div>
      </motion.div>
   );
}
