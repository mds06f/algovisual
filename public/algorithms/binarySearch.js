// public/algorithms/binarySearch.js

export const algorithm = {
  name: 'Binary Search',
  category: 'Searching',
  description:
    "Binary Search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.",
  pseudocode: [
    'procedure binarySearch(A : sorted list, target)',
    '  low = 0, high = length(A) - 1',
    '  while low <= high do',
    '    mid = floor((low + high) / 2)',
    '    if A[mid] == target then',
    '      return mid',
    '    else if A[mid] < target then',
    '      low = mid + 1',
    '    else',
    '      high = mid - 1',
    '  return -1',
  ],
  generator: function (arr, targetVal) {
    const snapshots = [];

    // Binary Search requires a sorted array
    const A = [...arr].sort((a, b) => a - b);
    const n = A.length;

    // Choose target. Default is 34.
    const target = targetVal !== undefined ? targetVal : 34;

    let comparisonCount = 0;
    const stats = () => ({
      comparisons: comparisonCount,
      swaps: 0,
      complexity: { time: 'O(log n)', space: 'O(1)' },
    });

    // Snapshot 0: Initial state
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Starting Binary Search for target = ${target} on sorted array: [${A.join(', ')}]`,
    });

    let low = 0;
    let high = n - 1;

    // Snapshot 1: low = 0, high = n - 1
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: { low: low, high: high },
      executingLine: 1,
      stats: stats(),
      description: `Initialize boundaries: low = ${low}, high = ${high}`,
    });

    let foundIndex = -1;

    while (low <= high) {
      comparisonCount++; // Count boundary comparison check: low <= high

      // Snapshot 2: while low <= high do
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: { low: low, high: high },
        executingLine: 2,
        stats: stats(),
        description: `Check condition: low (${low}) <= high (${high}) is true`,
      });

      const mid = Math.floor((low + high) / 2);

      // Snapshot 3: mid = floor((low + high) / 2)
      snapshots.push({
        array: [...A],
        highlights: [mid],
        pointers: { low: low, high: high, mid: mid },
        executingLine: 3,
        stats: stats(),
        description: `Calculate mid-point: mid = floor((${low} + ${high}) / 2) = ${mid}`,
      });

      comparisonCount++; // Count comparison: A[mid] === target

      // Snapshot 4: if A[mid] == target then
      snapshots.push({
        array: [...A],
        highlights: [mid],
        pointers: { low: low, high: high, mid: mid },
        executingLine: 4,
        stats: stats(),
        description: `Compare middle element A[${mid}] (${A[mid]}) with target (${target})`,
      });

      if (A[mid] === target) {
        foundIndex = mid;
        // Snapshot 5: return mid
        snapshots.push({
          array: [...A],
          highlights: [mid],
          pointers: { low: low, high: high, mid: mid },
          executingLine: 5,
          stats: stats(),
          description: `Found target ${target} at index ${mid}! Returning index ${mid}`,
        });
        break;
      } else {
        comparisonCount++; // Count comparison: A[mid] < target

        if (A[mid] < target) {
          // Snapshot 6: else if A[mid] < target then
          snapshots.push({
            array: [...A],
            highlights: [mid],
            pointers: { low: low, high: high, mid: mid },
            executingLine: 6,
            stats: stats(),
            description: `A[mid] (${A[mid]}) < target (${target}), search right half`,
          });

          low = mid + 1;
          // Snapshot 7: low = mid + 1
          snapshots.push({
            array: [...A],
            highlights: [],
            pointers: { low: low, high: high },
            executingLine: 7,
            stats: stats(),
            description: `Update lower boundary: low = mid + 1 = ${low}`,
          });
        } else {
          // Snapshot 8: else (conceptually A[mid] > target)
          snapshots.push({
            array: [...A],
            highlights: [mid],
            pointers: { low: low, high: high, mid: mid },
            executingLine: 8,
            stats: stats(),
            description: `A[mid] (${A[mid]}) > target (${target}), search left half`,
          });

          high = mid - 1;
          // Snapshot 9: high = mid - 1
          snapshots.push({
            array: [...A],
            highlights: [],
            pointers: { low: low, high: high },
            executingLine: 9,
            stats: stats(),
            description: `Update upper boundary: high = mid - 1 = ${high}`,
          });
        }
      }
    }

    if (foundIndex === -1) {
      comparisonCount++; // Count final boundary comparison check: low <= high (which fails)

      // Snapshot 2 alternate: low > high
      snapshots.push({
        array: [...A],
        snapshots: [],
        highlights: [],
        pointers: {},
        executingLine: 2,
        stats: stats(),
        description: `Check condition: low (${low}) <= high (${high}) is false`,
      });

      // Snapshot 10: return -1
      snapshots.push({
        array: [...A],
        snapshots: [],
        highlights: [],
        pointers: {},
        executingLine: 10,
        stats: stats(),
        description: `Target ${target} not found in the array. Returning -1`,
      });
    }

    return snapshots;
  },
};
