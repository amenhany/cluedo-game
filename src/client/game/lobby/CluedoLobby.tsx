import type { ClientOptions } from '@/types/client';
import { motion } from 'motion/react';
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
import { useSceneTransition } from '@/contexts/SceneTransitionContext';
import Sidebar from './Sidebar';
import { ChevronDown } from 'lucide-react';

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
   const [match, setMatch] = useState<LobbyAPI.Match | null>(null);
   const port = server.split(':')[2];
   const lobbyClient = new LobbyClient({ server });
   const audioManager = AudioManager.getInstance();

   const [playerName, setPlayerName] = useState('');
   const [character, setCharacter] = useState<Character | null>(null);
   const [rules, setRules] = useState<Rules>({
      returnPlayersAfterSuggestion: false,
      spectatorsCanShowCards: true,
   });
   const [isTyping, setIsTyping] = useState(false);
   const [countdown, setCountdown] = useState<number | null>(null);
   const [gameId, setGameId] = useState<string | null>(null);
   const { triggerTransition } = useSceneTransition();

   useEffect(() => {
      const interval = setInterval(async () => {
         const { matches } = await lobbyClient.listMatches('cluedo');
         const game = matches.find(
            (match) => match.setupData?.started === true && !match.gameover
         );
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
      if (gameId) return;

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
         numPlayers: isDev ? 3 : readyPlayers.length,
         setupData: {
            started: true,
            rules,
            players: isDev
               ? ([
                    ...readyPlayers,
                    { id: 1, name: 'amen', data: { character: 'mustard' } },
                    { id: 2, name: 'ahmad', data: { character: 'white' } },
                 ] as SetupData['players'])
               : (readyPlayers as SetupData['players']),
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
            <Sidebar exitFn={leaveGame} players={readyPlayers} playerID={playerID} />
            <div className="player-form">
               <div className="input-wrapper">
                  <label htmlFor="name">{t('hud.lobby.name')}</label>
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
               </div>
               <div className="input-wrapper">
                  <label htmlFor="character-select">
                     {t('hud.lobby.character_select')}
                  </label>
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
                  <i>
                     <ChevronDown size={20} />
                  </i>
               </div>
            </div>

            {isHost && (
               <ul className="rules">
                  <li>
                     <input
                        type="checkbox"
                        id="rule-1"
                        name="rule-1"
                        checked={rules.returnPlayersAfterSuggestion}
                        onChange={() => {
                           audioManager.playSfx(selectSfx);
                           setRules((prev) => ({
                              ...prev,
                              returnPlayersAfterSuggestion:
                                 !prev.returnPlayersAfterSuggestion,
                           }));
                        }}
                     />
                     <label htmlFor="rule-1">{t('hud.lobby.return_players')}</label>
                  </li>
                  <li>
                     <input
                        type="checkbox"
                        id="rule-2"
                        name="rule-2"
                        checked={rules.spectatorsCanShowCards}
                        onChange={() => {
                           audioManager.playSfx(selectSfx);
                           setRules((prev) => ({
                              ...prev,
                              spectatorsCanShowCards: !prev.spectatorsCanShowCards,
                           }));
                        }}
                     />
                     <label htmlFor="rule-1">{t('hud.lobby.spectators_show')}</label>
                  </li>
               </ul>
            )}

            <div className="lobby-list">
               <h2>{t('hud.lobby.player_list', { num: readyPlayers.length })}</h2>
               <ol>
                  {readyPlayers.map((p, i) => (
                     <li key={p.id}>
                        {i + 1 + ')'} {p.name} "{t(`suspect.${p.data.character}`)}"
                     </li>
                  ))}
               </ol>
            </div>

            {isHost && <h1 className="port">{t('hud.lobby.port', { port })}</h1>}

            <div className="start-button">
               {isHost ? (
                  <HoverButton
                     tooltip={
                        invalidGame
                           ? t('error.start.num_players')
                           : !isHost
                           ? t('error.start.auth')
                           : null
                     }
                     aria-disabled={invalidGame || !isHost || countdown !== null}
                     onClick={startGame}
                  >
                     {t('hud.lobby.start_game')}
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
                        {t('hud.lobby.join_game')}
                     </HoverButton>
                  )
               )}
            </div>
            {countdown && <span className="countdown">{countdown}</span>}
         </motion.div>
      </div>
   );
}
