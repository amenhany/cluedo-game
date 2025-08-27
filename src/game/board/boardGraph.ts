import { generateTileGraph } from './tileGen';

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
    neighbors: NodeID[];
};

export type TileNode = {
    type: 'tile';
    id: Tile; // e.g. "5-18"
    coord: Coordinates;
    neighbors: NodeID[];
};

export type Node = RoomNode | TileNode;

export type Graph = Record<NodeID, Node>;

/* prettier-ignore */
const grid: (0 | 1 | Room)[][] = [
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 'study', 1, 'hall', 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 'lounge', 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 'hall', 'hall', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 'library', 1, 0, 0, 0, 0, 0, 1, 1, 1, 'diningRoom', 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 'billiardRoom', 1, 'library', 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 'diningRoom', 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 'billiardRoom', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 'ballroom', 1, 1, 1, 1, 'ballroom', 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 'kitchen', 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 'conservatory', 1, 'ballroom', 0, 0, 0, 0, 0, 0, 0, 0, 'ballroom', 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const cluedoGraph: Graph = {
    study: {
        type: 'room',
        id: 'study',
        neighbors: ['6-4'],
    },
    hall: {
        type: 'room',
        id: 'hall',
        neighbors: ['8-4', '11-7', '12-7'],
    },
    lounge: {
        type: 'room',
        id: 'lounge',
        neighbors: ['17-6'],
    },
    library: {
        type: 'room',
        id: 'library',
        neighbors: ['7-8', '3-11'],
    },
    billiardRoom: {
        type: 'room',
        id: 'billiardRoom',
        neighbors: ['1-11', '6-15'],
    },
    diningRoom: {
        type: 'room',
        id: 'diningRoom',
        neighbors: ['17-8', '15-12'],
    },
    conservatory: {
        type: 'room',
        id: 'conservatory',
        neighbors: ['5-19'],
    },
    ballroom: {
        type: 'room',
        id: 'ballroom',
        neighbors: ['7-19', '9-16', '14-16', '16-19'],
    },
    kitchen: {
        type: 'room',
        id: 'kitchen',
        neighbors: ['19-17'],
    },

    ...generateTileGraph(grid),
};
