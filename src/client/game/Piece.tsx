import piece from '@/assets/images/ahmed.png';
import { motion, useMotionValue } from 'motion/react';
import { animate } from 'motion';
import type { Coordinates, NodeID } from '../../types/game';

const BOARD_COLUMNS = 25;
const BOARD_ROWS = 25;

const OFFSET_X = 1;
const OFFSET_Y = 0;

type PieceProps = {
   coordinates: Coordinates;
   onSnap: (coordinates: Coordinates, nodeID: NodeID) => void;
};

export default function Piece({ coordinates, onSnap }: PieceProps) {
   const gridX = coordinates.x + OFFSET_X;
   const gridY = coordinates.y + OFFSET_Y;
   const mvX = useMotionValue(0);
   const mvY = useMotionValue(0);

   return (
      <motion.div
         className="piece"
         drag
         dragMomentum={false}
         style={{
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
               const tileX = Number(droppable.dataset.x);
               const tileY = Number(droppable.dataset.y);
               onSnap({ x: tileX, y: tileY }, droppable.id as NodeID);
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
