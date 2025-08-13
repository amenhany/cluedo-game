import type React from 'react';
import board from '../assets/images/board.png';

type BoardProps = {
   children: React.ReactNode;
};

export default function Board({ children }: BoardProps) {
   return (
      <div id="board">
         <img src={board} alt="Cluedo Board" />
         <div className="grid">
            <div className="inner-content">{children}</div>
         </div>
      </div>
   );
}
