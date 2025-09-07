import { AudioManager } from '@/lib/AudioManager';
import { t } from '@/lib/lang';
import type { Coordinates, Room } from '@/types/game';
import appear from '@/assets/audio/sfx/appear.wav';

const BOARD_COLUMNS = 25;
const BOARD_ROWS = 25;
const OFFSET_X = 1;
const OFFSET_Y = 0;

export default function SecretPassage({
   coordinates,
   active,
   destination,
   onClick,
}: {
   coordinates: Coordinates;
   active: boolean;
   destination: Room;
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
         onMouseEnter={
            active ? () => AudioManager.getInstance().playSfx(appear) : () => {}
         }
      >
         {active && <div className="nametag">Go to {t(`room.${destination}`)}</div>}
      </button>
   );
}
