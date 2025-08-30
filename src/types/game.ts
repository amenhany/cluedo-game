/* ##### Board Graph ##### */

import type { PlayerID } from 'boardgame.io';
import type { moves } from '../game/moves';

export type Coordinates = { x: number; y: number };

export type Tile = `${number}-${number}`;

export type Room =
    | 'study'
    | 'hall'
    | 'lounge'
    | 'library'
    | 'billiardRoom'
    | 'diningRoom'
    | 'conservatory'
    | 'ballroom'
    | 'kitchen';

export type NodeID = Tile | Room;
export type RoomNode = {
    type: 'room';
    id: Room; // e.g. "Kitchen"
    coord: Coordinates;
    neighbors: NodeID[];
    secretPassage?: Room;
};

export type TileNode = {
    type: 'tile';
    id: Tile; // e.g. "5-18"
    coord: Coordinates;
    neighbors: NodeID[];
};

export type Node = RoomNode | TileNode;

export type Graph = Record<NodeID, Node>;

/* ##### Game Setup ##### */

export type Character = 'scarlet' | 'mustard' | 'white' | 'green' | 'peacock' | 'plum';
export type Weapon =
    | 'candlestick'
    | 'knife'
    | 'leadPipe'
    | 'revolver'
    | 'rope'
    | 'wrench';
export type Card = Character | Weapon | Room;
export type PlayerState = {
    id: PlayerID;
    character: Character;
    position: NodeID;
    hand: Card[];

    steps?: number;
    availableMoves?: NodeID[];
};

export type GameState = {
    players: Record<PlayerID, PlayerState>;
    envelope: Card[];
    deck: Card[];
};

export type moves = typeof moves;
