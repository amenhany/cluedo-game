import { Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useCallback } from 'react';
import type { Character } from '../../types/game';

const CHARACTER_STYLES: Record<
   Character,
   {
      color: number;
      shape: 'circle' | 'star' | 'hexagon' | 'triangle' | 'diamond' | 'square';
   }
> = {
   scarlet: { color: 0xff0000, shape: 'circle' },
   mustard: { color: 0xffff00, shape: 'star' },
   white: { color: 0xffffff, shape: 'diamond' },
   green: { color: 0x008000, shape: 'hexagon' },
   peacock: { color: 0x0000ff, shape: 'triangle' },
   plum: { color: 0x800080, shape: 'square' },
};

export function CharacterPiece({
   character,
   size = 30,
}: {
   character: Character;
   size?: number;
}) {
   const { color, shape } = CHARACTER_STYLES[character];

   const draw = useCallback(
      (g: PIXI.Graphics) => {
         g.clear();
         g.beginFill(color);

         switch (shape) {
            case 'circle':
               g.drawCircle(0, 0, size / 2);
               break;
            case 'square':
               g.drawRect(-size / 2, -size / 2, size, size);
               break;
            case 'triangle':
               g.drawPolygon([0, -size / 2, size / 2, size / 2, -size / 2, size / 2]);
               break;
            case 'diamond':
               g.drawPolygon([0, -size / 2, size / 2, 0, 0, size / 2, -size / 2, 0]);
               break;
            case 'hexagon': {
               const r = size / 2;
               const hex: number[] = [];
               for (let i = 0; i < 6; i++) {
                  const angle = (i * Math.PI) / 3;
                  hex.push(Math.cos(angle) * r, Math.sin(angle) * r);
               }
               g.drawPolygon(hex);
               break;
            }
            case 'star':
               g.drawStar(0, 0, 5, size / 2, size / 4);
               break;
         }

         g.endFill();
      },
      [color, shape, size]
   );

   return <Graphics draw={draw} />;
}
