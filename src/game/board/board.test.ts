import { describe, it, assert, expect } from 'vitest';
import { cluedoGraph } from './boardGraph';
import { getReachableNodes } from './getReachableNodes';

describe('Cluedo board graph consistency', () => {
    it('all room ↔ doorway links are symmetric', () => {
        for (const node of Object.values(cluedoGraph)) {
            if (node.type === 'tile') {
                for (const nbr of node.neighbors) {
                    const neighborNode = cluedoGraph[nbr];
                    if (neighborNode?.type === 'room') {
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
        expect(reachable).toContain('study');
        expect(reachable).toContain('7-4');
    });

    it('does not include the starting node', () => {
        const reachable = getReachableNodes(cluedoGraph, '6-4', 2);
        expect(reachable).not.toContain('6-4');
    });

    it('returns all nodes within N steps', () => {
        const reachable = getReachableNodes(cluedoGraph, '6-4', 3);
        // Example: check that something further away is included
        expect(reachable).toContain('8-4');
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
