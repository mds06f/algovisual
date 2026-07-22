// public/algorithms/bubbleSort.js

export const algorithm = {
  name: 'Bubble Sort',
  category: 'Sorting',
  description:
    'Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
  pseudocode: [
    'procedure bubbleSort(A : list of sortable items)',
    '  n = length(A)',
    '  repeat',
    '    swapped = false',
    '    for i = 1 to n - 1 inclusive do',
    '      if A[i-1] > A[i] then',
    '        swap(A[i-1], A[i])',
    '        swapped = true',
    '  until not swapped',
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
      complexity: { time: 'O(n²)', space: 'O(1)' },
    });

    // Snapshot 0: Initial state (procedure bubbleSort...)
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Starting Bubble Sort with array: [${A.join(', ')}]`,
    });

    // Snapshot 1: n = length(A)
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 1,
      stats: stats(),
      description: `Set list length n = ${n}`,
    });

    let swapped;
    let pass = 0;

    do {
      pass++;
      // Snapshot 2: repeat
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: {},
        executingLine: 2,
        stats: stats(),
        description: `Pass ${pass}: Beginning sorting pass loop`,
      });

      swapped = false;
      // Snapshot 3: swapped = false
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: {},
        executingLine: 3,
        stats: stats(),
        description: `Set swapped = false. Scanning adjacent elements...`,
      });

      for (let i = 1; i < n; i++) {
        // Snapshot 4: for i = 1 to n - 1 inclusive do
        snapshots.push({
          array: [...A],
          highlights: [],
          pointers: { i: i },
          executingLine: 4,
          stats: stats(),
          description: `Loop index i = ${i}. Comparing elements at ${i - 1} and ${i}`,
        });

        // The comparison occurs next
        comparisonCount++;

        // Snapshot 5: if A[i-1] > A[i] then
        snapshots.push({
          array: [...A],
          highlights: [i - 1, i],
          pointers: { i: i },
          executingLine: 5,
          stats: stats(),
          description: `Compare: is A[${i - 1}] (${A[i - 1]}) > A[${i}] (${A[i]})?`,
        });

        if (A[i - 1] > A[i]) {
          // Swap
          const temp = A[i - 1];
          A[i - 1] = A[i];
          A[i] = temp;
          swapped = true;
          swapCount++;

          // Snapshot 6: swap(A[i-1], A[i])
          snapshots.push({
            array: [...A],
            highlights: [i - 1, i],
            pointers: { i: i },
            executingLine: 6,
            stats: stats(),
            description: `Swap elements at index ${i - 1} and ${i} (${A[i]} and ${A[i - 1]})`,
          });

          // Snapshot 7: swapped = true
          snapshots.push({
            array: [...A],
            highlights: [i - 1, i],
            pointers: { i: i },
            executingLine: 7,
            stats: stats(),
            description: `Mark swapped = true since a swap occurred`,
          });
        } else {
          // Snapshot 5 alternate: no swap
          snapshots.push({
            array: [...A],
            highlights: [i - 1, i],
            pointers: { i: i },
            executingLine: 5,
            stats: stats(),
            description: `No swap needed: A[${i - 1}] (${A[i - 1]}) is not greater than A[${i}] (${A[i]})`,
          });
        }
      }

      // Snapshot 8: until not swapped (check)
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: {},
        executingLine: 8,
        stats: stats(),
        description: `Completed pass ${pass}. Swapped status is ${swapped}`,
      });
    } while (swapped);

    // Final Snapshot: Done
    snapshots.push({
      array: [...A],
      snapshots: [],
      highlights: [],
      pointers: {},
      executingLine: 8,
      stats: stats(),
      description: `Array is fully sorted! Final state: [${A.join(', ')}]`,
    });

    return snapshots;
  },
};
