// public/algorithms/minMaxFinder.js

export const algorithm = {
  name: 'Min/Max Value Finder',
  category: 'Searching',
  description:
    'Locate the minimum and maximum values in an array by scanning elements sequentially and maintaining comparative trackers.',
  pseudocode: [
    'procedure findMinMax(A : list of items):',
    '  n = length(A)',
    '  min_val = A[0], max_val = A[0]',
    '  for i = 1 to n - 1 do:',
    '    if A[i] < min_val then min_val = A[i]',
    '    if A[i] > max_val then max_val = A[i]',
    '  return min_val, max_val',
  ],
  generator: function (arr) {
    const snapshots = [];
    const n = arr.length;

    let minVal = arr[0];
    let maxVal = arr[0];

    const stats = (comps = 0) => ({
      comparisons: comps,
      swaps: 0,
      complexity: { time: 'O(n)', space: 'O(1)' },
    });

    // Step 0: start procedure
    snapshots.push({
      array: [...arr],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(0),
      description: `Starting Min/Max Value Finder algorithm on array of size ${n}.`,
    });

    // Step 1: initialize min_val and max_val
    snapshots.push({
      array: [...arr],
      highlights: [0],
      pointers: { i: 0, min_val: minVal, max_val: maxVal },
      executingLine: 2,
      stats: stats(0),
      description: `Initialize min_val = ${minVal} and max_val = ${maxVal} with the first element A[0].`,
    });

    let comparisons = 0;

    for (let i = 1; i < n; i++) {
      // Loop check
      snapshots.push({
        array: [...arr],
        highlights: [i],
        pointers: { i: i, min_val: minVal, max_val: maxVal },
        executingLine: 3,
        stats: stats(comparisons),
        description: `Loop iteration i = ${i}. Compare A[${i}] = ${arr[i]} with current trackers.`,
      });

      // Compare for min
      comparisons++;
      const isNewMin = arr[i] < minVal;
      snapshots.push({
        array: [...arr],
        highlights: [i],
        pointers: { i: i, min_val: minVal, max_val: maxVal },
        executingLine: 4,
        stats: stats(comparisons),
        description: `Check if A[${i}] (${arr[i]}) < min_val (${minVal})? ${isNewMin ? 'Yes' : 'No'}.`,
      });

      if (isNewMin) {
        minVal = arr[i];
        snapshots.push({
          array: [...arr],
          highlights: [i],
          pointers: { i: i, min_val: minVal, max_val: maxVal },
          executingLine: 4,
          stats: stats(comparisons),
          description: `Update min_val to ${minVal}.`,
        });
      }

      // Compare for max
      comparisons++;
      const isNewMax = arr[i] > maxVal;
      snapshots.push({
        array: [...arr],
        highlights: [i],
        pointers: { i: i, min_val: minVal, max_val: maxVal },
        executingLine: 5,
        stats: stats(comparisons),
        description: `Check if A[${i}] (${arr[i]}) > max_val (${maxVal})? ${isNewMax ? 'Yes' : 'No'}.`,
      });

      if (isNewMax) {
        maxVal = arr[i];
        snapshots.push({
          array: [...arr],
          highlights: [i],
          pointers: { i: i, min_val: minVal, max_val: maxVal },
          executingLine: 5,
          stats: stats(comparisons),
          description: `Update max_val to ${maxVal}.`,
        });
      }
    }

    // Final result
    snapshots.push({
      array: [...arr],
      highlights: [],
      pointers: { min_val: minVal, max_val: maxVal },
      executingLine: 6,
      stats: stats(comparisons),
      description: `Algorithm complete. Minimum value is ${minVal}, Maximum value is ${maxVal}.`,
    });

    return snapshots;
  },
};
