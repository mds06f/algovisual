// public/algorithms/avlRedBlackTree.js

export const algorithm = {
  name: 'Self-Balancing Trees',
  category: 'Tree',
  description: 'Visualizes AVL and Red-Black Tree key insertions and structural rotation balance updates.',
  pseudocode: [
    'procedure insert(tree, key)',
    '  perform normal Binary Search Tree insertion',
    '  walk up and check height balance or color conflicts',
    '  perform single or double rotations if necessary',
    '  recolor nodes (Red-Black) to satisfy tree invariants'
  ],
  generator: function (arr, target) {
    let mode = 'avl'; // default 'avl' tree insertion
    if (target === 'rbt' || (target && target.mode === 'rbt')) {
      mode = 'rbt';
    }

    const snapshots = [];
    let root = null;

    // We process each key in the array
    arr.forEach((key, idx) => {
      const keysLeft = arr.slice(idx + 1);
      if (mode === 'avl') {
        root = insertAVL(root, key, snapshots, keysLeft);
      } else {
        root = insertRBT(root, key, snapshots, keysLeft);
      }
    });

    return snapshots;
  }
};

// ── AVL Insertion & Rotations ────────────────────────────────────────────────

class AVLNode {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.color = 'default';
  }
}

function getHeight(n) {
  return n ? n.height : 0;
}

function getBalance(n) {
  return n ? getHeight(n.left) - getHeight(n.right) : 0;
}

function rightRotate(y, snapshots, keysLeft, msgPrefix = '') {
  const x = y.left;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;

  snapshots.push({
    array: [...keysLeft],
    highlights: [],
    pointers: { rotating_node: y.key, pivot: x.key },
    tree: serializeTree(x),
    executingLine: 4,
    stats: { comparisons: snapshots.length, swaps: 0 },
    description: `${msgPrefix} Right rotation completed on node ${y.key} (pivot: ${x.key}).`
  });

  return x;
}

function leftRotate(x, snapshots, keysLeft, msgPrefix = '') {
  const y = x.right;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;

  snapshots.push({
    array: [...keysLeft],
    highlights: [],
    pointers: { rotating_node: x.key, pivot: y.key },
    tree: serializeTree(y),
    executingLine: 4,
    stats: { comparisons: snapshots.length, swaps: 0 },
    description: `${msgPrefix} Left rotation completed on node ${x.key} (pivot: ${y.key}).`
  });

  return y;
}

function insertAVL(node, key, snapshots, keysLeft) {
  // 1. Standard BST insertion
  if (!node) {
    const fresh = new AVLNode(key);
    snapshots.push({
      array: [...keysLeft],
      highlights: [],
      pointers: { inserted: key },
      tree: serializeTree(fresh),
      executingLine: 2,
      stats: { comparisons: snapshots.length, swaps: 0 },
      description: `Inserted key ${key} at leaf node.`
    });
    return fresh;
  }

  if (key < node.key) {
    node.left = insertAVL(node.left, key, snapshots, keysLeft);
  } else if (key > node.key) {
    node.right = insertAVL(node.right, key, snapshots, keysLeft);
  } else {
    return node; // Duplicate keys not allowed
  }

  // 2. Update height
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));

  // 3. Balance checks and rotation triggers
  const balance = getBalance(node);

  // Left Left Case
  if (balance > 1 && key < node.left.key) {
    snapshots.push({
      array: [...keysLeft],
      highlights: [],
      pointers: { unbalanced: node.key },
      tree: serializeTree(node),
      executingLine: 3,
      stats: { comparisons: snapshots.length, swaps: 0 },
      description: `Unbalanced height (+${balance}) on node ${node.key} (Left-Left). Performing Right rotation.`
    });
    return rightRotate(node, snapshots, keysLeft, '[LL]');
  }

  // Right Right Case
  if (balance < -1 && key > node.right.key) {
    snapshots.push({
      array: [...keysLeft],
      highlights: [],
      pointers: { unbalanced: node.key },
      tree: serializeTree(node),
      executingLine: 3,
      stats: { comparisons: snapshots.length, swaps: 0 },
      description: `Unbalanced height (${balance}) on node ${node.key} (Right-Right). Performing Left rotation.`
    });
    return leftRotate(node, snapshots, keysLeft, '[RR]');
  }

  // Left Right Case
  if (balance > 1 && key > node.left.key) {
    snapshots.push({
      array: [...keysLeft],
      highlights: [],
      pointers: { unbalanced: node.key, child: node.left.key },
      tree: serializeTree(node),
      executingLine: 3,
      stats: { comparisons: snapshots.length, swaps: 0 },
      description: `Unbalanced height (+${balance}) on node ${node.key} (Left-Right). Left-rotating child ${node.left.key}.`
    });
    node.left = leftRotate(node.left, snapshots, keysLeft, '[LR Child]');
    return rightRotate(node, snapshots, keysLeft, '[LR Root]');
  }

  // Right Left Case
  if (balance < -1 && key < node.right.key) {
    snapshots.push({
      array: [...keysLeft],
      highlights: [],
      pointers: { unbalanced: node.key, child: node.right.key },
      tree: serializeTree(node),
      executingLine: 3,
      stats: { comparisons: snapshots.length, swaps: 0 },
      description: `Unbalanced height (${balance}) on node ${node.key} (Right-Left). Right-rotating child ${node.right.key}.`
    });
    node.right = rightRotate(node.right, snapshots, keysLeft, '[RL Child]');
    return leftRotate(node, snapshots, keysLeft, '[RL Root]');
  }

  return node;
}

