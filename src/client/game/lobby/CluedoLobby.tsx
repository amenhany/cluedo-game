import type { ClientOptions } from '@/types/client';
import { AnimatePresence, motion } from 'motion/react';
import CluedoBoard from '../board/CluedoBoard';
import { useEffect, useRef, useState } from 'react';
import { LobbyClient } from 'boardgame.io/client';
import '@/assets/styles/lobby.scss';
import type { LobbyAPI } from 'boardgame.io';
import { CARDS } from '@/game/constants';
import type { Character, Rules, SetupData } from '@/types/game';
import { AudioManager } from '@/lib/AudioManager';
import lockedSfx from '@/assets/audio/sfx/card_locked.wav';
import selectSfx from '@/assets/audio/sfx/card_select.wav';
import joinSfx from '@/assets/audio/sfx/join.wav';
import leaveSfx from '@/assets/audio/sfx/leave.wav';
import lobbyMusic from '@/assets/audio/music/game/lobby.wav';
import HoverButton from '../hud/HoverButton';
import { cluedoGraph } from '@/game/board/boardGraph';
import Node from '../board/Node';
import { t } from '@/lib/lang';
import { isDev } from '@/lib/util';
import SettingsScreen from '@/ui/SettingsScreen';
import NavButtons from '@/ui/NavButtons';
import { useSceneTransition } from '@/contexts/SceneTransitionContext';

type LobbyProps = ClientOptions & {
   isHost: boolean;
   onStart: (newMatchID: string, newCredentials: string) => void;
   onLeave: () => void;
};

