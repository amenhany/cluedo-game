import { Client } from 'boardgame.io/react';
import { Cluedo } from '../../game/game';
import CluedoGame from './CluedoGame';

export const CluedoClient = Client({
   game: Cluedo,
   board: CluedoGame,
});
