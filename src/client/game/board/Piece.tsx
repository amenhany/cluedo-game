import piece from '@/assets/images/ahmed.png';
import type { Character, Weapon } from '../../../types/game';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type BasePieceProps = {
   isDraggable?: boolean;
   decorative?: boolean;
};

type PieceProps =
   | ({ type: 'suspect'; id: Character } & BasePieceProps)
   | ({ type: 'weapon'; id: Weapon } & BasePieceProps);

const COLORS: Record<Character, string> = {
   scarlet: 'red',
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
         // id={id}
         className={`piece ${isDraggable ? 'draggable' : ''} ${
            decorative ? 'dragging' : ''
         }`}
         style={{
            ...style,
            opacity: isDragging ? 0 : 1,
            backgroundColor: type === 'suspect' ? COLORS[id] : 'transparent',
         }}
      >
         <div className="nametag">{id}</div>
         <img src={piece} alt="Piece" />
      </div>
   );
}
