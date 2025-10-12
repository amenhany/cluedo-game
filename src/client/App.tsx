import { useEffect, useState } from 'react';
import MainMenu from './ui/MainMenu';
import { CluedoClient } from './game/CluedoClient';
import { SceneTransitionProvider } from './contexts/SceneTransitionContext';
// import FilmFilter from './FilmFilter';
// import { AudioManager } from '@/lib/AudioManager';
// import opticalStart from '@/assets/audio/sfx/optical_start.wav';
// import opticalLoop from '@/assets/audio/sfx/optical_loop.wav';
import { SettingsProvider } from './contexts/SettingsContext';
import { LobbyClient } from 'boardgame.io/client';
import type { ClientOptions, HostOptions, JoinOptions } from '@/types/client';
import CluedoLobby from './game/lobby/CluedoLobby';
import { MatchProvider } from './contexts/MatchProvider';
import type { Character } from '@/types/game';

export default function App() {
   const [gameState, setGameState] = useState<'menu' | 'lobby' | 'game'>('menu');
   const [clientOptions, setClientOptions] = useState<ClientOptions>();
   const [isHost, setIsHost] = useState(false);

   useEffect(() => {
      // AudioManager.getInstance().playStatic(opticalStart, false, () =>
      //    AudioManager.getInstance().playStatic(opticalLoop)
      // );
   }, []);

   useEffect(() => {
      if (!isHost || !clientOptions) return;
      const lobbyClient = new LobbyClient({ server: clientOptions.server });
      const interval = setInterval(async () => {
         const { matches } = await lobbyClient.listMatches('cluedo');
         if (gameState === 'menu')
            matches.forEach((match) => window.api.game.wipeMatch(match.matchID));
         else
            matches
               .filter(
                  (match) =>
                     match.gameover ||
                     (match.players.length === 0 && match.createdAt < Date.now() - 60_000)
               )
               .forEach((match) => {
                  window.api.game.wipeMatch(match.matchID);
               });
      }, 60_000);
      return () => clearInterval(interval);
   }, [isHost, clientOptions]);

   async function hostGame(options: HostOptions) {
      const result = await window.api.game.startServer({ port: options.port });
      if (!result.ok) {
         throw new Error(result.message);
      }

      const serverURL = `http://localhost:${options.port}`;
      const lobbyClient = new LobbyClient({ server: serverURL });

      const { matches } = await lobbyClient.listMatches('cluedo');
      matches.forEach((match) => window.api.game.wipeMatch(match.matchID));

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
      const lobby = matches.find((match) => match.setupData?.started === false);
      if (!lobby) {
         throw new Error(
            matches.length ? 'Game has already started.' : 'No match running on host.'
         );
      }

      const matchID = lobby.matchID;
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
      setIsHost(false);
   }

   async function playAgain(playerName: string, character: Character) {
      if (!clientOptions) return;
      const lobbyClient = new LobbyClient({ server: clientOptions.server });
      const { nextMatchID } = await lobbyClient.playAgain(
         'cluedo',
         clientOptions.matchID,
         {
            playerID: clientOptions.playerID,
            credentials: clientOptions.credentials,
            numPlayers: 6,
            setupData: { started: false, rules: {}, players: [] },
         }
      );
      const { playerID, playerCredentials } = await lobbyClient.joinMatch(
         'cluedo',
         nextMatchID,
         {
            playerID: clientOptions.playerID,
            playerName,
            data: { character },
         }
      );

      setGameState('lobby');
      setClientOptions({
         server: clientOptions.server,
         playerID,
         credentials: playerCredentials,
         matchID: nextMatchID,
      });
   }

   function startGame(newMatchID: string, newCredentials: string) {
      setGameState('game');
      setClientOptions(
         (prev) =>
            ({
               ...prev,
               matchID: newMatchID,
               credentials: newCredentials,
            } as ClientOptions)
      );
   }

   function leaveGame() {
      if (!clientOptions) return;
      const lobbyClient = new LobbyClient({ server: clientOptions.server });
      lobbyClient.leaveMatch('cluedo', clientOptions.matchID, {
         playerID: clientOptions.playerID,
         credentials: clientOptions.credentials,
      });
      setGameState('menu');
      setClientOptions(undefined);
      if (isHost) {
         window.api.game.closeServer();
      }
   }

   return (
      <>
         <SettingsProvider>
            <SceneTransitionProvider>
               <MatchProvider
                  {...clientOptions}
                  isHost={isHost}
                  playAgain={playAgain}
                  leaveGame={leaveGame}
               >
                  {gameState === 'menu' ? (
                     <MainMenu onHost={hostGame} onJoin={joinGame} />
                  ) : gameState === 'lobby' && clientOptions ? (
                     <CluedoLobby
                        {...clientOptions}
                        isHost={isHost}
                        onStart={startGame}
                        onLeave={leaveGame}
                     />
                  ) : (
                     clientOptions && <CluedoClient {...clientOptions} />
                  )}
               </MatchProvider>
            </SceneTransitionProvider>
            {/* <FilmFilter /> */}
         </SettingsProvider>
      </>
   );
}
