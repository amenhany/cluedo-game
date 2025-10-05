import piece from '@/assets/textures/ahmed.png';
import revolver from '@/assets/textures/weapons/revolver.png';
import leadPipe from '@/assets/textures/weapons/lead_pipe.png';
import spanner from '@/assets/textures/weapons/spanner.png';
import dagger from '@/assets/textures/weapons/dagger.png';
import rope from '@/assets/textures/weapons/rope.png';
import candlestick from '@/assets/textures/weapons/candlestick.png';
import { useSuggestion } from '@/contexts/SuggestionContext';
import { t } from '@/lib/lang';
import type { Character, Weapon } from '@/types/game';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { PlayerID } from 'boardgame.io';
import { SUSPECT_COLORS } from '@/game/constants';
// import { motion } from 'motion/react';

type BasePieceProps = {
   playerID: PlayerID | null;
   name: string;
   isDraggable?: boolean;
   decorative?: boolean;
};

type PieceProps =
   | ({ type: 'suspect'; id: Character } & BasePieceProps)
   | ({ type: 'weapon'; id: Weapon } & BasePieceProps);

const TEXTURE_MAPPING: Record<Character | Weapon, string> = {
   scarlett: piece,
   mustard: piece,
   white: piece,
   green: piece,
   peacock: revolver,
   plum: piece,

   revolver,
   leadPipe,
   candlestick,
   dagger,
   spanner,
   rope,
};

export default function Piece({
   id,
   type,
   playerID,
   name,
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
            backgroundColor: type === 'suspect' ? SUSPECT_COLORS[id] : 'transparent',
         }}
         onClick={
            playerID && suggestion?.suggester === playerID
               ? () => setHighlighted(type, id)
               : () => {}
         }
      >
         <div className="nametag">
            {t(`${type}.${id}`)} {name !== '' && <span>'{name}'</span>}
         </div>
         <img
            src={TEXTURE_MAPPING[id]}
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
