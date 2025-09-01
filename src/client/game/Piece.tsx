import piece from '@/assets/images/ahmed.png';
import { motion, useMotionValue } from 'motion/react';
import { animate } from 'motion';
import type { Character, NodeID, Weapon } from '../../types/game';
import { cluedoGraph } from '../../game/board/boardGraph';

const BOARD_COLUMNS = 25;
const BOARD_ROWS = 25;

const OFFSET_X = 1;
const OFFSET_Y = 0;

type BasePieceProps = {
   isDraggable: boolean;
   position: NodeID;
   onSnap: (newPos: NodeID) => void;
};

type PieceProps =
   | ({ type: 'character'; id: Character } & BasePieceProps)
   | ({ type: 'weapon'; id: Weapon } & BasePieceProps);

const COLORS: Record<Character, string> = {
   scarlet: 'red',
   mustard: 'yellow',
   white: 'white',
   green: 'green',
   peacock: 'lightblue',
   plum: 'purple',
};

export default function Piece({ id, type, isDraggable, position, onSnap }: PieceProps) {
   const coordinates = cluedoGraph[position].coord;
   const gridX = coordinates.x + OFFSET_X;
   const gridY = coordinates.y + OFFSET_Y;
   const mvX = useMotionValue(0);
   const mvY = useMotionValue(0);

   return (
      <motion.div
         id={id}
         className={`piece ${isDraggable ? 'draggable' : ''}`}
         whileHover={{ scale: 1.05 }}
         drag={isDraggable}
         dragMomentum={false}
         style={{
            backgroundColor: type === 'character' ? COLORS[id] : 'transparent',
            x: mvX,
            y: mvY,
         }}
         animate={{
            top: `${(gridY / BOARD_ROWS) * 100}%`,
            left: `${(gridX / BOARD_COLUMNS) * 100}%`,
         }}
         transition={{ type: 'tween' }}
         onDragStart={() => {
            mvX.set(0);
            mvY.set(0);
         }}
         onDragEnd={(_, info) => {
            const elems = document.elementsFromPoint(info.point.x, info.point.y);
            const droppable = elems.find(
               (el) => el.classList.contains('tile') && el.classList.contains('droppable')
            ) as HTMLElement | undefined;
            if (droppable) {
               onSnap(droppable.id as NodeID);
               requestAnimationFrame(() => {
                  animate(mvX, 0, { type: 'tween', duration: 0.27 });
                  animate(mvY, 0, { type: 'tween', duration: 0.27 });
               });
            } else {
               animate(mvX, 0, { type: 'spring', stiffness: 300, damping: 30 });
               animate(mvY, 0, { type: 'spring', stiffness: 300, damping: 30 });
            }
         }}
      >
         <img src={piece} alt="Piece" />
      </motion.div>
   );
}
