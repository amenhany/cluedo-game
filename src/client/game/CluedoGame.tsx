import '@/assets/styles/game.scss';

import CluedoBoard from './CluedoBoard';
import Piece from './Piece';
import Tile from './Tile';
import { cluedoGraph } from '../../game/board/boardGraph';
import { useEffect, useState } from 'react';
import type { Node, GameState, NodeID, PlayerState } from '../../types/game';
import type { BoardProps } from 'boardgame.io/react';
import Dice from './hud/Dice';
import type { PlayerID } from 'boardgame.io';

export default function CluedoGame({ G, ctx, moves, playerID }: BoardProps<GameState>) {
   const [players, setPlayers] = useState<Record<PlayerID, PlayerState>>();
   const [availableMoves, setAvailableMoves] = useState<Node[]>([]);
   const myTurn = ctx.currentPlayer === playerID;

   function handleRoll() {
      console.log(playerID);
      console.log(ctx.currentPlayer);
      if (!myTurn) return;
      console.log('test');
      moves.rollDice();
   }

   function handleMove(newPos: NodeID) {
      setPlayers((prev) => {
         if (!prev || playerID === null) return;
         const test = {
            ...prev,
            [playerID]: {
               ...prev[playerID],
               position: newPos,
            },
         };
         console.dir(test);
         return test;
      });
      moves.movePiece(newPos);
   }

   useEffect(() => {
      if (!playerID) return;
      // setPlayerPos(cluedoGraph[G.players[playerID!].position].coord);
      setPlayers(G.players);

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
                     onClick={() => handleMove(node.id)}
                  />
               );
            })}

            {players &&
               Object.values(players).map((player) => (
                  <Piece
                     type="character"
                     id={player.character}
                     key={player.id}
                     coordinates={cluedoGraph[player.position].coord}
                     isDraggable={player.id === playerID && myTurn}
                     onSnap={handleMove}
                  />
               ))}
         </CluedoBoard>
         <Dice onRoll={handleRoll} disabled={!myTurn} />
      </div>
   );
}
