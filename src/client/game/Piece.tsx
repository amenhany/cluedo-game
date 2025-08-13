import piece from '../assets/images/ahmed.png';

const BOARD_COLUMNS = 25;
const BOARD_ROWS = 25;

const OFFSET_X = 1;
const OFFSET_Y = 0;

type PieceProps = {
   coordinates: {
      x: number;
      y: number;
   };
};

export default function Piece({ coordinates }: PieceProps) {
   const gridX = coordinates.x + OFFSET_X;
   const gridY = coordinates.y + OFFSET_Y;

   return (
      <div
         className="piece"
         style={{
            top: `${(gridY / BOARD_ROWS) * 100}%`,
            left: `${(gridX / BOARD_COLUMNS) * 100}%`,
         }}
      >
         <img src={piece} alt="Piece" />
      </div>
   );
}
