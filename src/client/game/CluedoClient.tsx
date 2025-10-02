import { Client } from 'boardgame.io/react';
import { Cluedo } from '../../game';
import CluedoGame from './CluedoGame';
import type { ClientOptions } from '@/types/client';
import { SocketIO } from 'boardgame.io/multiplayer';

export const CluedoClient = (options: ClientOptions) => {
   const CluedoClient = Client({
      game: Cluedo,
      board: CluedoGame,
      debug: true,
      multiplayer: SocketIO({ server: options.server }),
   });

   return (
      <CluedoClient
         playerID={options.playerID}
         credentials={options.credentials}
         matchID={options.matchID}
      />
   );
};
