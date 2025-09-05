import type { Card } from '@/types/game';
import scarlett from '@/assets/textures/cards/scarlett.png';
import mustard from '@/assets/textures/cards/mustard.png';
import white from '@/assets/textures/cards/white.png';
import green from '@/assets/textures/cards/green.png';
import peacock from '@/assets/textures/cards/peacock.png';
import plum from '@/assets/textures/cards/plum.png';

const TEXTURE_MAPPING: Record<Card, string> = {
   scarlett,
   mustard,
   white,
   green,
   peacock,
   plum,
};

export default function Card({ id }: { id: Card }) {
   return (
      <div className="card">
         <img src={TEXTURE_MAPPING[id]} alt={id} />
      </div>
   );
}
