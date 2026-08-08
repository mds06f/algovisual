// public/algorithms/graphOps.js

const nodes = ['A', 'B', 'C', 'D', 'E', 'F'];
const edges = [
  { u: 'A', v: 'B', w: 4 },
  { u: 'A', v: 'C', w: 2 },
  { u: 'B', v: 'C', w: 1 },
  { u: 'B', v: 'D', w: 5 },
  { u: 'C', v: 'D', w: 8 },
  { u: 'C', v: 'E', w: 10 },
  { u: 'D', v: 'E', w: 2 },
  { u: 'D', v: 'F', w: 6 },
  { u: 'E', v: 'F', w: 3 }
];

export const algorithm = {
  name: 'Graph Operations',
  category: 'Graph',
  description: 'Visualizes Breadth-First Search (BFS), Depth-First Search (DFS), and Minimum Spanning Tree (MST - Prim\'s and Kruskal\'s) on a weighted undirected graph.',
  pseudocode: [
    'procedure graphOperation(G, startNode)',
    '  initialize traversal structures (queue/stack/visited)',
    '  while elements remain to be processed do',
    '    inspect next node or edge',
    '    update visited state and record path',
    '  return complete operation state'
  ],
  generator: function (arr, target) {
    // Unpack target option (defaults to bfs starting at A)
    let algoType = 'bfs';
    let startNode = 'A';
    let graphType = 'undirected';
    
    if (target && typeof target === 'object') {
      algoType = target.algoType || 'bfs';
      startNode = target.startNode || 'A';
      graphType = target.graphType || 'undirected';
    } else if (typeof target === 'string') {
      algoType = target;
    }

    const isDirected = graphType === 'directed';
    const snapshots = [];

    // Helper to get sorted edge key
    const getEdgeKey = (u, v) => [u, v].sort().join('-');

    if (algoType === 'bfs') {
      runBFS(startNode, snapshots, getEdgeKey, isDirected);
    } else if (algoType === 'dfs') {
      runDFS(startNode, snapshots, getEdgeKey, isDirected);
    } else if (algoType === 'prim') {
      runPrim(startNode, snapshots, getEdgeKey);
    } else if (algoType === 'kruskal') {
      runKruskal(snapshots, getEdgeKey);
    }

    // Attach isDirected metadata to all snapshots
    snapshots.forEach(s => {
      s.isDirected = isDirected;
    });

    return snapshots;
  }
};

function runBFS(start, snapshots, getEdgeKey, isDirected = false) {
  const queue = [start];
  const visited = new Set([start]);
  const nodesState = {};
  const edgesState = {};
  
  nodes.forEach(n => nodesState[n] = 'unvisited');
  edges.forEach(e => edgesState[getEdgeKey(e.u, e.v)] = 'default');

  let comparisons = 0;
  let swaps = 0;
  
  const stats = () => ({
    comparisons,
    swaps,
    complexity: { time: 'O(V + E)', space: 'O(V)' }
  });

  // Snapshot 0: Initialization
  nodesState[start] = 'visiting';
  snapshots.push({
    array: [1],
    highlights: [],
    pointers: { queue_size: queue.length },
    nodesState: { ...nodesState },
    edgesState: { ...edgesState },
    executingLine: 1,
    stats: stats(),
    description: `Initialize BFS from start Node ${start}. Added to queue.`
  });

  while (queue.length > 0) {
    const curr = queue.shift();
    nodesState[curr] = 'visiting';
    
    snapshots.push({
      array: [1],
      highlights: [],
      pointers: { active_node: curr, queue_size: queue.length },
      nodesState: { ...nodesState },
      edgesState: { ...edgesState },
      executingLine: 2,
      stats: stats(),
      description: `Dequeue and inspect Node ${curr}.`
    });

    // Find neighbors
    const neighbors = [];
    edges.forEach(e => {
      comparisons++;
      if (e.u === curr) neighbors.push({ neighbor: e.v, edge: e });
      else if (!isDirected && e.v === curr) neighbors.push({ neighbor: e.u, edge: e });
    });

    neighbors.forEach(({ neighbor, edge }) => {
      const edgeKey = getEdgeKey(edge.u, edge.v);
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        nodesState[neighbor] = 'visiting';
        edgesState[edgeKey] = 'active';
        swaps++; // using swaps counter for path additions

        snapshots.push({
          array: [1],
          highlights: [],
          pointers: { active_node: curr, neighbor: neighbor },
          nodesState: { ...nodesState },
          edgesState: { ...edgesState },
          executingLine: 4,
          stats: stats(),
          description: `Discovered unvisited neighbor Node ${neighbor} via edge ${curr}-${neighbor}. Enqueueing.`
        });
      } else {
        if (edgesState[edgeKey] === 'default') {
          edgesState[edgeKey] = 'active';
          snapshots.push({
            array: [1],
            highlights: [],
            pointers: { active_node: curr, neighbor: neighbor },
            nodesState: { ...nodesState },
            edgesState: { ...edgesState },
            executingLine: 3,
            stats: stats(),
            description: `Neighbor Node ${neighbor} is already visited. Edge ${curr}-${neighbor} evaluated.`
          });
        }
      }
    });

    nodesState[curr] = 'visited';
  }

  // Final State
  snapshots.push({
    array: [1],
    highlights: [],
    pointers: {},
    nodesState: { ...nodesState },
    edgesState: { ...edgesState },
    executingLine: 5,
    stats: stats(),
    description: `BFS completed. Visited nodes: [${Array.from(visited).join(', ')}].`
  });
}

