import '@/assets/styles/game.scss';

import CluedoBoard from './CluedoBoard';
import Piece from './Piece';
import Tile from './Tile';
import { cluedoGraph } from '../../game/board/boardGraph';
import { useEffect, useState } from 'react';
import type { Node, Coordinates, GameState, NodeID } from '../../types/game';
import type { BoardProps } from 'boardgame.io/react';
import Dice from './hud/Dice';

export default function CluedoGame({ G, ctx, moves, playerID }: BoardProps<GameState>) {
   const [playerPos, setPlayerPos] = useState<Coordinates>({ x: 7, y: 0 });
   const [availableMoves, setAvailableMoves] = useState<Node[]>([]);
   const myTurn = ctx.currentPlayer === playerID;

   function handleRoll() {
      console.log(playerID);
      console.log(ctx.currentPlayer);
      if (!myTurn) return;
      console.log('test');
      moves.rollDice();
   }

   function handleMove(newPos: Coordinates, nodeID: NodeID) {
      setPlayerPos(newPos);
      moves.movePiece(nodeID);
   }

   useEffect(() => {
      if (!playerID) return;
      setPlayerPos(cluedoGraph[G.players[playerID!].position].coord);

      const nodeIds = G.players[playerID].availableMoves ?? [];
      const nodes = Object.values(cluedoGraph).filter((node) =>
         nodeIds.includes(node.id)
      );
      setAvailableMoves(nodes);
   }, [G, playerID]);

   return (
      <div className="game">
         <CluedoBoard>
            {availableMoves.map((node) => {
               if (node.type !== 'tile') return null;
               return (
                  <Tile
                     key={node.id}
                     id={node.id}
                     x={node.coord.x}
                     y={node.coord.y}
                     isDroppable={true}
                     onClick={() =>
                        handleMove({ x: node.coord.x, y: node.coord.y }, node.id)
                     }
                  />
               );
            })}
            <Piece coordinates={playerPos} onSnap={handleMove} />
         </CluedoBoard>
         <Dice onRoll={handleRoll} disabled={!myTurn} />
      </div>
   );
}
