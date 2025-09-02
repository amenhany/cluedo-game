import type { Graph, Room } from '../../types/game';
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
        coord: { x: 3, y: 1 },
        secretPassage: 'kitchen',
    },
    hall: {
        type: 'room',
        id: 'hall',
        coord: { x: 3, y: 1 },
        neighbors: ['8-4', '11-7', '12-7'],
    },
    lounge: {
        type: 'room',
        id: 'lounge',
        coord: { x: 3, y: 1 },
        neighbors: ['17-6'],
        secretPassage: 'conservatory',
    },
    library: {
        type: 'room',
        id: 'library',
        coord: { x: 3, y: 1 },
        neighbors: ['7-8', '3-11'],
    },
    billiardRoom: {
        type: 'room',
        id: 'billiardRoom',
        coord: { x: 3, y: 1 },
        neighbors: ['1-11', '6-15'],
    },
    diningRoom: {
        type: 'room',
        id: 'diningRoom',
        coord: { x: 3, y: 1 },
        neighbors: ['17-8', '15-12'],
    },
    conservatory: {
        type: 'room',
        id: 'conservatory',
        coord: { x: 3, y: 1 },
        neighbors: ['5-19'],
        secretPassage: 'lounge',
    },
    ballroom: {
        type: 'room',
        id: 'ballroom',
        coord: { x: 3, y: 1 },
        neighbors: ['7-19', '9-16', '14-16', '16-19'],
    },
    kitchen: {
        type: 'room',
        id: 'kitchen',
        coord: { x: 21, y: 21 },
        neighbors: ['19-17'],
        secretPassage: 'study',
    },

    ...generateTileGraph(grid),
};
