import type { NodeID } from '../../types/game';

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

export default function Tile({ x, y, id, isDroppable, onClick }: TileProps) {
   const gridX = x + OFFSET_X;
   const gridY = y + OFFSET_Y;

   return (
      <div
         className={`tile ${isDroppable ? 'droppable' : ''}`}
         id={id}
         data-x={x}
         data-y={y}
         style={{
            top: `${(gridY / BOARD_ROWS) * 100}%`,
            left: `${(gridX / BOARD_COLUMNS) * 100}%`,
         }}
      >
         {isDroppable && <div className={`dot`} onClick={onClick}></div>}
      </div>
   );
}
