import { describe, it, assert, expect } from 'vitest';
import { cluedoGraph } from './boardGraph';
import { getReachableNodes } from './getReachableNodes';

describe('Cluedo board graph consistency', () => {
    it('all room ↔ doorway links are symmetric', () => {
        for (const node of Object.values(cluedoGraph)) {
            if (node.type === 'tile') {
                for (const nbr of node.neighbors) {
                    const neighborNode = cluedoGraph[nbr];
                    if (neighborNode?.type === 'room' || neighborNode?.type === 'end') {
                        const hasBackLink = neighborNode.neighbors.includes(node.id);
                        assert.equal(
                            hasBackLink,
                            true,
                            `${node.id} links to ${nbr}, but ${nbr} does not link back`
                        );
                    }
                }
            }
        }
    });
});

describe('getReachableNodes', () => {
    it('returns neighbors within 1 step', () => {
        const reachable = getReachableNodes(cluedoGraph, '6-4', 1);
        expect(reachable).toContain('study'); // room
        expect(reachable).toContain('7-4'); // hall
    });

    it('does not include the starting node', () => {
        const reachable = getReachableNodes(cluedoGraph, '6-4', 2);
        expect(reachable).not.toContain('6-4');
    });

    it('returns all tile nodes at exact distance N', () => {
        const reachable = getReachableNodes(cluedoGraph, '5-4', 3);
        // Some tile further down
        expect(reachable).toContain('8-4');
        // Should not include a tile at distance 2
        expect(reachable).not.toContain('7-4');
        // Can go back and forth
        expect(reachable).toContain('6-4');
    });

    it('cannot take a shortcut through a room', () => {
        const reachable = getReachableNodes(cluedoGraph, '17-8', 5);
        // Dining room itself is okay
        expect(reachable).toContain('diningRoom');
        // But paths past it are blocked
        expect(reachable).not.toContain('14-12');
    });

    it('returns empty when steps = 0', () => {
        const reachable = getReachableNodes(cluedoGraph, '6-4', 0);
        expect(reachable).toEqual([]);
    });

    it('returns empty if no neighbors within steps', () => {
        // Choose an isolated tile (or simulate one)
        const isolatedGraph = {
            '7-4': { type: 'hall', neighbors: [] },
        } as any;
        const reachable = getReachableNodes(isolatedGraph, '7-4', 3);
        expect(reachable).toEqual([]);
    });

    it('stops exploring further from rooms', () => {
        const reachable = getReachableNodes(cluedoGraph, 'study', 3);
        // Should not wander past study
        expect(reachable).not.toContain('8-5');
    });

    it('can not take a shortcut through a room', () => {
        const reachable = getReachableNodes(cluedoGraph, '17-8', 5);
        expect(reachable).toContain('diningRoom');
        expect(reachable).not.toContain('14-12');
    });
});
