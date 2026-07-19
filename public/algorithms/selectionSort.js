// public/algorithms/selectionSort.js

export const algorithm = {
  name: "Selection Sort",
  category: "Sorting",
  description: "Selection Sort is a simple comparison-based sorting algorithm. It divides the input list into two parts: a sorted sublist of items which is built up from left to right, and an unsorted sublist. The algorithm repeatedly finds the minimum element from the unsorted sublist and swaps it with the leftmost unsorted element.",
  pseudocode: [
    "procedure selectionSort(A : list of sortable items)",
    "  n = length(A)",
    "  for i = 0 to n - 2 do",
    "    min_idx = i",
    "    for j = i + 1 to n - 1 do",
    "      if A[j] < A[min_idx] then",
    "        min_idx = j",
    "    if min_idx != i then",
    "      swap(A[i], A[min_idx])"
  ],
  generator: function(arr) {
    const snapshots = [];
    const A = [...arr];
    const n = A.length;

    let comparisonCount = 0;
    let swapCount = 0;

    const stats = () => ({
      comparisons: comparisonCount,
      swaps: swapCount,
      complexity: { time: "O(n²)", space: "O(1)" }
    });

    // Snapshot 0: Initial state (procedure selectionSort...)
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Starting Selection Sort with array: [${A.join(', ')}]`
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

    for (let i = 0; i < n - 1; i++) {
      // Snapshot 2: for i = 0 to n - 2 do
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: { i: i },
        executingLine: 2,
        stats: stats(),
        description: `Set boundary index i = ${i}. Unsorted sublist starts at ${i}.`
      });

      let min_idx = i;
      // Snapshot 3: min_idx = i
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: { i: i, min_idx: min_idx },
        executingLine: 3,
        stats: stats(),
        description: `Initialize min_idx = ${i}. Current minimum is A[${i}] (${A[i]}).`
      });

      for (let j = i + 1; j < n; j++) {
        // Snapshot 4: for j = i + 1 to n - 1 do
        snapshots.push({
          array: [...A],
          highlights: [],
          pointers: { i: i, min_idx: min_idx, j: j },
          executingLine: 4,
          stats: stats(),
          description: `Inner loop: scan element at index j = ${j} (value: ${A[j]})`
        });

        comparisonCount++;

        // Snapshot 5: if A[j] < A[min_idx] then
        snapshots.push({
          array: [...A],
          highlights: [j, min_idx],
          pointers: { i: i, min_idx: min_idx, j: j },
          executingLine: 5,
          stats: stats(),
          description: `Compare: is A[${j}] (${A[j]}) < A[min_idx] (${A[min_idx]})?`
        });

        if (A[j] < A[min_idx]) {
          min_idx = j;
          // Snapshot 6: min_idx = j
          snapshots.push({
            array: [...A],
            highlights: [min_idx],
            pointers: { i: i, min_idx: min_idx, j: j },
            executingLine: 6,
            stats: stats(),
            description: `Found smaller element! Update min_idx = ${min_idx} (value: ${A[min_idx]})`
          });
        } else {
          // Snapshot 5 alternate: no min_idx update
          snapshots.push({
            array: [...A],
            highlights: [j, min_idx],
            pointers: { i: i, min_idx: min_idx, j: j },
            executingLine: 5,
            stats: stats(),
            description: `No update needed: A[${j}] (${A[j]}) is not less than A[min_idx] (${A[min_idx]})`
          });
        }
      }

      // Snapshot 7: if min_idx != i then
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: { i: i, min_idx: min_idx },
        executingLine: 7,
        stats: stats(),
        description: `Check condition: is min_idx (${min_idx}) != i (${i})?`
      });

      if (min_idx !== i) {
        // Swap A[i] and A[min_idx]
        const temp = A[i];
        A[i] = A[min_idx];
        A[min_idx] = temp;
        swapCount++;

        // Snapshot 8: swap(A[i], A[min_idx])
        snapshots.push({
          array: [...A],
          highlights: [i, min_idx],
          pointers: { i: i, min_idx: min_idx },
          executingLine: 8,
          stats: stats(),
          description: `Swap elements at index ${i} and ${min_idx} (${A[min_idx]} and ${A[i]})`
        });
      } else {
        // Snapshot 7 alternate: no swap needed
        snapshots.push({
          array: [...A],
          highlights: [],
          pointers: { i: i, min_idx: min_idx },
          executingLine: 7,
          stats: stats(),
          description: `No swap needed: min_idx matches boundary index i (${i}).`
        });
      }
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
