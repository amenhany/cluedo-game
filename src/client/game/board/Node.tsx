import type { PlayerState, Node, TileNode, RoomNode, Weapon } from '@/types/game';
import Piece from './Piece';
import type { PlayerID } from 'boardgame.io';
import { AudioManager } from '@/lib/AudioManager';
import appear from '@/assets/audio/sfx/appear.wav';
import { useDndContext, useDroppable } from '@dnd-kit/core';
import { t } from '@/lib/lang';
import { useEffect } from 'react';
import { useSuggestion } from '@/contexts/SuggestionContext';
import { BOARD_COLUMNS, BOARD_ROWS, OFFSET_X, OFFSET_Y } from '@/game/constants';

type NodeProps = {
   node: Node;
   players: PlayerState[];
   playerID: PlayerID | null;
   weapon: Weapon | null;
   myTurn: boolean;
   isDroppable?: boolean;
   onClick?: () => void;
};

export default function Node({
   node,
   players,
   playerID,
   weapon,
   myTurn,
   isDroppable = false,
   onClick = () => {},
}: NodeProps) {
   const { suggestion } = useSuggestion();
   const { isOver, setNodeRef } = useDroppable({
      id: node.id,
      data: {
         type: node.type,
      },
      disabled: !isDroppable,
   });
   const { active } = useDndContext();
   const tile = node as TileNode;
   const room = node as RoomNode;
   const isRoom = node.type === 'room';

   const style =
      isRoom || node.type === 'end'
         ? {
              top: `${((room.bounds.y + OFFSET_Y) / BOARD_ROWS) * 100}%`,
              left: `${((room.bounds.x + OFFSET_X) / BOARD_COLUMNS) * 100}%`,
              width: `${(room.bounds.width / BOARD_COLUMNS) * 100}%`,
              height: `${(room.bounds.height / BOARD_ROWS) * 100}%`,
           }
         : {
              top: `${((tile.coord.y + OFFSET_Y) / BOARD_ROWS) * 100}%`,
              left: `${((tile.coord.x + OFFSET_X) / BOARD_COLUMNS) * 100}%`,
              width: `${(1 / BOARD_COLUMNS) * 100}%`,
              height: `${(1 / BOARD_ROWS) * 100}%`,
           };

   useEffect(() => {
      if (isRoom && isOver) {
         AudioManager.getInstance().playSfx(appear);
      }
   }, [isOver]);

   return (
      <div
         className={`node ${node.type} ${isDroppable ? 'droppable' : ''} ${
            suggestion ? 'suggesting' : ''
         } ${active ? 'dragging' : ''}`}
         ref={setNodeRef}
         id={node.id}
         style={style}
         onMouseEnter={
            isRoom && isDroppable && !isOver && !suggestion
               ? () => AudioManager.getInstance().playSfx(appear)
               : () => {}
         }
      >
         <div
            className={`area ${isOver ? 'over' : ''}`}
            onClick={isDroppable && !suggestion ? onClick : () => {}}
         >
            {isRoom && (
               <h2 className="room-name">{t(`room.${room.id}`).replace(' ', '\n')}</h2>
            )}
         </div>
         {players.map((player) => (
            <Piece
               key={player.id}
               id={player.character}
               playerID={playerID}
               type="suspect"
               isDraggable={
                  (player.id === playerID && myTurn) || suggestion?.suggester === playerID
               }
            />
         ))}
         {weapon && (
            <Piece
               id={weapon}
               type="weapon"
               playerID={playerID}
               isDraggable={suggestion?.suggester === playerID}
            />
         )}
      </div>
   );
}
