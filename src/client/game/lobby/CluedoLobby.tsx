import type { ClientOptions } from '@/types/client';
import CluedoBoard from '../board/CluedoBoard';
import { useEffect, useState } from 'react';
import { LobbyClient } from 'boardgame.io/client';
import '@/assets/styles/lobby.scss';
import type { LobbyAPI } from 'boardgame.io';
import { CARDS } from '@/game/constants';
import type { Character, Rules, SetupData } from '@/types/game';
import { AudioManager } from '@/lib/AudioManager';
import lockedSfx from '@/assets/audio/sfx/card_locked.wav';
import selectSfx from '@/assets/audio/sfx/card_select.wav';
import HoverButton from '../hud/HoverButton';

type LobbyProps = ClientOptions & {
   isHost: boolean;
   onStart: (newMatchID: string) => void;
};

export default function CluedoLobby({
   isHost,
   onStart,
   server,
   matchID,
   playerID,
   credentials,
}: LobbyProps) {
   const [match, setMatch] = useState<LobbyAPI.Match | null>(null);
   const lobbyClient = new LobbyClient({ server });
   const audioManager = AudioManager.getInstance();

   const [playerName, setPlayerName] = useState('');
   const [character, setCharacter] = useState<Character | null>(null);
   const [rules, setRules] = useState<Rules>({
      returnPlayersAfterSuggestion: false,
   });
   const [isTyping, setIsTyping] = useState(false);

   useEffect(() => {
      const interval = setInterval(async () => {
         const { matches } = await lobbyClient.listMatches('cluedo');
         const game = matches.find((match) => match.setupData?.started === true);
         if (game && !isHost) {
            await lobbyClient.leaveMatch('cluedo', matchID, {
               playerID,
               credentials,
            });
            await lobbyClient.joinMatch('cluedo', game.matchID, {
               playerID,
               playerName,
            });
            onStart(game.matchID);
            return;
         }
         const m = await lobbyClient.getMatch('cluedo', matchID);
         setMatch(m);
      }, 1000);
      return () => clearInterval(interval);
   }, [matchID]);

   const players = match?.players ?? [];
   const player = players.find((p) => p.id.toString() === playerID);
   const takenCharacters = players.map((p) =>
      p.data?.character ? (p.data.character as Character) : null
   );
   const readyPlayers = players.filter((player) => player.data?.character !== undefined);
   const invalidGame = readyPlayers.length < 1 || readyPlayers.length > 6;

   useEffect(() => {
      if (!match || !player) return;
      console.log(readyPlayers);

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
   }, [match]);

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
      if (invalidGame) return audioManager.playSfx(lockedSfx);

      const { matchID: newMatchID } = await lobbyClient.createMatch('cluedo', {
         numPlayers: readyPlayers.length,
         setupData: {
            started: true,
            rules,
            players: readyPlayers as SetupData['players'],
         } satisfies SetupData,
      });

      await lobbyClient.leaveMatch('cluedo', matchID, {
         playerID,
         credentials,
      });
      await lobbyClient.joinMatch('cluedo', newMatchID, {
         playerID,
         playerName,
      });
      onStart(newMatchID);
   }

   if (!match) {
      return (
         <div className="lobby alignment">
            <CluedoBoard>
               <></>
            </CluedoBoard>
            <div className="lobby-ui">Loading Lobby...</div>
         </div>
      );
   }

   return (
      <div className="lobby alignment">
         <CluedoBoard>
            <></>
         </CluedoBoard>
         <div className="lobby-ui">
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
                        {suspect}
                     </option>
                  ))}
               </select>
            </div>
            {isHost && (
               <HoverButton
                  tooltip={invalidGame ? 'You need at least 3 players!' : null}
                  aria-disabled={invalidGame}
                  onClick={startGame}
               >
                  Start Game
               </HoverButton>
            )}
         </div>
      </div>
   );
}
