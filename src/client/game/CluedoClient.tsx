import { Client } from 'boardgame.io/react';
import { Cluedo } from '../../game';
import CluedoGame from './CluedoGame';

export const CluedoClient = Client({
   game: Cluedo,
   board: CluedoGame,
   debug: true,
   numPlayers: 6,
});
