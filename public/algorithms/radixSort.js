// public/algorithms/radixSort.js

export const algorithm = {
  name: 'Radix Sort',
  category: 'Sorting',
  description: 'Radix Sort is a non-comparative sorting algorithm. It avoids comparison by creating and distributing elements into buckets according to their radix/digits.',
  pseudocode: [
    'procedure radixSort(A : list of positive integers)',
    '  maxVal = getMaximum(A)',
    '  for exp = 1; maxVal / exp > 0; exp *= 10 do',
    '    initialize 10 empty digit buckets',
    '    distribute elements of A into buckets by digit',
    '    collect elements back from buckets into A'
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
      complexity: { time: 'O(nk)', space: 'O(n+k)' }
    });

    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Starting Radix Sort with input array: [${A.join(', ')}]`
    });

    const maxVal = Math.max(...A, 0);
    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 1,
      stats: stats(),
      description: `Find maximum value: ${maxVal}`
    });

    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: {},
        executingLine: 2,
        stats: stats(),
        description: `Sorting digit place exp = ${exp} (1s, 10s, 100s...)`
      });

      // Init empty buckets
      const buckets = Array.from({ length: 10 }, () => []);
      snapshots.push({
        array: [...A],
        highlights: [],
        pointers: {},
        executingLine: 3,
        stats: stats(),
        buckets: buckets.map(b => [...b]),
        description: `Initialize 10 empty digit buckets (0 to 9)`
      });

      // Distribute
      for (let i = 0; i < n; i++) {
        const digit = Math.floor(A[i] / exp) % 10;
        buckets[digit].push(A[i]);
        comparisonCount++; // Counting digit placements

        snapshots.push({
          array: [...A],
          highlights: [i],
          pointers: { i: i },
          executingLine: 4,
          stats: stats(),
          buckets: buckets.map(b => [...b]),
          description: `Element A[${i}] (${A[i]}) placed in digit bucket ${digit}`
        });
      }

      // Collect
      let idx = 0;
      for (let d = 0; d < 10; d++) {
        while (buckets[d].length > 0) {
          const val = buckets[d].shift();
          A[idx] = val;
          swapCount++; // Count assignments

          snapshots.push({
            array: [...A],
            highlights: [idx],
            pointers: { write: idx },
            executingLine: 5,
            stats: stats(),
            buckets: buckets.map(b => [...b]),
            description: `Collect ${val} from bucket ${d} and write to array index ${idx}`
          });
          idx++;
        }
      }
    }

    snapshots.push({
      array: [...A],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Radix Sort complete! Sorted array: [${A.join(', ')}]`
    });

    return snapshots;
  }
};