// ── Red-Black Tree Insertion & Fixes ─────────────────────────────────────────

class RBTNode {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.color = 'red'; // New nodes are RED
  }
}

function insertRBT(root, key, snapshots, keysLeft) {
  const z = new RBTNode(key);
  let y = null;
  let x = root;

  while (x !== null) {
    y = x;
    if (z.key < x.key) {
      x = x.left;
    } else {
      x = x.right;
    }
  }

  z.parent = y;
  if (y === null) {
    root = z;
  } else if (z.key < y.key) {
    y.left = z;
  } else {
    y.right = z;
  }

  snapshots.push({
    array: [...keysLeft],
    highlights: [],
    pointers: { inserted: key },
    tree: serializeTree(root),
    executingLine: 2,
    stats: { comparisons: snapshots.length, swaps: 0 },
    description: `Inserted node ${key} colored RED.`
  });

  root = insertFixupRBT(root, z, snapshots, keysLeft);
  return root;
}

function insertFixupRBT(root, z, snapshots, keysLeft) {
  while (z.parent !== null && z.parent.color === 'red') {
    if (z.parent.parent !== null && z.parent === z.parent.parent.left) {
      const y = z.parent.parent.right; // Uncle
      
      // Case 1: Uncle is RED -> Recolor parent, uncle, and grandparent
      if (y !== null && y.color === 'red') {
        z.parent.color = 'black';
        y.color = 'black';
        z.parent.parent.color = 'red';
        
        snapshots.push({
          array: [...keysLeft],
          highlights: [],
          pointers: { node: z.key, parent: z.parent.key, grandparent: z.parent.parent.key },
          tree: serializeTree(root),
          executingLine: 5,
          stats: { comparisons: snapshots.length, swaps: 0 },
          description: `Uncle ${y.key} is RED. Recolor parent ${z.parent.key} and uncle to BLACK, grandparent ${z.parent.parent.key} to RED.`
        });
        
        z = z.parent.parent;
      } else {
        // Case 2: Node is right child -> Left rotate parent
        if (z === z.parent.right) {
          z = z.parent;
          root = leftRotateRBT(root, z);
          
          snapshots.push({
            array: [...keysLeft],
            highlights: [],
            pointers: { node: z.key },
            tree: serializeTree(root),
            executingLine: 4,
            stats: { comparisons: snapshots.length, swaps: 0 },
            description: `Uncle is BLACK. Node ${z.key} is right child. Left rotating parent.`
          });
        }
        
        // Case 3: Uncle is BLACK, node is left child -> Recolor and Right rotate grandparent
        if (z.parent !== null) {
          z.parent.color = 'black';
          if (z.parent.parent !== null) {
            z.parent.parent.color = 'red';
            
            snapshots.push({
              array: [...keysLeft],
              highlights: [],
              pointers: { grandparent: z.parent.parent.key },
              tree: serializeTree(root),
              executingLine: 5,
              stats: { comparisons: snapshots.length, swaps: 0 },
              description: `Recolored parent ${z.parent.key} to BLACK, grandparent ${z.parent.parent.key} to RED. Right rotating grandparent.`
            });
            
            root = rightRotateRBT(root, z.parent.parent);
          }
        }
      }
    } else {
      // Symmetric case (parent is right child of grandparent)
      const y = z.parent.parent ? z.parent.parent.left : null; // Uncle
      
      // Case 1: Uncle is RED -> Recolor
      if (y !== null && y.color === 'red') {
        z.parent.color = 'black';
        y.color = 'black';
        z.parent.parent.color = 'red';
        
        snapshots.push({
          array: [...keysLeft],
          highlights: [],
          pointers: { node: z.key, parent: z.parent.key, grandparent: z.parent.parent.key },
          tree: serializeTree(root),
          executingLine: 5,
          stats: { comparisons: snapshots.length, swaps: 0 },
          description: `Uncle ${y.key} is RED. Recolor parent ${z.parent.key} and uncle to BLACK, grandparent ${z.parent.parent.key} to RED.`
        });
        
        z = z.parent.parent;
      } else {
        // Case 2: Node is left child -> Right rotate parent
        if (z === z.parent.left) {
          z = z.parent;
          root = rightRotateRBT(root, z);
          
          snapshots.push({
            array: [...keysLeft],
            highlights: [],
            pointers: { node: z.key },
            tree: serializeTree(root),
            executingLine: 4,
            stats: { comparisons: snapshots.length, swaps: 0 },
            description: `Uncle is BLACK. Node ${z.key} is left child. Right rotating parent.`
          });
        }
        
        // Case 3: Uncle is BLACK, node is right child -> Recolor and Left rotate grandparent
        if (z.parent !== null) {
          z.parent.color = 'black';
          if (z.parent.parent !== null) {
            z.parent.parent.color = 'red';
            
            snapshots.push({
              array: [...keysLeft],
              highlights: [],
              pointers: { grandparent: z.parent.parent.key },
              tree: serializeTree(root),
              executingLine: 5,
              stats: { comparisons: snapshots.length, swaps: 0 },
              description: `Recolored parent ${z.parent.key} to BLACK, grandparent ${z.parent.parent.key} to RED. Left rotating grandparent.`
            });
            
            root = leftRotateRBT(root, z.parent.parent);
          }
        }
      }
    }
  }

  // Root must be black
  if (root.color !== 'black') {
    root.color = 'black';
    snapshots.push({
      array: [...keysLeft],
      highlights: [],
      pointers: { root: root.key },
      tree: serializeTree(root),
      executingLine: 5,
      stats: { comparisons: snapshots.length, swaps: 0 },
      description: `Set root node ${root.key} color to BLACK.`
    });
  }

  return root;
}

function leftRotateRBT(root, x) {
  const y = x.right;
  x.right = y.left;
  if (y.left !== null) {
    y.left.parent = x;
  }
  y.parent = x.parent;
  if (x.parent === null) {
    root = y;
  } else if (x === x.parent.left) {
    x.parent.left = y;
  } else {
    x.parent.right = y;
  }
  y.left = x;
  x.parent = y;
  return root;
}

function rightRotateRBT(root, y) {
  const x = y.left;
  y.left = x.right;
  if (x.right !== null) {
    x.right.parent = y;
  }
  x.parent = y.parent;
  if (y.parent === null) {
    root = x;
  } else if (y === y.parent.right) {
    y.parent.right = x;
  } else {
    y.parent.left = x;
  }
  x.right = y;
  y.parent = x;
  return root;
}

// ── Tree Serialization ───────────────────────────────────────────────────────

function serializeTree(node) {
  if (!node) return null;
  return {
    key: node.key,
    color: node.color || 'default',
    left: serializeTree(node.left),
    right: serializeTree(node.right)
  };
}
