import type { PlayerID } from 'boardgame.io';
import type { PlayerState } from '@/types/game';
import { motion } from 'motion/react';
import Dice from './Dice';
import Card from './Card';
import '@/assets/styles/hud.scss';

type HudProps = {
   players?: Record<PlayerID, PlayerState>;
   playerID?: PlayerID;
   moves: Record<string, (...args: any[]) => void>;
   active: boolean;
};

export default function CluedoHud({ players, playerID, moves, active }: HudProps) {
   return (
      <div className="hud">
         <Dice
            face={
               playerID && players && players[playerID].steps
                  ? players[playerID].steps
                  : 0
            }
            onRoll={moves.handleRoll}
            disabled={!active}
         />
         <motion.div
            className="deck"
            initial={{ bottom: '-20vh' }}
            whileHover={{ bottom: '20vh' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
         >
            {playerID &&
               players &&
               players[playerID].hand.map((card) => <Card key={card} id={card} />)}
         </motion.div>
      </div>
   );
}
