import type { Graph, NodeID } from '../../types/game.js';

/**
 * Returns all nodes reachable from a starting node within `steps` moves.
 */
export function getReachableNodes(graph: Graph, start: NodeID, steps: number): NodeID[] {
    const reachable = new Set<NodeID>();
    const queue: Array<{ node: NodeID; dist: number }> = [{ node: start, dist: 0 }];

    while (queue.length > 0) {
        const { node, dist } = queue.shift()!;
        const type = graph[node].type;

        if (node !== start) {
            if (type === 'room' || type === 'end') {
                // Rooms are always valid once reached
                reachable.add(node);
                continue; // don't go past rooms
            } else if (dist === steps) {
                // Non-room nodes only valid at exact steps
                reachable.add(node);
                continue;
            }
        }

        if (dist < steps) {
            const neighbors = graph[node].neighbors ?? [];
            for (const neighbor of neighbors) {
                queue.push({ node: neighbor, dist: dist + 1 });
            }
        }
    }

    return [...reachable];
}
