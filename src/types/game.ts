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

export type NodeID = Tile | Room | 'end';
export type RoomNode = {
    type: 'room';
    id: Room; // e.g. "Kitchen"
    bounds: Coordinates & {
        width: number;
        height: number;
    };
    neighbors: NodeID[];
    secretPassage?: Room;
};

export type EndNode = {
    type: 'end';
    id: 'end';
    bounds: Coordinates & {
        width: number;
        height: number;
    };
    neighbors: NodeID[];
};

export type TileNode = {
    type: 'tile';
    id: Tile; // e.g. "5-18"
    coord: Coordinates;
    neighbors: NodeID[];
};

export type Node = RoomNode | TileNode | EndNode;

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
export type Suggestion = {
    suspect: Character;
    weapon: Weapon;
    room: Room;
};
export type NullableSuggestion = {
    [K in keyof Suggestion]: Suggestion[K] | null;
};
export type PlayerState = {
    id: PlayerID;
    name: string;
    character: Character;
    position: NodeID;
    hand: Card[];
    seenCards: Card[];
    isEliminated: boolean;

    steps?: number;
    availableMoves?: NodeID[];
};

export type GameState = {
    players: Record<PlayerID, PlayerState>;
    weapons: Record<Weapon, Room>;
    rules: Rules;
    envelope: Card[];
    deck: Card[];
    pendingSuggestion?: NullableSuggestion & {
        suggester: PlayerID;
        suspectOrigin: NodeID | null;
    };
    prevSuggestion?: {
        id: number;
        suggester: PlayerID;
        resolver: PlayerID | null;
    };
};

export type Stage =
    | 'TurnAction'
    | 'RoomAction'
    | 'Suggest'
    | 'ResolveSuggestion'
    | 'Endgame';

export type Rules = {
    returnPlayersAfterSuggestion: boolean;
};

export type SetupData = {
    started: boolean;
    rules: Rules;
    players: { id: number; name: string; data: { character: Character } }[];
};
