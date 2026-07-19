// public/algorithms/aStar.js

export const algorithm = {
  name: "A* Search Pathfinder",
  category: "Pathfinding",
  description: "A* Search Pathfinder is a heuristic-guided graph search algorithm. It calculates the optimal route by minimizing the sum of the actual path cost (G) and the estimated heuristic cost (H) to the goal.",
  pseudocode: [
    "procedure AStar(Graph, start, end):",
    "  openSet = {start}",
    "  gScore[start] = 0",
    "  fScore[start] = heuristic(start, end)",
    "  while openSet is not empty do:",
    "      u = node in openSet with min fScore[u]",
    "      if u == end then reconstruct path",
    "      openSet.remove(u), closedSet.add(u)",
    "      for each neighbor v of u do:",
    "          tentative_gScore = gScore[u] + 1",
    "          if tentative_gScore < gScore[v] then:",
    "              parent[v] = u",
    "              gScore[v] = tentative_gScore",
    "              fScore[v] = gScore[v] + heuristic(v, end)",
    "              if v not in openSet then openSet.add(v)"
  ],
  generator: function(arr, target) {
    const ROWS = 8;
    const COLS = 12;
    const TOTAL_NODES = ROWS * COLS;

    // Node states
    const STATE_EMPTY = 0;
    const STATE_START = 1;
    const STATE_END = 2;
    const STATE_WALL = 3;
    const STATE_VISITED = 4;
    const STATE_PATH = 5;

    const START_INDEX = 25;
    const END_INDEX = 70;

    // Parse heuristic parameter (default: manhattan)
    const heuristicType = (typeof target === 'string') ? target.toLowerCase() : 'manhattan';

    // Parse wall configuration
    const wallIndices = new Set();
    if (arr && arr.length === TOTAL_NODES) {
      arr.forEach((cellType, idx) => {
        if (cellType === STATE_WALL && idx !== START_INDEX && idx !== END_INDEX) {
          wallIndices.add(idx);
        }
      });
    } else {
      [17, 29, 41, 53, 65, 43, 44, 45, 46].forEach(idx => wallIndices.add(idx));
    }

    const grid = Array(TOTAL_NODES).fill(STATE_EMPTY);
    grid[START_INDEX] = STATE_START;
    grid[END_INDEX] = STATE_END;
    wallIndices.forEach(idx => {
      grid[idx] = STATE_WALL;
    });

    const getRowCol = (idx) => ({
      r: Math.floor(idx / COLS),
      c: idx % COLS
    });

    const endPos = getRowCol(END_INDEX);

    // Heuristic helper function
    const getHeuristic = (idx) => {
      const pos = getRowCol(idx);
      const dx = Math.abs(pos.c - endPos.c);
      const dy = Math.abs(pos.r - endPos.r);

      if (heuristicType === 'chebyshev') {
        return Math.max(dx, dy);
      } else if (heuristicType === 'euclidean') {
        return Math.sqrt(dx * dx + dy * dy);
      } else {
        // manhattan (default)
        return dx + dy;
      }
    };

    const snapshots = [];
    let visitCount = 0;
    let pathLength = 0;

    const stats = () => ({
      comparisons: visitCount,
      swaps: pathLength,
      complexity: { time: "O(E log V)", space: "O(V)" }
    });

    const fghScores = {}; // index -> { f, g, h }
    const getGridState = (visitedNodes, pathNodes) => {
      const state = [...grid];
      visitedNodes.forEach(idx => {
        if (idx !== START_INDEX && idx !== END_INDEX) {
          state[idx] = STATE_VISITED;
        }
      });
      pathNodes.forEach(idx => {
        if (idx !== START_INDEX && idx !== END_INDEX) {
          state[idx] = STATE_PATH;
        }
      });
      return state;
    };

    // Initialize scores
    const gScore = Array(TOTAL_NODES).fill(Infinity);
    const fScore = Array(TOTAL_NODES).fill(Infinity);
    const parent = Array(TOTAL_NODES).fill(null);

    gScore[START_INDEX] = 0;
    fScore[START_INDEX] = getHeuristic(START_INDEX);
    fghScores[START_INDEX] = {
      f: fScore[START_INDEX],
      g: gScore[START_INDEX],
      h: fScore[START_INDEX]
    };

    const openSet = new Set([START_INDEX]);
    const closedSet = new Set();

    // Snapshot 0: Initialization
    snapshots.push({
      array: getGridState(closedSet, []),
      highlights: [START_INDEX],
      pointers: { start: START_INDEX, end: END_INDEX },
      executingLine: 0,
      stats: stats(),
      description: `Starting A* Pathfinder using ${heuristicType.toUpperCase()} heuristic.`,
      scores: JSON.parse(JSON.stringify(fghScores))
    });

    let endReached = false;

    while (openSet.size > 0) {
      // Find node in openSet with min fScore
      let u = -1;
      let minF = Infinity;
      for (const node of openSet) {
        if (fScore[node] < minF) {
          minF = fScore[node];
          u = node;
        }
      }

      // Snapshot 5: Select min fScore node
      snapshots.push({
        array: getGridState(closedSet, []),
        highlights: [u],
        pointers: { current: u, start: START_INDEX, end: END_INDEX },
        executingLine: 5,
        stats: stats(),
        description: `Selected open node ${u} with min fScore = ${minF.toFixed(2)} (g = ${gScore[u]}, h = ${getHeuristic(u).toFixed(2)}).`,
        scores: JSON.parse(JSON.stringify(fghScores))
      });

      if (u === END_INDEX) {
        endReached = true;
        // Snapshot 6: End reached
        snapshots.push({
          array: getGridState(closedSet, []),
          highlights: [u],
          pointers: { start: START_INDEX, end: END_INDEX },
          executingLine: 6,
          stats: stats(),
          description: "Reached target end node! Reconstructing optimal path.",
          scores: JSON.parse(JSON.stringify(fghScores))
        });
        break;
      }

      openSet.delete(u);
      closedSet.add(u);
      visitCount++;

      // Relax neighbors
      const pos = getRowCol(u);
      const neighbors = [];
      if (pos.r > 0) neighbors.push(u - COLS); // Up
      if (pos.r < ROWS - 1) neighbors.push(u + COLS); // Down
      if (pos.c > 0) neighbors.push(u - 1); // Left
      if (pos.c < COLS - 1) neighbors.push(u + 1); // Right

      // Snapshot 8: Evaluate neighbors
      snapshots.push({
        array: getGridState(closedSet, []),
        highlights: neighbors.filter(v => !wallIndices.has(v)),
        pointers: { current: u, start: START_INDEX, end: END_INDEX },
        executingLine: 8,
        stats: stats(),
        description: `Evaluate adjacent neighbors for current node ${u}.`,
        scores: JSON.parse(JSON.stringify(fghScores))
      });

      for (const v of neighbors) {
        if (wallIndices.has(v)) continue;
        if (closedSet.has(v)) continue;

        const tentativeG = gScore[u] + 1;

        if (tentativeG < gScore[v]) {
          parent[v] = u;
          gScore[v] = tentativeG;
          const h = getHeuristic(v);
          fScore[v] = tentativeG + h;
          fghScores[v] = {
            f: fScore[v],
            g: gScore[v],
            h: h
          };

          openSet.add(v);

          // Snapshot 10-14: Update score values
          snapshots.push({
            array: getGridState(closedSet, []),
            highlights: [v],
            pointers: { current: u, neighbor: v, start: START_INDEX, end: END_INDEX },
            executingLine: 12,
            stats: stats(),
            description: `Update neighbor ${v}: g = ${gScore[v]}, h = ${h.toFixed(2)}, f = ${fScore[v].toFixed(2)}.`,
            scores: JSON.parse(JSON.stringify(fghScores))
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

      const pathBuild = [];
      for (let step = 0; step < shortestPath.length; step++) {
        pathBuild.push(shortestPath[step]);
        snapshots.push({
          array: getGridState(closedSet, pathBuild),
          highlights: [shortestPath[step]],
          pointers: { pathNode: shortestPath[step], start: START_INDEX, end: END_INDEX },
          executingLine: 6,
          stats: stats(),
          description: `Trace back parent: adding node ${shortestPath[step]} to path.`,
          scores: JSON.parse(JSON.stringify(fghScores))
        });
      }
    }

    // Final completed snapshot
    snapshots.push({
      array: getGridState(closedSet, shortestPath),
      highlights: [],
      pointers: {},
      executingLine: 6,
      stats: stats(),
      description: endReached
        ? `A* completed! Path length is ${pathLength} nodes (visited ${visitCount} nodes).`
        : `A* completed. End node is not reachable.`,
      scores: JSON.parse(JSON.stringify(fghScores))
    });

    return snapshots;
  }
};