export default function CluedoLobby({
   isHost,
   onStart,
   onLeave,
   server,
   matchID,
   playerID,
   credentials,
}: LobbyProps) {
   const [openSettings, setOpenSettings] = useState(false);
   const [match, setMatch] = useState<LobbyAPI.Match | null>(null);
   const port = server.split(':')[2];
   const lobbyClient = new LobbyClient({ server });
   const audioManager = AudioManager.getInstance();

   const [playerName, setPlayerName] = useState('');
   const [character, setCharacter] = useState<Character | null>(null);
   const [rules] = useState<Rules>({
      returnPlayersAfterSuggestion: false,
   });
   const [isTyping, setIsTyping] = useState(false);
   const [countdown, setCountdown] = useState<number | null>(null);
   const [gameId, setGameId] = useState<string | null>(null);
   const { triggerTransition } = useSceneTransition();

   useEffect(() => {
      const interval = setInterval(async () => {
         const { matches } = await lobbyClient.listMatches('cluedo');
         const game = matches.find((match) => match.setupData?.started === true);
         if (game && countdown === null && !isHost) setGameId(game.matchID);
         const m = await lobbyClient.getMatch('cluedo', matchID);
         setMatch(m);
      }, 1000);
      return () => clearInterval(interval);
   }, [matchID, credentials]);

   const players = match?.players ?? [];
   const player = players.find((p) => p.id.toString() === playerID);
   const takenCharacters = players.map((p) =>
      p.data?.character ? (p.data.character as Character) : null
   );
   const [readyPlayers, setReadyPlayers] = useState(
      players.filter((player) => player.data?.character !== undefined)
   );
   const invalidGame = readyPlayers.length < (isDev ? 1 : 3) || readyPlayers.length > 6;
   const readyPlayerLength = useRef(readyPlayers.length);

   useEffect(() => {
      audioManager.playMusic(lobbyMusic, true);
   }, []);

   useEffect(() => {
      console.log(readyPlayerLength.current);
      console.log(readyPlayers.length);
      if (readyPlayerLength.current < readyPlayers.length) {
         audioManager.playSfx(joinSfx);
         readyPlayerLength.current = readyPlayers.length;
      } else if (readyPlayerLength.current > readyPlayers.length) {
         audioManager.playSfx(leaveSfx);
         readyPlayerLength.current = readyPlayers.length;
      }
   }, [readyPlayers]);

   useEffect(() => {
      if (!match || !player) return;

      if (player.name && player.name !== playerName && !isTyping) {
         setPlayerName(player.name);
      }

      const serverCharacter = player.data?.character as Character | undefined;

      if (serverCharacter && serverCharacter !== character) {
         setCharacter(serverCharacter);
      } else if (!serverCharacter && !character) {
         const availableCharacter = CARDS.suspects.find(
            (c) => !takenCharacters.includes(c)
         );
         if (availableCharacter) saveCharacter(availableCharacter);
      }

      setReadyPlayers(
         players.filter(
            (player) => player.data?.character !== undefined && player.name !== undefined
         )
      );
   }, [match]);

   useEffect(() => {
      window.addEventListener('beforeunload', leaveGame);
      return () => window.removeEventListener('beforeunload', leaveGame);
   }, [server, matchID, playerID, credentials]);

   useEffect(() => {
      const debounce = setTimeout(() => {
         saveName(playerName);
      }, 2000);
      return () => clearTimeout(debounce);
   }, [playerName]);

   function saveName(newName: string) {
      lobbyClient.updatePlayer('cluedo', matchID, {
         playerID,
         credentials,
         newName,
      });
   }

   function saveCharacter(newCharacter: Character) {
      setCharacter(newCharacter);
      lobbyClient.updatePlayer('cluedo', matchID, {
         playerID,
         credentials,
         data: { character: newCharacter },
      });
   }

   async function startGame() {
      if (invalidGame || !isHost) return audioManager.playSfx(lockedSfx);

      const { matchID: gameID } = await lobbyClient.createMatch('cluedo', {
         numPlayers: readyPlayers.length,
         setupData: {
            started: true,
            rules,
            players: readyPlayers as SetupData['players'],
         } satisfies SetupData,
      });

      startCountdown(gameID);
   }

   function startCountdown(gameID: string) {
      if (countdown === null) {
         setCountdown(3);
         audioManager.playSfx(selectSfx);
         const timer = setInterval(() => {
            setCountdown((prev) => {
               if (prev === null) return null;
               audioManager.playSfx(selectSfx);
               if (prev > 1) return prev - 1;
               clearInterval(timer);
               joinGame(gameID);
               return 0;
            });
         }, 1000);
      }
   }

   async function joinGame(gameID: string) {
      await lobbyClient.leaveMatch('cluedo', matchID, {
         playerID,
         credentials,
      });
      const { playerCredentials } = await lobbyClient.joinMatch('cluedo', gameID, {
         playerID,
         playerName,
      });
      onStart(gameID, playerCredentials);
   }

   function leaveGame() {
      lobbyClient.updatePlayer('cluedo', matchID, {
         playerID,
         credentials,
         playerName: undefined,
         data: undefined,
      });
      lobbyClient.leaveMatch('cluedo', matchID, { playerID, credentials });
      triggerTransition(onLeave, 'iris');
   }

   if (!match) {
      return (
         <div className={`lobby alignment board-${character}`}>
            <CluedoBoard>
               <></>
            </CluedoBoard>
            <div className="lobby-ui">Loading Lobby...</div>
         </div>
      );
   }

   return (
      <div className="lobby">
         <div className={`alignment board-${character}`}>
            <CluedoBoard>
               {Object.values(cluedoGraph).map((node) => (
                  <Node
                     key={node.id}
                     node={node}
                     players={[]}
                     playerID={playerID}
                     weapon={null}
                     myTurn={false}
                  />
               ))}
            </CluedoBoard>
         </div>
         <motion.div
            className="lobby-ui"
            animate={{ opacity: countdown === null ? 1 : 0 }}
            transition={{ duration: 1, ease: 'easeIn', delay: 2 }}
         >
            <NavButtons
               setOpenSettings={setOpenSettings}
               exitFn={leaveGame}
               exitTooltip="Exit to Main Menu"
            />
            <div className="player-form">
               <label htmlFor="name">Name</label>
               <input
                  id="name"
                  name="name"
                  value={playerName}
                  onChange={(evt) => setPlayerName(evt.target.value.trim())}
                  onFocus={() => {
                     setIsTyping(true);
                     audioManager.playSfx(selectSfx);
                  }}
                  onBlur={() => {
                     saveName(playerName);
                     setIsTyping(false);
                  }}
               />
               <label htmlFor="character-select">Character</label>
               <select
                  name="character"
                  id="character-select"
                  value={character ?? ''}
                  onChange={(evt) => {
                     saveCharacter(evt.target.value as Character);
                     audioManager.playSfx(selectSfx);
                  }}
               >
                  {CARDS.suspects.map((suspect) => (
                     <option
                        key={suspect}
                        value={suspect}
                        disabled={takenCharacters.includes(suspect)}
                     >
                        {t(`suspect.${suspect}`)}
                     </option>
                  ))}
               </select>
            </div>

            <h2>Player List ({readyPlayers.length}/6)</h2>
            <ul>
               {readyPlayers.map((p, i) => (
                  <li key={p.id}>
                     {i + 1 + ')'} {p.name} "{t(`suspect.${p.data.character}`)}"
                  </li>
               ))}
            </ul>

            {isHost && <h1>Serving on port {port}</h1>}

            {isHost ? (
               <HoverButton
                  tooltip={
                     invalidGame
                        ? 'You need at least 3 players!'
                        : !isHost
                        ? 'Only the host can start the game!'
                        : null
                  }
                  aria-disabled={invalidGame || !isHost}
                  onClick={startGame}
               >
                  Start Game
               </HoverButton>
            ) : (
               gameId && (
                  <HoverButton
                     tooltip={gameId ? null : 'Game has not started!'}
                     aria-disabled={!gameId}
                     onClick={() => {
                        if (!gameId) audioManager.playSfx(lockedSfx);
                        else joinGame(gameId);
                     }}
                  >
                     Join Game
                  </HoverButton>
               )
            )}
            {countdown && <span>{countdown}</span>}
            <AnimatePresence>
               {openSettings && <SettingsScreen onClose={() => setOpenSettings(false)} />}
            </AnimatePresence>
         </motion.div>
      </div>
   );
}