function runDFS(start, snapshots, getEdgeKey, isDirected = false) {
  const visited = new Set();
  const nodesState = {};
  const edgesState = {};
  
  nodes.forEach(n => nodesState[n] = 'unvisited');
  edges.forEach(e => edgesState[getEdgeKey(e.u, e.v)] = 'default');

  let comparisons = 0;
  let swaps = 0;
  
  const stats = () => ({
    comparisons,
    swaps,
    complexity: { time: 'O(V + E)', space: 'O(V)' }
  });

  // Helper recursive DFS
  function dfsVisit(curr, parent = null) {
    visited.add(curr);
    nodesState[curr] = 'visiting';
    if (parent) {
      edgesState[getEdgeKey(parent, curr)] = 'active';
      swaps++;
    }

    snapshots.push({
      array: [1],
      highlights: [],
      pointers: { active_node: curr },
      nodesState: { ...nodesState },
      edgesState: { ...edgesState },
      executingLine: 2,
      stats: stats(),
      description: `Visit Node ${curr}. Call stack frame active.`
    });

    // Get neighbors
    const neighbors = [];
    edges.forEach(e => {
      comparisons++;
      if (e.u === curr) neighbors.push(e.v);
      else if (!isDirected && e.v === curr) neighbors.push(e.u);
    });

    for (let neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfsVisit(neighbor, curr);
      }
    }

    nodesState[curr] = 'visited';
    snapshots.push({
      array: [1],
      highlights: [],
      pointers: { active_node: curr },
      nodesState: { ...nodesState },
      edgesState: { ...edgesState },
      executingLine: 4,
      stats: stats(),
      description: `Backtrack from Node ${curr}. Execution frame complete.`
    });
  }

  // Snapshot 0: Start
  snapshots.push({
    array: [1],
    highlights: [],
    pointers: {},
    nodesState: { ...nodesState },
    edgesState: { ...edgesState },
    executingLine: 1,
    stats: stats(),
    description: `Initialize DFS recursion from start Node ${start}.`
  });

  dfsVisit(start);

  // Final state
  snapshots.push({
    array: [1],
    highlights: [],
    pointers: {},
    nodesState: { ...nodesState },
    edgesState: { ...edgesState },
    executingLine: 5,
    stats: stats(),
    description: `DFS traversal completed.`
  });
}

function runPrim(start, snapshots, getEdgeKey) {
  const visited = new Set([start]);
  const nodesState = {};
  const edgesState = {};
  
  nodes.forEach(n => nodesState[n] = 'unvisited');
  edges.forEach(e => edgesState[getEdgeKey(e.u, e.v)] = 'default');

  nodesState[start] = 'visited';

  let comparisons = 0;
  let swaps = 0; // Using swaps as MST accumulated weight
  
  const stats = () => ({
    comparisons,
    swaps,
    complexity: { time: 'O(E log V)', space: 'O(V + E)' }
  });

  // Snapshot 0: Start
  snapshots.push({
    array: [1],
    highlights: [],
    pointers: { visited_count: visited.size },
    nodesState: { ...nodesState },
    edgesState: { ...edgesState },
    executingLine: 1,
    stats: stats(),
    description: `Start Prim's MST from Node ${start}. Visited = {${start}}`
  });

  while (visited.size < nodes.length) {
    // Find all crossing edges
    let minEdge = null;
    let minWeight = Infinity;

    edges.forEach(e => {
      const uIn = visited.has(e.u);
      const vIn = visited.has(e.v);
      comparisons++;
      if (uIn !== vIn) { // exactly one endpoint is visited
        if (e.w < minWeight) {
          minWeight = e.w;
          minEdge = e;
        }
      }
    });

    if (!minEdge) break; // disconnected graph

    const nextNode = visited.has(minEdge.u) ? minEdge.v : minEdge.u;
    const edgeKey = getEdgeKey(minEdge.u, minEdge.v);
    
    // Highlight evaluation step
    edgesState[edgeKey] = 'active';
    snapshots.push({
      array: [1],
      highlights: [],
      pointers: { min_edge_weight: minWeight },
      nodesState: { ...nodesState },
      edgesState: { ...edgesState },
      executingLine: 3,
      stats: stats(),
      description: `Inspect cut set edges. Minimum crossing edge is ${minEdge.u}-${minEdge.v} with weight ${minWeight}.`
    });

    // Add node and edge to MST
    visited.add(nextNode);
    nodesState[nextNode] = 'visited';
    edgesState[edgeKey] = 'mst';
    swaps += minWeight;

    snapshots.push({
      array: [1],
      highlights: [],
      pointers: { visited_count: visited.size },
      nodesState: { ...nodesState },
      edgesState: { ...edgesState },
      executingLine: 4,
      stats: stats(),
      description: `Add Node ${nextNode} and edge ${minEdge.u}-${minEdge.v} to MST. Total MST weight is now ${swaps}.`
    });
  }

  // Final MST
  snapshots.push({
    array: [1],
    highlights: [],
    pointers: {},
    nodesState: { ...nodesState },
    edgesState: { ...edgesState },
    executingLine: 5,
    stats: stats(),
    description: `Prim's MST algorithm completed. Minimum spanning tree constructed with total weight: ${swaps}.`
  });
}

