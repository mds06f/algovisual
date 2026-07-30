// public/algorithms/matrixOps.js

export const algorithm = {
  name: 'Matrix Operations',
  category: 'Matrix',
  description:
    '2D Matrix array visualizer demonstrating 90-degree clockwise grid rotation and matrix transposition step-by-step.',
  pseudocode: [
    'procedure rotateMatrix(M : n x n matrix)',
    '  transpose matrix M[i][j] <-> M[j][i]',
    '  reverse each row in transposed matrix',
    '  render transformed 2D grid matrix',
  ],
  generator: function () {
    const snapshots = [];
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const n = matrix.length;

    let opCount = 0;
    const stats = () => ({
      comparisons: opCount,
      swaps: opCount,
      complexity: { time: 'O(n²)', space: 'O(1)' },
    });

    // Initial snapshot
    snapshots.push({
      array: matrix.flat(),
      highlights: [],
      pointers: { n },
      executingLine: 0,
      stats: stats(),
      description: 'Initial 3x3 2D Matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]',
    });

    // Step 1: Transpose matrix
    const M = matrix.map((row) => [...row]);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const temp = M[i][j];
        M[i][j] = M[j][i];
        M[j][i] = temp;
        opCount++;
        snapshots.push({
          array: M.flat(),
          highlights: [i * n + j, j * n + i],
          pointers: { i, j },
          executingLine: 1,
          stats: stats(),
          description: `Transposed cell M[${i}][${j}] (${temp}) with M[${j}][${i}]`,
        });
      }
    }

    // Step 2: Reverse rows for 90 deg rotation
    for (let i = 0; i < n; i++) {
      M[i].reverse();
      opCount++;
      snapshots.push({
        array: M.flat(),
        highlights: [i * n, i * n + n - 1],
        pointers: { row: i },
        executingLine: 2,
        stats: stats(),
        description: `Reversed row ${i} to complete 90° clockwise matrix rotation`,
      });
    }

    // Final snapshot
    snapshots.push({
      array: M.flat(),
      highlights: [],
      pointers: {},
      executingLine: 3,
      stats: stats(),
      description: 'Matrix 90° rotation complete!',
    });

    return snapshots;
  },
};
