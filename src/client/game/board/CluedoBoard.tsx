import type React from 'react';
import board from '@/assets/textures/board.png';
import type { PlayerID } from 'boardgame.io';

type BoardProps = {
   id: PlayerID;
   children: React.ReactNode;
};

export default function CluedoBoard({ id, children }: BoardProps) {
   return (
      <div id="board" className={`board-${id}`}>
         <img src={board} alt="Cluedo Board" />
         <div className="grid">
            <div className="inner-content">{children}</div>
         </div>
      </div>
   );
}