function runKruskal(snapshots, getEdgeKey) {
  const nodesState = {};
  const edgesState = {};
  
  nodes.forEach(n => nodesState[n] = 'unvisited');
  edges.forEach(e => edgesState[getEdgeKey(e.u, e.v)] = 'default');

  // Sort edges by weight
  const sortedEdges = [...edges].sort((a, b) => a.w - b.w);
  
  // Union Find
  const parent = {};
  nodes.forEach(n => parent[n] = n);

  const find = (i) => {
    while (parent[i] !== i) {
      i = parent[i];
    }
    return i;
  };

  const union = (i, j) => {
    const rootI = find(i);
    const rootJ = find(j);
    parent[rootI] = rootJ;
  };

  let comparisons = 0;
  let swaps = 0; // Total MST weight
  let mstEdgesCount = 0;

  const stats = () => ({
    comparisons,
    swaps,
    complexity: { time: 'O(E log V)', space: 'O(V + E)' }
  });

  // Snapshot 0: Initialize
  snapshots.push({
    array: [1],
    highlights: [],
    pointers: {},
    nodesState: { ...nodesState },
    edgesState: { ...edgesState },
    executingLine: 1,
    stats: stats(),
    description: `Kruskal's initialization. Sorted edges list by weight: [${sortedEdges.map(e => `${e.u}-${e.v}(${e.w})`).join(', ')}]`
  });

  for (let i = 0; i < sortedEdges.length; i++) {
    const edge = sortedEdges[i];
    const edgeKey = getEdgeKey(edge.u, edge.v);
    
    // Highlight active edge being evaluated
    edgesState[edgeKey] = 'active';
    comparisons++;

    snapshots.push({
      array: [1],
      highlights: [],
      pointers: { current_edge_weight: edge.w },
      nodesState: { ...nodesState },
      edgesState: { ...edgesState },
      executingLine: 3,
      stats: stats(),
      description: `Evaluate edge ${edge.u}-${edge.v} with weight ${edge.w}.`
    });

    const rootU = find(edge.u);
    const rootV = find(edge.v);

    if (rootU !== rootV) {
      union(edge.u, edge.v);
      edgesState[edgeKey] = 'mst';
      nodesState[edge.u] = 'visited';
      nodesState[edge.v] = 'visited';
      swaps += edge.w;
      mstEdgesCount++;

      snapshots.push({
        array: [1],
        highlights: [],
        pointers: { mst_edges: mstEdgesCount },
        nodesState: { ...nodesState },
        edgesState: { ...edgesState },
        executingLine: 4,
        stats: stats(),
        description: `Edge ${edge.u}-${edge.v} does not form a cycle. Added to MST. Total weight is ${swaps}.`
      });
    } else {
      // forms cycle
      edgesState[edgeKey] = 'default'; // remove active highlight
      snapshots.push({
        array: [1],
        highlights: [],
        pointers: {},
        nodesState: { ...nodesState },
        edgesState: { ...edgesState },
        executingLine: 3,
        stats: stats(),
        description: `Edge ${edge.u}-${edge.v} forms a cycle. Discarded.`
      });
    }

    if (mstEdgesCount === nodes.length - 1) break;
  }

  // Final State
  snapshots.push({
    array: [1],
    highlights: [],
    pointers: {},
    nodesState: { ...nodesState },
    edgesState: { ...edgesState },
    executingLine: 5,
    stats: stats(),
    description: `Kruskal's MST algorithm completed. Spanning tree weight: ${swaps}.`
  });
}
