// public/algorithms/countingSort.js

export const algorithm = {
  name: 'Counting Sort',
  category: 'Sorting',
  description:
    'Counting Sort is a non-comparison sorting algorithm suitable for non-negative integers. It counts the number of occurrences of each distinct element, computes cumulative frequency prefixes, and places each element into its sorted output position.',
  pseudocode: [
    'procedure countingSort(A : list of non-negative integers)',
    '  find max element k in A',
    '  create count array C of size k + 1 initialized to 0',
    '  for each element x in A do C[x] = C[x] + 1',
    '  for i = 1 to k do C[i] = C[i] + C[i - 1]',
    '  build output array B from A using cumulative counts',
    '  copy output array B back to A',
  ],
  generator: function (arr) {
    const snapshots = [];
    const A = [...arr];
    const n = A.length;

    let comparisonCount = 0;
    let swapCount = 0;

    const stats = () => ({
      comparisons: comparisonCount,
      swaps: swapCount,
      complexity: { time: 'O(n + k)', space: 'O(n + k)' },
    });

    // Initial snapshot
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Starting Counting Sort on array: [${A.join(', ')}]`,
    });

    // Step 1: Find max element k
    let maxVal = A[0] || 0;
    for (let i = 1; i < n; i++) {
      comparisonCount++;
      if (A[i] > maxVal) {
        maxVal = A[i];
      }
    }
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 1,
      stats: stats(),
      description: `Identified maximum element k = ${maxVal}`,
    });

    // Step 2: Create count array C
    const count = new Array(maxVal + 1).fill(0);
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 2,
      stats: stats(),
      description: `Created frequency count array C of size ${maxVal + 1}`,
    });

    // Step 3: Count occurrences
    for (let i = 0; i < n; i++) {
      const val = A[i];
      count[val]++;
      swapCount++;
      snapshots.push({
        array: [...A],
        highlights: [i],
        pointers: { i },
        executingLine: 3,
        stats: stats(),
        description: `Count element A[${i}] = ${val}. Frequency of ${val} is now ${count[val]}`,
      });
    }

    // Step 4: Cumulative sums
    for (let i = 1; i <= maxVal; i++) {
      count[i] += count[i - 1];
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: {},
        executingLine: 4,
        stats: stats(),
        description: `Cumulative count for ${i}: ${count[i]} elements <= ${i}`,
      });
    }

    // Step 5: Build output array B
    const output = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      const val = A[i];
      output[count[val] - 1] = val;
      count[val]--;
      swapCount++;
      snapshots.push({
        array: [...output.map((x) => (x === undefined ? 0 : x))],
        highlights: [count[val]],
        pointers: { i },
        executingLine: 5,
        stats: stats(),
        description: `Place element ${val} into output array position ${count[val]}`,
      });
    }

    // Step 6: Copy back to A
    for (let i = 0; i < n; i++) {
      A[i] = output[i];
      swapCount++;
      snapshots.push({
        array: [...A],
        highlights: [i],
        pointers: { i },
        executingLine: 6,
        stats: stats(),
        description: `Copy output position ${i} (value ${A[i]}) back to main array`,
      });
    }

    // Final completion snapshot
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 6,
      stats: stats(),
      description: `Counting Sort complete! Final sorted array: [${A.join(', ')}]`,
    });

    return snapshots;
  },
};
