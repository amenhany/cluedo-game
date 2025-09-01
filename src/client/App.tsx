import { useEffect, useState } from 'react';
import MainMenu from './ui/MainMenu';
import { CluedoClient } from './game/CluedoClient';
import { SceneTransitionProvider } from './ui/SceneTransition';
import FilmFilter from './FilmFilter';
import { AudioManager } from './lib/AudioManager';
import opticalStart from '@/assets/audio/sfx/optical_start.wav';
import opticalLoop from '@/assets/audio/sfx/optical_loop.wav';

export default function App() {
   const [gameStarted, setGameStarted] = useState(false);

   useEffect(() => {
      AudioManager.getInstance().playStatic(opticalStart, false, () =>
         AudioManager.getInstance().playStatic(opticalLoop)
      );
   }, []);

   function handleHost() {
      setGameStarted(true);
   }

   function handleJoin() {
      setGameStarted(true);
   }

   return (
      <>
         <SceneTransitionProvider>
            {gameStarted ? (
               <CluedoClient playerID="0" />
            ) : (
               <MainMenu onHost={handleHost} onJoin={handleJoin} />
            )}
         </SceneTransitionProvider>
         <FilmFilter />
      </>
   );
}
