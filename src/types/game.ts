/* ##### Board Graph ##### */

import type { PlayerID } from 'boardgame.io';

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
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
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

export type Character = 'scarlett' | 'mustard' | 'white' | 'green' | 'peacock' | 'plum';
export type Weapon =
    | 'candlestick'
    | 'dagger'
    | 'leadPipe'
    | 'revolver'
    | 'rope'
    | 'spanner';
export type Card = Character | Weapon | Room;
export type PlayerState = {
    id: PlayerID;
    character: Character;
    position: NodeID;
    hand: Card[];
    seenCards: Card[];

    steps?: number;
    availableMoves?: NodeID[];
};

export type GameState = {
    players: Record<PlayerID, PlayerState>;
    envelope: Card[];
    deck: Card[];
    pendingSuggestion?: {
        suggester: PlayerID;
        cards: Card[];
    };
};

export type Stage = 'TurnAction' | 'Suggest' | 'ResolveSuggestion';
