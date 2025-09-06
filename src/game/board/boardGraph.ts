import type { Coordinates, Graph, Room } from '../../types/game';
import { generateTileGraph } from './tileGen';

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
        bounds: { x: 0, y: 0, width: 7, height: 4 },
        secretPassage: 'kitchen',
    },
    hall: {
        type: 'room',
        id: 'hall',
        bounds: { x: 9, y: 0, width: 6, height: 7 },
        neighbors: ['8-4', '11-7', '12-7'],
    },
    lounge: {
        type: 'room',
        id: 'lounge',
        bounds: { x: 17, y: 0, width: 7, height: 6 },
        neighbors: ['17-6'],
        secretPassage: 'conservatory',
    },
    library: {
        type: 'room',
        id: 'library',
        bounds: { x: 1, y: 6, width: 5, height: 5 },
        neighbors: ['7-8', '3-11'],
    },
    billiardRoom: {
        type: 'room',
        id: 'billiardRoom',
        bounds: { x: 0, y: 12, width: 6, height: 5 },
        neighbors: ['1-11', '6-15'],
    },
    diningRoom: {
        type: 'room',
        id: 'diningRoom',
        bounds: { x: 16, y: 9, width: 8, height: 6 },
        neighbors: ['17-8', '15-12'],
    },
    conservatory: {
        type: 'room',
        id: 'conservatory',
        bounds: { x: 0, y: 20, width: 6, height: 4 },
        neighbors: ['5-19'],
        secretPassage: 'lounge',
    },
    ballroom: {
        type: 'room',
        id: 'ballroom',
        bounds: { x: 8, y: 17, width: 8, height: 6 },
        neighbors: ['7-19', '9-16', '14-16', '16-19'],
    },
    kitchen: {
        type: 'room',
        id: 'kitchen',
        bounds: { x: 18, y: 18, width: 6, height: 6.5 },
        neighbors: ['19-17'],
        secretPassage: 'study',
    },

    ...generateTileGraph(grid),
};

export const secretPassages: Partial<Record<Room, Coordinates>> = {
    study: { x: -0.12, y: 2.75 },
    lounge: { x: 23.1, y: 4.83 },
    conservatory: { x: 0.95, y: 19.25 },
    kitchen: { x: 18.2, y: 23.2 },
};
