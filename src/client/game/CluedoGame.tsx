import '@/assets/styles/game.scss';

import CluedoBoard from './board/CluedoBoard';
import Node from './board/Node';
import { cluedoGraph, secretPassages } from '@/game/board/boardGraph';
import { useEffect, useState } from 'react';
import type {
   Node as TNode,
   GameState,
   NodeID,
   PlayerState,
   Character,
   Weapon,
   RoomNode,
   Room,
   Stage,
} from '@/types/game';
import type { BoardProps } from 'boardgame.io/react';
import type { PlayerID } from 'boardgame.io';
import { AudioManager } from '@/lib/AudioManager';
import step1 from '@/assets/audio/sfx/step1.wav';
import step2 from '@/assets/audio/sfx/step2.wav';
import step3 from '@/assets/audio/sfx/step3.wav';
import step4 from '@/assets/audio/sfx/step4.wav';
import step5 from '@/assets/audio/sfx/step5.wav';
import doorSound from '@/assets/audio/sfx/door.wav';
import CluedoHud from './hud/CluedoHud';
import {
   DndContext,
   DragOverlay,
   MouseSensor,
   useSensor,
   type DragEndEvent,
} from '@dnd-kit/core';
import Piece from './board/Piece';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useSettings } from '@/contexts/SettingsContext';
import SecretPassage from './board/SecretPassage';
import { SuggestionContextProvider } from '@/contexts/SuggestionContext';
import SpotlightOverlay from './SpotlightOverlay';

export default function CluedoGame({ G, ctx, moves, playerID }: BoardProps<GameState>) {
   const { settings } = useSettings();
   const [players, setPlayers] = useState<Record<PlayerID, PlayerState>>();
   let playerNode: TNode | null = null,
      roomNode: RoomNode | null = null;
   if (players && playerID) playerNode = cluedoGraph[players[playerID].position];
   if (playerNode?.type === 'room') roomNode = playerNode;
   const [availableMoves, setAvailableMoves] = useState<TNode[]>([]);
   const [dragging, setDragging] = useState<{
      id: Character | Weapon;
      type: 'suspect' | 'weapon';
   }>();
   const myTurn = ctx.currentPlayer === playerID;
   const stage =
      (playerID &&
         ctx.activePlayers !== null &&
         (ctx.activePlayers[playerID] as Stage)) ||
      null;
   const canSuggest =
      stage === 'RoomAction' ||
      (stage === 'TurnAction' && roomNode !== null && myTurn) ||
      false;
   let resolver: PlayerState | null = null;

   if (ctx.activePlayers && players) {
      const resolverEntry = Object.entries(ctx.activePlayers).find(
         ([, stage]) => stage === 'ResolveSuggestion'
      );
      if (resolverEntry) {
         const [id] = resolverEntry;
         resolver = players[id];
      }
   }

   const mouseSensor = useSensor(MouseSensor, {
      activationConstraint: {
         delay: G.pendingSuggestion ? 200 : 0, // ms
         tolerance: 5, // px allowed movement during delay
      },
   });

   const hudMoves = {
      handleRoll: () => {
         if (!myTurn) return;
         moves.rollDice();
      },

      endTurn: moves.endTurn,
      makeSuggestion: moves.makeSuggestion,
      startSuggestion: moves.startSuggestion,
   };

   function handleMove(newPos: NodeID) {
      setPlayers((prev) => {
         if (!prev || playerID === null) return;
         return {
            ...prev,
            [playerID]: {
               ...prev[playerID],
               position: newPos,
            },
         };
      });
      if (cluedoGraph[newPos].type === 'room')
         AudioManager.getInstance().playSfx(doorSound);
      else AudioManager.getInstance().playRandomSfx(step1, step2, step3, step4, step5);
      if (!G.pendingSuggestion) moves.movePlayer(newPos);
   }

   function handleDragEnd(result: DragEndEvent) {
      const destination = result.over?.id as NodeID;
      if (!destination) return;
      if (!G.pendingSuggestion) handleMove(destination);
      else moves.setSuggestion(result.active.data.current!.type, result.active.id);
   }

   function handleSecretPassage() {
      moves.useSecretPassage();
      AudioManager.getInstance().playSfx(doorSound);
   }

   useEffect(() => {
      if (!playerID) return;
      setPlayers(G.players);

      const nodeIds = G.players[playerID].availableMoves ?? [];
      const nodes = Object.values(cluedoGraph).filter((node) =>
         nodeIds.includes(node.id)
      );

      setAvailableMoves(nodes);
   }, [G, playerID]);

   return (
      <SuggestionContextProvider
         moves={moves}
         resolver={resolver}
         suggestion={G.pendingSuggestion}
         canSuggest={canSuggest}
      >
         <div
            className={`game board-${'0'}`}
            style={{ filter: settings?.filter === 'b&w' ? 'grayscale(100%)' : 'none' }}
         >
            <DndContext
               sensors={[mouseSensor]}
               modifiers={[snapCenterToCursor]}
               onDragEnd={handleDragEnd}
               onDragStart={(event) =>
                  setDragging({
                     id: event.active.id as Character | Weapon,
                     type: event.active.data.current!.type,
                  })
               }
            >
               <div className={`alignment board-${playerID || '0'}`}>
                  <CluedoBoard>
                     {Object.values(cluedoGraph).map((node) => {
                        const residents = Object.values(G.players).filter((player) => {
                           return player.position === node.id;
                        });
                        return (
                           <Node
                              key={node.id}
                              node={node}
                              players={residents}
                              playerID={playerID}
                              weapon={
                                 (Object.keys(G.weapons) as Weapon[]).find(
                                    (w) => G.weapons[w] === node.id
                                 ) || null
                              }
                              myTurn={myTurn}
                              isDroppable={
                                 availableMoves.includes(node) ||
                                 (G.pendingSuggestion?.room === node.id &&
                                    G.pendingSuggestion?.suggester === playerID)
                              }
                              onClick={() => handleMove(node.id)}
                           />
                        );
                     })}
                     {Object.entries(secretPassages).map(([room, coord]) => (
                        <SecretPassage
                           key={`${coord.x}-${coord.y}`}
                           coordinates={coord}
                           active={
                              myTurn &&
                              playerNode?.id === room &&
                              (playerNode as RoomNode).secretPassage !== undefined &&
                              ctx.activePlayers !== null &&
                              ctx.activePlayers[playerID] === 'TurnAction'
                           }
                           destination={
                              (cluedoGraph[room as Room] as RoomNode).secretPassage!
                           }
                           onClick={handleSecretPassage}
                        />
                     ))}
                  </CluedoBoard>
                  <SpotlightOverlay suggestion={G.pendingSuggestion} />
               </div>
               {dragging && (
                  <DragOverlay>
                     {dragging.type === 'suspect' ? (
                        <Piece
                           id={dragging.id as Character}
                           type="suspect"
                           playerID={playerID}
                           decorative={true}
                        />
                     ) : (
                        <Piece
                           id={dragging.id as Weapon}
                           playerID={playerID}
                           type="weapon"
                           decorative={true}
                        />
                     )}
                  </DragOverlay>
               )}
            </DndContext>
         </div>

         <CluedoHud
            playerID={playerID === null ? undefined : playerID}
            players={players}
            currentPlayer={ctx.currentPlayer}
            moves={hudMoves}
            active={myTurn}
            stage={stage}
         />
      </SuggestionContextProvider>
   );
}
