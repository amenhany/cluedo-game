import { useEffect, useState } from 'react';
import MainMenu from './ui/MainMenu';
import { CluedoClient } from './game/CluedoClient';
import { SceneTransitionProvider } from './contexts/SceneTransitionContext';
import FilmFilter from './FilmFilter';
import { AudioManager } from '@/lib/AudioManager';
import opticalStart from '@/assets/audio/sfx/optical_start.wav';
import opticalLoop from '@/assets/audio/sfx/optical_loop.wav';
import { SettingsProvider } from './contexts/SettingsContext';
import { LobbyClient } from 'boardgame.io/client';
import type { ClientOptions, HostOptions, JoinOptions } from '@/types/client';
import CluedoLobby from './game/lobby/CluedoLobby';

export default function App() {
   const [gameState, setGameState] = useState<'menu' | 'lobby' | 'game'>('menu');
   const [clientOptions, setClientOptions] = useState<ClientOptions>();
   const [isHost, setIsHost] = useState(false);

   useEffect(() => {
      // AudioManager.getInstance().playStatic(opticalStart, false, () =>
      //    AudioManager.getInstance().playStatic(opticalLoop)
      // );
   }, []);

   async function hostGame(options: HostOptions) {
      const result = await window.api.game.startServer({ port: options.port });
      if (!result.ok) {
         throw new Error(result.message);
      }

      const serverURL = `http://localhost:${options.port}`;
      const lobbyClient = new LobbyClient({ server: serverURL });

      const { matchID } = await lobbyClient.createMatch('cluedo', {
         numPlayers: 6,
         setupData: { started: false, rules: {}, players: [] },
      });

      const { playerCredentials, playerID } = await lobbyClient.joinMatch(
         'cluedo',
         matchID,
         { playerID: '0', playerName: options.playerName }
      );

      setClientOptions({
         server: serverURL,
         matchID,
         playerID,
         credentials: playerCredentials,
      });
      setGameState('lobby');
      setIsHost(true);
   }

   async function joinGame(options: JoinOptions) {
      const serverURL = `http://${options.ip}`;
      const lobbyClient = new LobbyClient({ server: serverURL });

      const { matches } = await lobbyClient.listMatches('cluedo');
      if (matches.length === 0) throw new Error('No match running on host');

      const matchID = matches[0].matchID;

      const { playerCredentials, playerID } = await lobbyClient.joinMatch(
         'cluedo',
         matchID,
         { playerName: options.playerName }
      );

      setClientOptions({
         server: serverURL,
         matchID,
         playerID,
         credentials: playerCredentials,
      });
      setGameState('lobby');
   }

   function startGame(newMatchID: string) {
      setGameState('game');
      setClientOptions((prev) => ({ ...prev, matchID: newMatchID } as ClientOptions));
   }

   return (
      <>
         <SettingsProvider>
            <SceneTransitionProvider>
               {gameState === 'menu' ? (
                  <MainMenu onHost={hostGame} onJoin={joinGame} />
               ) : gameState === 'lobby' && clientOptions ? (
                  <CluedoLobby {...clientOptions} isHost={isHost} onStart={startGame} />
               ) : (
                  clientOptions && <CluedoClient {...clientOptions} />
               )}
            </SceneTransitionProvider>
            {/* <FilmFilter /> */}
         </SettingsProvider>
      </>
   );
}
