import { describe, it, assert } from 'vitest';
import { cluedoGraph } from './boardGraph';

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
