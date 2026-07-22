// public/algorithms/linearSearch.js

export const algorithm = {
  name: 'Linear Search',
  category: 'Searching',
  description:
    'Linear Search is a simple search algorithm that checks every element in the list sequentially until the target value is found or the list ends.',
  pseudocode: [
    'procedure linearSearch(A : list of items, target)',
    '  n = length(A)',
    '  for i = 0 to n - 1 do',
    '    if A[i] == target then',
    '      return i',
    '  return -1',
  ],
  generator: function (arr, targetVal) {
    const snapshots = [];
    const A = [...arr];
    const n = A.length;
    const target = targetVal !== undefined ? targetVal : 34;

    let comparisonCount = 0;
    const stats = () => ({
      comparisons: comparisonCount,
      swaps: 0,
      complexity: { time: 'O(n)', space: 'O(1)' },
    });

    // Snapshot 0: Initial state (procedure linearSearch...)
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Starting Linear Search for target = ${target} on array: [${A.join(', ')}]`,
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

    let foundIndex = -1;

    for (let i = 0; i < n; i++) {
      // Snapshot 2: for i = 0 to n - 1 do
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: { i: i },
        executingLine: 2,
        stats: stats(),
        description: `Loop index i = ${i}. Scanning element at index ${i} (value: ${A[i]}).`,
      });

      comparisonCount++;

      // Snapshot 3: if A[i] == target then
      snapshots.push({
        array: [...A],
        highlights: [i],
        pointers: { i: i },
        executingLine: 3,
        stats: stats(),
        description: `Compare: is A[${i}] (${A[i]}) == target (${target})?`,
      });

      if (A[i] === target) {
        foundIndex = i;
        // Snapshot 4: return i
        snapshots.push({
          array: [...A],
          highlights: [i],
          pointers: { i: i },
          executingLine: 4,
          stats: stats(),
          description: `Found target ${target} at index ${i}! Returning index ${i}.`,
        });
        break;
      }
    }

    if (foundIndex === -1) {
      // Snapshot 5: return -1
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: {},
        executingLine: 5,
        stats: stats(),
        description: `Target ${target} not found in array. Returning -1.`,
      });
    }

    return snapshots;
  },
};
