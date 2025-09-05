import '@/assets/styles/game.scss';

import CluedoBoard from './board/CluedoBoard';
import Node from './board/Node';
import { cluedoGraph } from '@/game/board/boardGraph';
import { useEffect, useState } from 'react';
import type {
   Node as TNode,
   GameState,
   NodeID,
   PlayerState,
   Character,
   Weapon,
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
import { DndContext, DragOverlay, type DragEndEvent } from '@dnd-kit/core';
import Piece from './board/Piece';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

export default function CluedoGame({ G, ctx, moves, playerID }: BoardProps<GameState>) {
   const [players, setPlayers] = useState<Record<PlayerID, PlayerState>>();
   const [availableMoves, setAvailableMoves] = useState<TNode[]>([]);
   const [dragging, setDragging] = useState<{
      id: Character | Weapon;
      type: 'suspect' | 'weapon';
   }>();
   const myTurn = ctx.currentPlayer === playerID;

   const hudMoves = {
      handleRoll: () => {
         if (!myTurn) return;
         moves.rollDice();
      },
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
      moves.movePiece(newPos);
   }

   function handleDragEnd(result: DragEndEvent) {
      const destination = result.over?.id as NodeID;
      if (destination) handleMove(destination);
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
      <div className="game">
         <DndContext
            modifiers={[snapCenterToCursor]}
            onDragEnd={handleDragEnd}
            onDragStart={(event) =>
               setDragging({
                  id: event.active.id as Character | Weapon,
                  type: event.active.data.current!.type,
               })
            }
         >
            <CluedoBoard id={playerID || '0'}>
               {Object.values(cluedoGraph).map((node) => {
                  const residents = Object.values(G.players).filter((player) => {
                     return player.position === node.id;
                  });
                  return (
                     <Node
                        key={node.id}
                        node={node}
                        players={residents}
                        playerID={playerID !== null ? playerID : ''}
                        myTurn={myTurn}
                        isDroppable={availableMoves.includes(node)}
                        onClick={() => handleMove(node.id)}
                     />
                  );
               })}
            </CluedoBoard>
            {dragging && (
               <DragOverlay>
                  {dragging.type === 'suspect' ? (
                     <Piece
                        id={dragging.id as Character}
                        type="suspect"
                        decorative={true}
                     />
                  ) : (
                     <Piece id={dragging.id as Weapon} type="weapon" decorative={true} />
                  )}
               </DragOverlay>
            )}
         </DndContext>
         <CluedoHud
            playerID={playerID === null ? undefined : playerID}
            players={players}
            moves={hudMoves}
            active={myTurn}
         />
      </div>
   );
}
