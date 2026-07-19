// public/algorithms/insertionSort.js

export const algorithm = {
  name: "Insertion Sort",
  category: "Sorting",
  description: "Insertion Sort is a simple sorting algorithm that builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.",
  pseudocode: [
    "procedure insertionSort(A : list of sortable items)",
    "  n = length(A)",
    "  for i = 1 to n - 1 do",
    "    key = A[i]",
    "    j = i - 1",
    "    while j >= 0 and A[j] > key do",
    "      A[j + 1] = A[j]",
    "      j = j - 1",
    "    A[j + 1] = key"
  ],
  generator: function(arr) {
    const snapshots = [];
    const A = [...arr];
    const n = A.length;

    let comparisonCount = 0;
    let swapCount = 0; // In insertion sort, shifts can be counted as swaps/writes.

    const stats = () => ({
      comparisons: comparisonCount,
      swaps: swapCount,
      complexity: { time: "O(n²)", space: "O(1)" }
    });

    // Snapshot 0: Initial state (procedure insertionSort...)
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Starting Insertion Sort with array: [${A.join(', ')}]`
    });

    // Snapshot 1: n = length(A)
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 1,
      stats: stats(),
      description: `Set list length n = ${n}`
    });

    for (let i = 1; i < n; i++) {
      // Snapshot 2: for i = 1 to n - 1 do
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: { i: i },
        executingLine: 2,
        stats: stats(),
        description: `Set outer index i = ${i} (value: ${A[i]}).`
      });

      const key = A[i];
      // Snapshot 3: key = A[i]
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: { i: i, key: String(key) },
        executingLine: 3,
        stats: stats(),
        description: `Store current element A[${i}] (${key}) in key.`
      });

      let j = i - 1;
      // Snapshot 4: j = i - 1
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: { i: i, j: j, key: String(key) },
        executingLine: 4,
        stats: stats(),
        description: `Initialize inner index j = ${j} (value: ${A[j]}).`
      });

      while (j >= 0) {
        comparisonCount++;
        
        // Snapshot 5: while j >= 0 and A[j] > key do
        snapshots.push({
          array: [...A],
          highlights: [j],
          pointers: { i: i, j: j, key: String(key) },
          executingLine: 5,
          stats: stats(),
          description: `Compare: is j >= 0 and A[${j}] (${A[j]}) > key (${key})?`
        });

        if (A[j] > key) {
          A[j + 1] = A[j];
          swapCount++; // Shifting elements count as a write/swap operation

          // Snapshot 6: A[j + 1] = A[j]
          snapshots.push({
            array: [...A],
            highlights: [j, j + 1],
            pointers: { i: i, j: j, key: String(key) },
            executingLine: 6,
            stats: stats(),
            description: `Shift element at index ${j} (${A[j]}) to index ${j + 1}.`
          });

          j = j - 1;
          // Snapshot 7: j = j - 1
          snapshots.push({
            array: [...A],
            highlights: [],
            pointers: { i: i, j: j, key: String(key) },
            executingLine: 7,
            stats: stats(),
            description: `Decrement inner index j to ${j}.`
          });
        } else {
          break;
        }
      }

      // If loop exited because j < 0, we still count the comparison
      if (j < 0) {
        comparisonCount++;
        // Snapshot 5 alternate: j < 0
        snapshots.push({
          array: [...A],
          highlights: [],
          pointers: { i: i, key: String(key) },
          executingLine: 5,
          stats: stats(),
          description: `Loop condition false: j (${j}) is less than 0.`
        });
      } else {
        // Snapshot 5 alternate: A[j] <= key
        snapshots.push({
          array: [...A],
          highlights: [j],
          pointers: { i: i, j: j, key: String(key) },
          executingLine: 5,
          stats: stats(),
          description: `Loop condition false: A[${j}] (${A[j]}) is not greater than key (${key}).`
        });
      }

      A[j + 1] = key;
      swapCount++; // Write key back

      // Snapshot 8: A[j + 1] = key
      snapshots.push({
        array: [...A],
        highlights: [j + 1],
        pointers: { i: i, key: String(key) },
        executingLine: 8,
        stats: stats(),
        description: `Insert key (${key}) at index ${j + 1}.`
      });
    }

    // Final Snapshot: Done
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 8,
      stats: stats(),
      description: `Array is fully sorted! Final state: [${A.join(', ')}]`
    });

    return snapshots;
  }
};
