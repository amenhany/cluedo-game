import '@/assets/styles/game.scss';

import CluedoBoard from './CluedoBoard';
import Piece from './Piece';

export default function CluedoGame() {
   return (
      <div className="game">
         <CluedoBoard>
            <Piece coordinates={{ x: 5, y: 19 }} />
         </CluedoBoard>
      </div>
   );
}
