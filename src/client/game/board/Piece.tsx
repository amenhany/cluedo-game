import piece from '@/assets/textures/ahmed.png';
import revolver from '@/assets/textures/weapons/revolver.png';
import { useSuggestion } from '@/contexts/SuggestionContext';
import { t } from '@/lib/lang';
import type { Character, Weapon } from '@/types/game';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { PlayerID } from 'boardgame.io';
// import { motion } from 'motion/react';

type BasePieceProps = {
   playerID: PlayerID | null;
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

// const TEXTURE_MAPPING: Record<Character | Weapon, string> = {
//    revolver,
// };

export default function Piece({
   id,
   type,
   playerID,
   isDraggable = false,
   decorative = false,
}: PieceProps) {
   const { isHighlighted, setHighlighted, suggestion } = useSuggestion();
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
         id={id}
         className={`piece ${type} ${isDraggable && !suggestion ? 'draggable' : ''} ${
            decorative ? 'dragging' : ''
         } ${suggestion ? 'suggesting' : ''} ${isHighlighted(id) ? 'highlighted' : ''}`}
         style={{
            ...style,
            opacity: isDragging ? 0 : 1,
            backgroundColor: type === 'suspect' ? COLORS[id] : 'transparent',
         }}
         onClick={
            playerID && suggestion?.suggester === playerID
               ? () => setHighlighted(type, id)
               : () => {}
         }
      >
         <div className="nametag">{t(`${type}.${id}`)}</div>
         <img
            src={type === 'suspect' ? piece : revolver}
            alt="Piece"
            // layoutId={id}
            // transition={{
            //    opacity: { duration: 0 },
            //    layout: { ease: 'easeOut' },
            // }}
         />
      </div>
   );
}
