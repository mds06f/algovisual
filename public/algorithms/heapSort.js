// public/algorithms/heapSort.js

export const algorithm = {
  name: 'Heap Sort',
  category: 'Sorting',
  description:
    'Heap Sort converts the array into a Max-Heap binary tree data structure, continuously extracting the maximum element from the root to build the sorted array.',
  pseudocode: [
    'procedure HeapSort(A : list of items):',
    '  buildMaxHeap(A)',
    '  for i = length(A)-1 down to 1 do:',
    '    swap(A[0], A[i])',
    '    heapSize = heapSize - 1',
    '    maxHeapify(A, 0, heapSize)',
    '',
    'procedure maxHeapify(A, i, heapSize):',
    '  largest = i, left = 2*i + 1, right = 2*i + 2',
    '  if left < heapSize and A[left] > A[largest] then largest = left',
    '  if right < heapSize and A[right] > A[largest] then largest = right',
    '  if largest != i then',
    '    swap(A[i], A[largest])',
    '    maxHeapify(A, largest, heapSize)',
  ],
  generator: function (arr) {
    const a = [...arr];
    const n = a.length;
    const snapshots = [];

    let comparisonCount = 0;
    let swapCount = 0;

    const stats = () => ({
      comparisons: comparisonCount,
      swaps: swapCount,
      complexity: { time: 'O(n log n)', space: 'O(1)' },
    });

    snapshots.push({
      array: [...a],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: 'Initial array state before Max-Heap construction.',
    });

    function maxHeapify(heapSize, i) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      comparisonCount++;
      if (left < heapSize && a[left] > a[largest]) {
        largest = left;
      }

      comparisonCount++;
      if (right < heapSize && a[right] > a[largest]) {
        largest = right;
      }

      snapshots.push({
        array: [...a],
        highlights: [i, left < heapSize ? left : i, right < heapSize ? right : i].filter((v, idx, s) => s.indexOf(v) === idx),
        pointers: { root: i, largest },
        executingLine: 8,
        stats: stats(),
        description: `Max-heapify node index ${i} (value ${a[i]}). Heap size: ${heapSize}.`,
      });

      if (largest !== i) {
        swapCount++;
        const temp = a[i];
        a[i] = a[largest];
        a[largest] = temp;

        snapshots.push({
          array: [...a],
          highlights: [i, largest],
          pointers: { swapped: largest },
          executingLine: 12,
          stats: stats(),
          description: `Swapped parent index ${i} (${a[largest]}) with child index ${largest} (${a[i]}).`,
        });

        maxHeapify(heapSize, largest);
      }
    }

    // Build max heap (rearrange array)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      maxHeapify(n, i);
    }

    snapshots.push({
      array: [...a],
      highlights: [],
      pointers: {},
      executingLine: 1,
      stats: stats(),
      description: 'Max-Heap construction complete. Root contains maximum element.',
    });

    // One by one extract an element from heap
    for (let i = n - 1; i > 0; i--) {
      swapCount++;
      const temp = a[0];
      a[0] = a[i];
      a[i] = temp;

      snapshots.push({
        array: [...a],
        highlights: [0, i],
        pointers: { extracted: i },
        executingLine: 3,
        stats: stats(),
        description: `Swapped max element ${temp} from root to sorted position ${i}.`,
      });

      maxHeapify(i, 0);
    }

    snapshots.push({
      array: [...a],
      highlights: Array.from({ length: n }, (_, k) => k),
      pointers: {},
      executingLine: 5,
      stats: stats(),
      description: `Heap Sort completed successfully. Total comparisons: ${comparisonCount}, total swaps: ${swapCount}.`,
    });

    return snapshots;
  },
};
