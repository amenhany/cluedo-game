import '../assets/css/game.css';

import Board from './Board';
import Piece from './Piece';

export default function Game() {
   return (
      <div className="game">
         <Board>
            <Piece coordinates={{ x: 7, y: 0 }} />
         </Board>
      </div>
   );
}
