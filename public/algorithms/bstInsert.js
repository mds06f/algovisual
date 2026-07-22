// public/algorithms/bstInsert.js

export const algorithm = {
  name: 'BST Insertion',
  category: 'Searching',
  description:
    'Binary Search Tree (BST) Insertion places each element from the array into a BST node by comparing keys left (smaller) or right (larger). Visualised as a flat array tape representing traversal depth order.',
  pseudocode: [
    'procedure bstInsert(A : list of items):',
    '  root = null',
    '  for each key in A do:',
    '    node = root',
    '    while node is not null do:',
    '      if key < node.key then',
    '        node = node.left',
    '      else',
    '        node = node.right',
    '    insert key at current position',
    '  return root',
  ],

  generator: function (arr) {
    const snapshots = [];

    // Internal BST node structure
    function makeNode(key) {
      return { key, left: null, right: null };
    }

    // Serialize the BST into a level-order (BFS) array for visualisation
    function serializeToArray(root, size) {
      const result = Array(size).fill(0);
      if (!root) return result;
      const queue = [{ node: root, idx: 0 }];
      while (queue.length > 0) {
        const { node, idx } = queue.shift();
        if (idx >= size) continue;
        result[idx] = node.key;
        if (node.left) queue.push({ node: node.left, idx: 2 * idx + 1 });
        if (node.right) queue.push({ node: node.right, idx: 2 * idx + 2 });
      }
      return result;
    }

    // Collect traversal path indices for highlighting during insert
    function getInsertPath(root, key) {
      const path = [];
      let node = root;
      let idx = 0;
      while (node !== null) {
        path.push(idx);
        if (key < node.key) {
          node = node.left;
          idx = 2 * idx + 1;
        } else {
          node = node.right;
          idx = 2 * idx + 2;
        }
      }
      return path;
    }

    const DISPLAY_SIZE = 15; // Max nodes to display in flat BFS canvas
    let root = null;
    let comparisonCount = 0;

    const stats = () => ({
      comparisons: comparisonCount,
      swaps: 0,
      complexity: { time: 'O(n log n)', space: 'O(n)' },
    });

    // Snapshot 0: Initial state
    snapshots.push({
      array: Array(DISPLAY_SIZE).fill(0),
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Starting BST Insertion. Will insert ${arr.length} keys into the tree.`,
    });

    // Snapshot 1: root = null
    snapshots.push({
      array: Array(DISPLAY_SIZE).fill(0),
      highlights: [],
      pointers: {},
      executingLine: 1,
      stats: stats(),
      description: 'Initialise root = null. Tree is empty.',
    });

    for (let k = 0; k < arr.length; k++) {
      const key = arr[k];

      // Snapshot 2: for each key
      snapshots.push({
        array: serializeToArray(root, DISPLAY_SIZE),
        highlights: [],
        pointers: { key: k },
        executingLine: 2,
        stats: stats(),
        description: `Inserting key ${key} (element ${k + 1} of ${arr.length}).`,
      });

      if (root === null) {
        root = makeNode(key);
        // Snapshot 1: root = null → new root
        snapshots.push({
          array: serializeToArray(root, DISPLAY_SIZE),
          highlights: [0],
          pointers: { root: 0 },
          executingLine: 9,
          stats: stats(),
          description: `Tree was empty. ${key} becomes the root at position 0.`,
        });
        continue;
      }

      // Walk traversal and build path highlights
      const path = getInsertPath(root, key);

      // Traverse, snapshotting each comparison
      let node = root;
      let idx = 0;
      while (node !== null) {
        comparisonCount++;

        if (key < node.key) {
          // Snapshot 5: key < node.key → go left
          snapshots.push({
            array: serializeToArray(root, DISPLAY_SIZE),
            highlights: [idx],
            pointers: { current: idx },
            executingLine: 5,
            stats: stats(),
            description: `Compare ${key} < ${node.key}? Yes → traverse left child at position ${2 * idx + 1}.`,
          });
          if (node.left === null) {
            node.left = makeNode(key);
            snapshots.push({
              array: serializeToArray(root, DISPLAY_SIZE),
              highlights: [2 * idx + 1],
              pointers: { inserted: 2 * idx + 1 },
              executingLine: 9,
              stats: stats(),
              description: `Left child is empty. Inserted ${key} at position ${2 * idx + 1}.`,
            });
            break;
          }
          node = node.left;
          idx = 2 * idx + 1;
        } else {
          // Snapshot 7: key >= node.key → go right
          snapshots.push({
            array: serializeToArray(root, DISPLAY_SIZE),
            highlights: [idx],
            pointers: { current: idx },
            executingLine: 7,
            stats: stats(),
            description: `Compare ${key} < ${node.key}? No → traverse right child at position ${2 * idx + 2}.`,
          });
          if (node.right === null) {
            node.right = makeNode(key);
            snapshots.push({
              array: serializeToArray(root, DISPLAY_SIZE),
              highlights: [2 * idx + 2],
              pointers: { inserted: 2 * idx + 2 },
              executingLine: 9,
              stats: stats(),
              description: `Right child is empty. Inserted ${key} at position ${2 * idx + 2}.`,
            });
            break;
          }
          node = node.right;
          idx = 2 * idx + 2;
        }
      }
    }

    // Final snapshot: completed tree
    snapshots.push({
      array: serializeToArray(root, DISPLAY_SIZE),
      highlights: [],
      pointers: {},
      executingLine: 10,
      stats: stats(),
      description: `BST construction complete. All ${arr.length} keys inserted. Total comparisons: ${comparisonCount}.`,
    });

    return snapshots;
  },
};
