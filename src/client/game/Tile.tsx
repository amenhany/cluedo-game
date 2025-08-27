import { useDroppable } from '@dnd-kit/core';
import type { NodeID } from '../../game/board/boardGraph';

const BOARD_COLUMNS = 25;
const BOARD_ROWS = 25;

const OFFSET_X = 1;
const OFFSET_Y = 0;

type TileProps = {
   id: NodeID;
   x: number;
   y: number;
   isDroppable: boolean;
   onClick: () => void;
};

export default function Tile({ id, x, y, isDroppable, onClick }: TileProps) {
   const { setNodeRef } = useDroppable({ id, disabled: !isDroppable });
   const gridX = x + OFFSET_X;
   const gridY = y + OFFSET_Y;

   return (
      <div
         ref={setNodeRef}
         onClick={onClick}
         className={`tile ${isDroppable ? 'droppable' : ''}`}
         style={{
            top: `${(gridY / BOARD_ROWS) * 100}%`,
            left: `${(gridX / BOARD_COLUMNS) * 100}%`,
         }}
      ></div>
   );
}
