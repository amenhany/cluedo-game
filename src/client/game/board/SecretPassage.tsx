import type { Coordinates } from '@/types/game';

const BOARD_COLUMNS = 25;
const BOARD_ROWS = 25;
const OFFSET_X = 1;
const OFFSET_Y = 0;

export default function SecretPassage({
   coordinates,
   active,
   onClick,
}: {
   coordinates: Coordinates;
   active: boolean;
   onClick: () => void;
}) {
   return (
      <button
         onClick={onClick}
         className={`node ${active ? 'secret-passage' : ''}`}
         disabled={!active}
         style={{
            top: `${((coordinates.y + OFFSET_Y) / BOARD_ROWS) * 100}%`,
            left: `${((coordinates.x + OFFSET_X) / BOARD_COLUMNS) * 100}%`,
            width: `${(1 / BOARD_COLUMNS) * 100}%`,
            height: `${(1 / BOARD_ROWS) * 100}%`,
         }}
      ></button>
   );
}
