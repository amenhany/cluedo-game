import type { PlayerState, Node, TileNode, RoomNode } from '@/types/game';
import Piece from './Piece';
import type { PlayerID } from 'boardgame.io';
import { AudioManager } from '@/lib/AudioManager';
import appear from '@/assets/audio/sfx/appear.wav';
import { useDroppable } from '@dnd-kit/core';
import { t } from '@/lib/lang';

const BOARD_COLUMNS = 25;
const BOARD_ROWS = 25;
const OFFSET_X = 1;
const OFFSET_Y = 0;

type NodeProps = {
   node: Node;
   players: PlayerState[];
   playerID: PlayerID;
   myTurn: boolean;
   isDroppable?: boolean;
   onClick?: () => void;
};

export default function Node({
   node,
   players,
   playerID,
   myTurn,
   isDroppable = false,
   onClick = () => {},
}: NodeProps) {
   const { isOver, setNodeRef } = useDroppable({
      id: node.id,
      data: {
         type: node.type,
      },
      disabled: !isDroppable,
   });
   const tile = node as TileNode;
   const room = node as RoomNode;
   const isRoom = node.type === 'room';

   const style = isRoom
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

   return (
      <div
         className={`node ${node.type} ${isDroppable ? 'droppable' : ''}`}
         ref={setNodeRef}
         id={node.id}
         style={style}
      >
         <div
            className={`area ${isOver ? 'over' : ''}`}
            onClick={isDroppable ? onClick : () => {}}
            onMouseEnter={
               isRoom && isDroppable
                  ? () => AudioManager.getInstance().playSfx(appear)
                  : () => {}
            }
         >
            {isRoom && (
               <h2 className="room-name">{t(`room.${room.id}`).replace(' ', '\n')}</h2>
            )}
         </div>
         {players.map((player) => (
            <Piece
               key={player.id}
               id={player.character}
               type="suspect"
               isDraggable={player.id === playerID && myTurn}
            />
         ))}
      </div>
   );
}
