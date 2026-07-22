// public/algorithms/quickSort.js

export const algorithm = {
  name: 'Quick Sort',
  category: 'Sorting',
  description:
    "Quick Sort is a divide-and-conquer algorithm. It selects a 'pivot' element and partitions the array such that elements smaller than the pivot are on the left, and larger elements are on the right. It recursively sorts the sub-arrays.",
  pseudocode: [
    'procedure quickSort(A, low, high):',
    '  if low < high then:',
    '    p = partition(A, low, high)',
    '    quickSort(A, low, p - 1)',
    '    quickSort(A, p + 1, high)',
    '',
    'procedure partition(A, low, high):',
    '  pivot = A[high]',
    '  i = low - 1',
    '  for j = low to high - 1 do:',
    '    if A[j] < pivot then:',
    '      i = i + 1',
    '      swap A[i] and A[j]',
  ],
  generator: function (arr) {
    const snapshots = [];
    const workingArr = [...arr];
    let comparisons = 0;
    let swaps = 0;

    const stats = () => ({
      comparisons: comparisons,
      swaps: swaps,
      complexity: { time: 'O(n log n)', space: 'O(log n)' },
    });

    const callStack = [];

    const makeSnapshot = (line, desc, highlights = [], pointers = {}) => {
      snapshots.push({
        array: [...workingArr],
        highlights: highlights,
        pointers: pointers,
        executingLine: line,
        stats: stats(),
        description: desc,
        callStack: [...callStack],
      });
    };

    makeSnapshot(0, 'Starting Quick Sort algorithm.');

    function runQuickSort(low, high) {
      const frameName = `quickSort(low: ${low}, high: ${high})`;
      callStack.push(frameName);

      if (low < high) {
        makeSnapshot(
          2,
          `Sub-array range [${low}, ${high}]. Partitioning array.`,
          [],
          { low, high },
        );
        const p = runPartition(low, high);

        makeSnapshot(
          3,
          `Partition index determined at index ${p}. Recursively sorting left sub-array [${low}, ${p - 1}].`,
          [],
          { pivot_index: p, low, high },
        );
        runQuickSort(low, p - 1);

        makeSnapshot(
          4,
          `Recursively sorting right sub-array [${p + 1}, ${high}].`,
          [],
          { pivot_index: p, low, high },
        );
        runQuickSort(p + 1, high);
      }

      callStack.pop();
    }

    function runPartition(low, high) {
      const pivot = workingArr[high];
      makeSnapshot(
        7,
        `Select A[${high}] = ${pivot} as the pivot element.`,
        [high],
        { pivot: high, low, high },
      );

      let i = low - 1;
      makeSnapshot(8, `Initialize boundary partition index i = ${i}.`, [], {
        pivot: high,
        i,
        low,
        high,
      });

      for (let j = low; j < high; j++) {
        comparisons++;
        makeSnapshot(
          10,
          `Compare A[${j}] = ${workingArr[j]} with pivot = ${pivot}.`,
          [j, high],
          { pivot: high, i, j, low, high },
        );

        if (workingArr[j] < pivot) {
          i++;
          swaps++;
          const temp = workingArr[i];
          workingArr[i] = workingArr[j];
          workingArr[j] = temp;
          makeSnapshot(
            12,
            `A[${j}] < pivot. Increment i to ${i} and swap A[${i}] and A[${j}].`,
            [i, j],
            { pivot: high, i, j, low, high },
          );
        }
      }

      swaps++;
      const temp = workingArr[i + 1];
      workingArr[i + 1] = workingArr[high];
      workingArr[high] = temp;
      makeSnapshot(
        13,
        `Swap pivot element A[${high}] with A[${i + 1}] to place pivot in its final sorted position.`,
        [i + 1, high],
        { pivot: i + 1, low, high },
      );

      return i + 1;
    }

    runQuickSort(0, workingArr.length - 1);

    makeSnapshot(0, 'Quick Sort complete! Array fully sorted.', [], {});
    return snapshots;
  },
};
