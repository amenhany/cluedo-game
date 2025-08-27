import '@/assets/styles/game.scss';

import CluedoBoard from './CluedoBoard';
import Piece from './Piece';
import Tile from './Tile';
import { cluedoGraph, type Coordinates } from '../../game/board/boardGraph';
import { useState } from 'react';

export default function CluedoGame() {
   const [playerPos, setPlayerPos] = useState<Coordinates>({ x: 7, y: 0 });

   return (
      <div className="game">
         <CluedoBoard>
            {Object.entries(cluedoGraph).map(([_, node]) => {
               if (node.type !== 'tile') return null;
               return (
                  <Tile
                     key={node.id}
                     id={node.id}
                     x={node.coord.x}
                     y={node.coord.y}
                     isDroppable={false}
                     onClick={() => setPlayerPos({ x: node.coord.x, y: node.coord.y })}
                  />
               );
            })}
            <Piece coordinates={playerPos} />
         </CluedoBoard>
      </div>
   );
}
