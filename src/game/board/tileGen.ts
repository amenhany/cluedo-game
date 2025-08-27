import type { Room, Tile, TileNode } from './boardGraph';

export function generateTileGraph(grid: (0 | 1 | Room)[][]): Record<Tile, TileNode> {
    const graph: Record<Tile, TileNode> = {};

    const height = grid.length;
    const width = grid[0].length;

    const directions = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
    ];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = grid[y][x];
            if (cell === 0) continue; // wall

            const id = `${x}-${y}`;

            const node = {
                type: 'tile',
                id,
                coord: { x, y },
                neighbors: [],
            } as TileNode;

            // Add orthogonal neighbors
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (
                    nx >= 0 &&
                    ny >= 0 &&
                    nx < width &&
                    ny < height &&
                    grid[ny][nx] !== 0
                ) {
                    node.neighbors.push(`${nx}-${ny}`);
                }
            }

            graph[id as Tile] = node;

            // Special case: doorways
            if (cell !== 1) {
                // This cell links to a room node with id = cell (e.g. "Kitchen")
                node.neighbors.push(cell);
                // You can later ensure the room node points back to this tile
            }
        }
    }

    return graph;
}
