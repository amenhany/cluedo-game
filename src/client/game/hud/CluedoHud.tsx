import type { PlayerID } from 'boardgame.io';
import type { PlayerState } from '../../../types/game';
import Dice from './Dice';
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
      </div>
   );
}
