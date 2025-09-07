import type { PlayerID } from 'boardgame.io';
import type { PlayerState, Stage } from '@/types/game';
import { motion } from 'motion/react';
import Dice from './Dice';
import Card from './Card';
import '@/assets/styles/hud.scss';
import { useSettings } from '@/contexts/SettingsContext';

type HudProps = {
   players?: Record<PlayerID, PlayerState>;
   playerID?: PlayerID;
   moves: Record<string, (...args: any[]) => void>;
   active: boolean;
   stage: Stage | null;
};

export default function CluedoHud({ players, playerID, moves, active, stage }: HudProps) {
   const { settings } = useSettings();
   return (
      <div
         className="hud"
         style={{ filter: settings?.filter === 'b&w' ? 'grayscale(100%)' : 'none' }}
      >
         <Dice
            face={
               playerID && players && players[playerID].steps
                  ? players[playerID].steps
                  : 0
            }
            onRoll={moves.handleRoll}
            disabled={!(active && stage === 'TurnAction')}
         />
         <motion.div
            className="deck"
            initial={{ bottom: '-50vh' }}
            whileHover={{ bottom: '50vh' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
         >
            {playerID &&
               players &&
               players[playerID].hand.map((card) => <Card key={card} id={card} />)}
         </motion.div>
      </div>
   );
}
