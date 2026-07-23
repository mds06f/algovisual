// public/algorithms/dijkstra.js

export const algorithm = {
  name: "Dijkstra's Algorithm",
  category: 'Pathfinding',
  description:
    "Dijkstra's Algorithm finds the shortest path between nodes in a graph. For a grid layout, it systematically visits neighboring nodes to find the shortest distance from the start node to the end node, bypassing wall obstacles.",
  pseudocode: [
    'procedure Dijkstra(Graph, start, end):',
    '  for each node v in Graph do:',
    '    dist[v] = INFINITY, visited[v] = false',
    '  dist[start] = 0',
    '  while there are unvisited nodes do:',
    '    u = unvisited node with min dist[u]',
    '    if u == end or dist[u] == INFINITY then break',
    '    visited[u] = true',
    '    for each neighbor v of u do:',
    '      alt = dist[u] + 1',
    '      if alt < dist[v] then',
    '        dist[v] = alt, parent[v] = u',
    '  reconstruct shortest path from parent map',
  ],
  generator: function (arr) {
    // Dijkstra operates on a grid of fixed dimensions 8 rows x 12 columns = 96 nodes
    const ROWS = 8;
    const COLS = 12;
    const TOTAL_NODES = ROWS * COLS;

    // Define Node states
    const STATE_EMPTY = 0;
    const STATE_START = 1;
    const STATE_END = 2;
    const STATE_WALL = 3;
    const STATE_VISITED = 4;
    const STATE_PATH = 5;

    // Start node: index 25 (row 2, col 1)
    const START_INDEX = 25;
    // End node: index 70 (row 5, col 10)
    const END_INDEX = 70;

    // Define some walls/weights
    const wallIndices = new Set();
    const weightIndices = new Set();
    if (arr && arr.length === TOTAL_NODES) {
      arr.forEach((cellType, idx) => {
        if (
          cellType === STATE_WALL &&
          idx !== START_INDEX &&
          idx !== END_INDEX
        ) {
          wallIndices.add(idx);
        } else if (
          cellType === 6 &&
          idx !== START_INDEX &&
          idx !== END_INDEX
        ) {
          weightIndices.add(idx);
        }
      });
    } else {
      [17, 29, 41, 53, 65, 43, 44, 45, 46].forEach((idx) =>
        wallIndices.add(idx),
      );
    }

    // Build initial grid state array
    const grid = Array(TOTAL_NODES).fill(STATE_EMPTY);
    grid[START_INDEX] = STATE_START;
    grid[END_INDEX] = STATE_END;
    wallIndices.forEach((idx) => {
      grid[idx] = STATE_WALL;
    });

    const snapshots = [];
    let visitCount = 0;
    let pathLength = 0;

    const stats = () => ({
      comparisons: visitCount,
      swaps: pathLength,
      complexity: { time: 'O(V²)', space: 'O(V)' },
    });

    // Helper to get active grid state representation
    const getGridState = (visitedNodes, pathNodes) => {
      const state = [...grid];
      weightIndices.forEach((idx) => {
        if (idx !== START_INDEX && idx !== END_INDEX) {
          state[idx] = 6;
        }
      });
      visitedNodes.forEach((idx) => {
        if (idx !== START_INDEX && idx !== END_INDEX && !weightIndices.has(idx)) {
          state[idx] = STATE_VISITED;
        }
      });
      pathNodes.forEach((idx) => {
        if (idx !== START_INDEX && idx !== END_INDEX) {
          state[idx] = STATE_PATH;
        }
      });
      return state;
    };

    // Snapshot 0: Initial state (procedure Dijkstra...)
    snapshots.push({
      array: getGridState(new Set(), []),
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Starting Dijkstra's algorithm. Start node: (2,1), End node: (5,10)`,
    });

    // Dijkstra variables setup
    const dist = Array(TOTAL_NODES).fill(Infinity);
    const visited = Array(TOTAL_NODES).fill(false);
    const parent = Array(TOTAL_NODES).fill(null);

    dist[START_INDEX] = 0;

    // Snapshot 1: dist[v] = Infinity, dist[start] = 0
    snapshots.push({
      array: getGridState(new Set(), []),
      highlights: [START_INDEX],
      pointers: { start: START_INDEX, end: END_INDEX },
      executingLine: 1,
      stats: stats(),
      description: `Initialize distances: set start node distance to 0, all others to infinity.`,
    });

    const visitedOrder = [];
    const visitedSet = new Set();
    let endReached = false;

    while (true) {
      // Find unvisited node with minimum distance
      let minDist = Infinity;
      let u = -1;

      for (let i = 0; i < TOTAL_NODES; i++) {
        if (!visited[i] && dist[i] < minDist) {
          minDist = dist[i];
          u = i;
        }
      }

      // Snapshot 4: while there are unvisited nodes / find min dist u
      snapshots.push({
        array: getGridState(visitedSet, []),
        highlights: u !== -1 ? [u] : [],
        pointers:
          u !== -1
            ? { current: u, start: START_INDEX, end: END_INDEX }
            : { start: START_INDEX, end: END_INDEX },
        executingLine: 4,
        stats: stats(),
        description:
          u !== -1
            ? `Selected unvisited node ${u} with min distance = ${minDist}.`
            : 'No more reachable unvisited nodes.',
      });

      if (u === -1 || dist[u] === Infinity || u === END_INDEX) {
        if (u === END_INDEX) {
          endReached = true;
        }
        // Snapshot 5: if u == end or dist[u] == INFINITY then break
        snapshots.push({
          array: getGridState(visitedSet, []),
          highlights: u !== -1 ? [u] : [],
          pointers: { start: START_INDEX, end: END_INDEX },
          executingLine: 5,
          stats: stats(),
          description: endReached
            ? 'Reached target end node! Breaking Dijkstra search loop.'
            : 'Search complete. End node is unreachable.',
        });
        break;
      }

      visited[u] = true;
      visitedSet.add(u);
      visitedOrder.push(u);
      visitCount++;

      // Snapshot 6: visited[u] = true
      snapshots.push({
        array: getGridState(visitedSet, []),
        highlights: [u],
        pointers: { current: u, start: START_INDEX, end: END_INDEX },
        executingLine: 6,
        stats: stats(),
        description: `Mark node ${u} as visited and locked.`,
      });

      // Relax neighbors (up, down, left, right)
      const r = Math.floor(u / COLS);
      const c = u % COLS;
      const neighbors = [];

      if (r > 0) neighbors.push(u - COLS); // Up
      if (r < ROWS - 1) neighbors.push(u + COLS); // Down
      if (c > 0) neighbors.push(u - 1); // Left
      if (c < COLS - 1) neighbors.push(u + 1); // Right

      // Snapshot 7: for each neighbor v of u do
      snapshots.push({
        array: getGridState(visitedSet, []),
        highlights: neighbors.filter((v) => !grid[v] === STATE_WALL),
        pointers: { current: u, start: START_INDEX, end: END_INDEX },
        executingLine: 7,
        stats: stats(),
        description: `Evaluate adjacent neighbors for current node ${u}.`,
      });

      for (const v of neighbors) {
        // Skip walls
        if (wallIndices.has(v)) continue;
        const cost = weightIndices.has(v) ? 5 : 1;
        const alt = dist[u] + cost;

        // Snapshot 8: alt = dist[u] + 1
        snapshots.push({
          array: getGridState(visitedSet, []),
          highlights: [u, v],
          pointers: {
            current: u,
            neighbor: v,
            start: START_INDEX,
            end: END_INDEX,
          },
          executingLine: 8,
          stats: stats(),
          description: `Compare distance: path weight to ${v} through ${u} is ${alt} (current is ${dist[v]}).`,
        });

        if (alt < dist[v]) {
          dist[v] = alt;
          parent[v] = u;

          // Snapshot 9: dist[v] = alt, parent[v] = u
          snapshots.push({
            array: getGridState(visitedSet, []),
            highlights: [v],
            pointers: {
              current: u,
              neighbor: v,
              start: START_INDEX,
              end: END_INDEX,
            },
            executingLine: 10, // Corresponds to: dist[v] = alt, parent[v] = u block
            stats: stats(),
            description: `Update distance: node ${v} new shortest distance is ${alt} via ${u}.`,
          });
        }
      }
    }

    // Shortest path reconstruction
    const shortestPath = [];
    if (endReached) {
      let curr = END_INDEX;
      while (curr !== null) {
        shortestPath.push(curr);
        curr = parent[curr];
      }
      shortestPath.reverse();
      pathLength = shortestPath.length;

      // Yield path reconstruction step by step
      const pathBuild = [];
      for (let step = 0; step < shortestPath.length; step++) {
        pathBuild.push(shortestPath[step]);

        // Snapshot 11: reconstruct path
        snapshots.push({
          array: getGridState(visitedSet, pathBuild),
          highlights: [shortestPath[step]],
          pointers: {
            pathNode: shortestPath[step],
            start: START_INDEX,
            end: END_INDEX,
          },
          executingLine: 11,
          stats: stats(),
          description: `Trace back parent: adding node ${shortestPath[step]} to shortest path.`,
        });
      }
    }

    // Final Snapshot: Completed
    snapshots.push({
      array: getGridState(visitedSet, shortestPath),
      highlights: [],
      pointers: {},
      executingLine: 11,
      stats: stats(),
      description: endReached
        ? `Dijkstra completed! Shortest path length is ${pathLength} nodes (visited ${visitCount} nodes).`
        : `Dijkstra completed. End node is not reachable from start node.`,
    });

    return snapshots;
  },
};
