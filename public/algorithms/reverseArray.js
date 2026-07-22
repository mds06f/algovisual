// public/algorithms/reverseArray.js

export const algorithm = {
  name: 'Array Reversing',
  category: 'Searching',
  description:
    'Reverse the elements of an array in-place by maintaining left and right boundary pointers and swapping their values as they approach the center.',
  pseudocode: [
    'procedure reverseArray(A : list of items):',
    '  left = 0',
    '  right = length(A) - 1',
    '  while left < right do:',
    '    swap A[left] and A[right]',
    '    left = left + 1',
    '    right = right - 1',
  ],
  generator: function (arr) {
    const snapshots = [];
    const n = arr.length;
    const workingArr = [...arr];

    let left = 0;
    let right = n - 1;
    let swapCount = 0;

    const stats = (swaps = 0) => ({
      comparisons: 0,
      swaps: swaps,
      complexity: { time: 'O(n)', space: 'O(1)' },
    });

    // Step 0: Initial state
    snapshots.push({
      array: [...workingArr],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(0),
      description: `Starting array reversing. Array size = ${n}.`,
    });

    // Step 1: Initialize left = 0 and right = n - 1
    snapshots.push({
      array: [...workingArr],
      highlights: [left, right],
      pointers: { left: left, right: right },
      executingLine: 2,
      stats: stats(0),
      description: `Initialize left boundary pointer to index 0, and right boundary pointer to index ${right}.`,
    });

    while (left < right) {
      // Step 3: Loop condition check (while left < right)
      snapshots.push({
        array: [...workingArr],
        highlights: [left, right],
        pointers: { left: left, right: right },
        executingLine: 3,
        stats: stats(swapCount),
        description: `Check condition left (${left}) < right (${right})? Yes. Continue loop.`,
      });

      // Step 4: Swap elements
      const temp = workingArr[left];
      workingArr[left] = workingArr[right];
      workingArr[right] = temp;
      swapCount++;

      snapshots.push({
        array: [...workingArr],
        highlights: [left, right],
        pointers: { left: left, right: right },
        executingLine: 4,
        stats: stats(swapCount),
        description: `Swap element at left (${workingArr[right]}) and right (${workingArr[left]}).`,
      });

      // Step 5: left = left + 1
      left++;
      snapshots.push({
        array: [...workingArr],
        highlights: [left, right],
        pointers: { left: left, right: right },
        executingLine: 5,
        stats: stats(swapCount),
        description: `Increment left pointer to index ${left}.`,
      });

      // Step 6: right = right - 1
      right--;
      snapshots.push({
        array: [...workingArr],
        highlights: [left, right],
        pointers: { left: left, right: right },
        executingLine: 6,
        stats: stats(swapCount),
        description: `Decrement right pointer to index ${right}.`,
      });
    }

    // Step 3 (failure): Loop exits
    snapshots.push({
      array: [...workingArr],
      highlights: [],
      pointers: {},
      executingLine: 3,
      stats: stats(swapCount),
      description: `Check condition left (${left}) < right (${right})? No. Reversing complete.`,
    });

    return snapshots;
  },
};
