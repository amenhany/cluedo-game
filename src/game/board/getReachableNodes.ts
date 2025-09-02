import type { Graph, NodeID } from '../../types/game';

/**
 * Returns all nodes reachable from a starting node within `steps` moves.
 */
export function getReachableNodes(graph: Graph, start: NodeID, steps: number): NodeID[] {
    const visited = new Set<NodeID>();
    const queue: Array<{ node: NodeID; dist: number }> = [{ node: start, dist: 0 }];

    visited.add(start);
    const reachable: NodeID[] = [];

    while (queue.length > 0) {
        const { node, dist } = queue.shift()!;

        if (dist > 0) {
            // Don't include the starting node itself
            reachable.push(node);
        }

        if (dist < steps && (graph[node].type !== 'room' || dist === 0)) {
            const neighbors = graph[node].neighbors ?? [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push({ node: neighbor, dist: dist + 1 });
                }
            }
        }
    }

    return reachable;
}
