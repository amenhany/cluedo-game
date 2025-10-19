import type { Card } from '@/types/game';
import scarlett from '@/assets/textures/cards/suspects/scarlett.png';
import mustard from '@/assets/textures/cards/suspects/mustard.png';
import white from '@/assets/textures/cards/suspects/white.png';
import green from '@/assets/textures/cards/suspects/green.png';
import peacock from '@/assets/textures/cards/suspects/peacock.png';
import plum from '@/assets/textures/cards/suspects/plum.png';
import candlestick from '@/assets/textures/cards/weapons/candlestick.png';
import dagger from '@/assets/textures/cards/weapons/dagger.png';
import leadPipe from '@/assets/textures/cards/weapons/lead_pipe.png';
import revolver from '@/assets/textures/cards/weapons/revolver.png';
import rope from '@/assets/textures/cards/weapons/rope.png';
import spanner from '@/assets/textures/cards/weapons/spanner.png';
import kitchen from '@/assets/textures/cards/rooms/kitchen.png';
import ballroom from '@/assets/textures/cards/rooms/ballroom.png';
import conservatory from '@/assets/textures/cards/rooms/conservatory.png';
import diningRoom from '@/assets/textures/cards/rooms/dining_room.png';
import lounge from '@/assets/textures/cards/rooms/lounge.png';
import hall from '@/assets/textures/cards/rooms/hall.png';
import study from '@/assets/textures/cards/rooms/study.png';
import library from '@/assets/textures/cards/rooms/library.png';
import billiardRoom from '@/assets/textures/cards/rooms/billiard_room.png';
import { t } from '@/lib/lang';

const TEXTURE_MAPPING: Record<Card, string> = {
   scarlett,
   mustard,
   white,
   green,
   peacock,
   plum,

   candlestick,
   dagger,
   spanner,
   leadPipe,
   revolver,
   rope,

   kitchen,
   ballroom,
   conservatory,
   diningRoom,
   lounge,
   hall,
   study,
   library,
   billiardRoom,
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
         <h3 className="card-label card-label-top">{t(`${type}.${id}`)}</h3>
         <h3 className="card-label card-label-bottom">{t(`${type}.${id}`)}</h3>
      </div>
   );
}
