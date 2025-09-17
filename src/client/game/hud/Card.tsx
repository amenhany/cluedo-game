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

   candlestick: plum,
   dagger: plum,
   spanner: plum,
   leadPipe: plum,
   revolver: plum,
   rope: plum,

   kitchen: plum,
   ballroom: plum,
   conservatory: plum,
   diningRoom: plum,
   lounge: plum,
   hall: plum,
   study: plum,
   library: plum,
   billiardRoom: plum,
};

export default function Card({
   id,
   playable,
   type,
   onClick,
}: {
   id: Card;
   playable: boolean;
   type: 'suspect' | 'weapon' | 'room';
   onClick?: () => void;
}) {
   return (
      <div className={`card ${playable ? 'playable' : ''}`} onClick={onClick}>
         <img src={TEXTURE_MAPPING[id]} alt={id} />
      </div>
   );
}
