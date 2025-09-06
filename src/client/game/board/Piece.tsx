import piece from '@/assets/textures/ahmed.png';
import { t } from '@/lib/lang';
import type { Character, Weapon } from '@/types/game';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';

type BasePieceProps = {
   isDraggable?: boolean;
   decorative?: boolean;
};

type PieceProps =
   | ({ type: 'suspect'; id: Character } & BasePieceProps)
   | ({ type: 'weapon'; id: Weapon } & BasePieceProps);

const COLORS: Record<Character, string> = {
   scarlett: 'red',
   mustard: 'yellow',
   white: 'white',
   green: 'green',
   peacock: 'lightblue',
   plum: 'purple',
};

export default function Piece({
   id,
   type,
   isDraggable = false,
   decorative = false,
}: PieceProps) {
   const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id,
      data: { type },
      disabled: !isDraggable,
   });
   const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

   return (
      <div
         ref={setNodeRef}
         {...attributes}
         {...listeners}
         className={`piece ${isDraggable ? 'draggable' : ''} ${
            decorative ? 'dragging' : ''
         }`}
         style={{
            ...style,
            opacity: isDragging ? 0 : 1,
            backgroundColor: type === 'suspect' ? COLORS[id] : 'transparent',
         }}
      >
         <div className="nametag">{t(`${type}.${id}`)}</div>
         <motion.img
            src={piece}
            alt="Piece"
            layoutId={id}
            transition={{
               opacity: { duration: 0 },
               layout: { ease: 'easeOut' },
            }}
         />
      </div>
   );
}
