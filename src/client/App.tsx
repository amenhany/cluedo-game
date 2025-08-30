import { useState } from 'react';
import MainMenu from './ui/MainMenu';
import { CluedoClient } from './game/CluedoClient';
import { SceneTransitionProvider } from './ui/SceneTransition';

export default function App() {
   const [gameStarted, setGameStarted] = useState(false);

   function handleHost() {
      setGameStarted(true);
   }

   function handleJoin() {
      setGameStarted(true);
   }

   return (
      <SceneTransitionProvider>
         {gameStarted ? (
            <CluedoClient playerID="0" />
         ) : (
            <MainMenu onHost={handleHost} onJoin={handleJoin} />
         )}
      </SceneTransitionProvider>
   );
}
