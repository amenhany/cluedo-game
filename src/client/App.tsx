import { useEffect, useState } from 'react';
import MainMenu from './ui/MainMenu';
import { CluedoClient } from './game/CluedoClient';
import { SceneTransitionProvider } from './contexts/SceneTransitionContext';
import FilmFilter from './FilmFilter';
import { AudioManager } from '@/lib/AudioManager';
import opticalStart from '@/assets/audio/sfx/optical_start.wav';
import opticalLoop from '@/assets/audio/sfx/optical_loop.wav';
import { SettingsProvider } from './contexts/SettingsContext';

export default function App() {
   const [gameStarted, setGameStarted] = useState(false);

   useEffect(() => {
      // AudioManager.getInstance().playStatic(opticalStart, false, () =>
      //    AudioManager.getInstance().playStatic(opticalLoop)
      // );
   }, []);

   function handleHost() {
      setGameStarted(true);
   }

   function handleJoin() {
      setGameStarted(true);
   }

   return (
      <>
         <SettingsProvider>
            <SceneTransitionProvider>
               {gameStarted ? (
                  <CluedoClient playerID="0" />
               ) : (
                  <MainMenu onHost={handleHost} onJoin={handleJoin} />
               )}
            </SceneTransitionProvider>
            {/* <FilmFilter /> */}
         </SettingsProvider>
      </>
   );
}
