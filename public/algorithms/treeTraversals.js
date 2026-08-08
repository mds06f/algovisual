// public/algorithms/treeTraversals.js

export const algorithm = {
  name: 'Tree Traversals',
  category: 'Tree',
  description:
    'Visualizes three classic recursive depth-first traversals on a Binary Search Tree: Preorder (Node→Left→Right), Inorder (Left→Node→Right), and Postorder (Left→Right→Node).',
  pseudocode: [
    'procedure buildBST(arr):',
    '  for each key in arr: insert into BST',
    '',
    'procedure preorder(node):',
    '  if node is null, return',
    '  visit(node)            // Node first',
    '  preorder(node.left)',
    '  preorder(node.right)',
    '',
    'procedure inorder(node):',
    '  if node is null, return',
    '  inorder(node.left)',
    '  visit(node)            // Node in middle',
    '  inorder(node.right)',
    '',
    'procedure postorder(node):',
    '  if node is null, return',
    '  postorder(node.left)',
    '  postorder(node.right)',
    '  visit(node)            // Node last'
  ],

  generator: function (arr, target) {
    // target can be 'preorder', 'inorder', 'postorder' – default: all three
    const mode = target || 'all';
    const snapshots = [];
    let visitCount = 0;

    // ── BST helpers ────────────────────────────────────────────────────────────
    function makeNode(key) {
      return { key, color: 'default', left: null, right: null };
    }

    function insertBST(root, key) {
      if (!root) return makeNode(key);
      if (key < root.key) root.left = insertBST(root.left, key);
      else if (key > root.key) root.right = insertBST(root.right, key);
      return root;
    }

    function serializeTree(node) {
      if (!node) return null;
      return {
        key: node.key,
        color: node.color,
        left: serializeTree(node.left),
        right: serializeTree(node.right)
      };
    }

    function resetColors(node) {
      if (!node) return;
      node.color = 'default';
      resetColors(node.left);
      resetColors(node.right);
    }

    const stats = () => ({ comparisons: visitCount, swaps: 0, complexity: { time: 'O(N)', space: 'O(H)' } });

    // ── Build BST ──────────────────────────────────────────────────────────────
    let root = null;
    const limit = Math.min(arr.length, 12);
    for (let i = 0; i < limit; i++) root = insertBST(root, arr[i]);

    snapshots.push({
      tree: serializeTree(root),
      array: [],
      highlights: [],
      pointers: {},
      executingLine: 1,
      stats: stats(),
      description: `Built BST from array [${arr.slice(0, limit).join(', ')}]. Starting ${mode === 'all' ? 'Preorder' : mode.charAt(0).toUpperCase() + mode.slice(1)} traversal.`
    });

    // ── Preorder traversal ─────────────────────────────────────────────────────
    function doPreorder(node) {
      if (!node) return;
      visitCount++;
      node.color = 'red';
      snapshots.push({
        tree: serializeTree(root),
        array: [],
        highlights: [],
        pointers: { current: node.key },
        executingLine: 6,
        stats: stats(),
        description: `PREORDER – Visiting node ${node.key} (Node before children)`
      });
      doPreorder(node.left);
      doPreorder(node.right);
    }

    // ── Inorder traversal ──────────────────────────────────────────────────────
    function doInorder(node) {
      if (!node) return;
      doInorder(node.left);
      visitCount++;
      node.color = 'red';
      snapshots.push({
        tree: serializeTree(root),
        array: [],
        highlights: [],
        pointers: { current: node.key },
        executingLine: 13,
        stats: stats(),
        description: `INORDER – Visiting node ${node.key} (Left subtree already visited)`
      });
      doInorder(node.right);
    }

    // ── Postorder traversal ────────────────────────────────────────────────────
    function doPostorder(node) {
      if (!node) return;
      doPostorder(node.left);
      doPostorder(node.right);
      visitCount++;
      node.color = 'red';
      snapshots.push({
        tree: serializeTree(root),
        array: [],
        highlights: [],
        pointers: { current: node.key },
        executingLine: 20,
        stats: stats(),
        description: `POSTORDER – Visiting node ${node.key} (Both subtrees already visited)`
      });
    }

    // Run traversal(s) based on mode
    if (mode === 'preorder' || mode === 'all') {
      snapshots.push({
        tree: serializeTree(root),
        array: [], highlights: [], pointers: {},
        executingLine: 4,
        stats: stats(),
        description: '── Starting PREORDER Traversal (Node → Left → Right) ──'
      });
      doPreorder(root);
      resetColors(root);
      snapshots.push({
        tree: serializeTree(root),
        array: [], highlights: [], pointers: {},
        executingLine: 4,
        stats: stats(),
        description: 'Preorder traversal complete. Tree reset for next traversal.'
      });
    }

    if (mode === 'inorder' || mode === 'all') {
      snapshots.push({
        tree: serializeTree(root),
        array: [], highlights: [], pointers: {},
        executingLine: 10,
        stats: stats(),
        description: '── Starting INORDER Traversal (Left → Node → Right) – produces sorted sequence ──'
      });
      doInorder(root);
      resetColors(root);
      snapshots.push({
        tree: serializeTree(root),
        array: [], highlights: [], pointers: {},
        executingLine: 10,
        stats: stats(),
        description: 'Inorder traversal complete. Tree reset for Postorder.'
      });
    }

    if (mode === 'postorder' || mode === 'all') {
      snapshots.push({
        tree: serializeTree(root),
        array: [], highlights: [], pointers: {},
        executingLine: 16,
        stats: stats(),
        description: '── Starting POSTORDER Traversal (Left → Right → Node) ──'
      });
      doPostorder(root);
      resetColors(root);
      snapshots.push({
        tree: serializeTree(root),
        array: [], highlights: [], pointers: {},
        executingLine: 16,
        stats: stats(),
        description: 'All traversals complete! Each strategy visited all N nodes in O(N) time.'
      });
    }

    return snapshots;
  }
};
