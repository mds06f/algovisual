export const algorithm = {
  name: "Fibonacci Sequence",
  category: "Searching",
  description: "Generate the Fibonacci sequence up to N elements sequentially, where each number is the sum of the preceding two.",
  pseudocode: [
    "procedure fibonacci(n):",
    "  F = array of size n",
    "  F[0] = 1",
    "  F[1] = 1",
    "  for i = 2 to n - 1 do:",
    "    F[i] = F[i-1] + F[i-2]",
    "  return F"
  ],
  generator: function(arr) {
    const snapshots = [];
    const n = arr.length;
    const workingArr = Array(n).fill(0);

    const stats = () => ({
      comparisons: 0,
      swaps: 0,
      complexity: { time: "O(n)", space: "O(n)" }
    });

    // Step 0: Initial state
    snapshots.push({
      array: [...workingArr],
      highlights: [],
      pointers: {},
      executingLine: 0,
      stats: stats(),
      description: `Initialize Fibonacci calculation for sequence of length n = ${n}.`
    });

    // Step 1: Create array of size n
    snapshots.push({
      array: [...workingArr],
      highlights: [],
      pointers: {},
      executingLine: 1,
      stats: stats(),
      description: `Create workspace array F of size ${n}.`
    });

    if (n > 0) {
      workingArr[0] = 1;
      // Step 2: F[0] = 1
      snapshots.push({
        array: [...workingArr],
        highlights: [0],
        pointers: { F0: 0 },
        executingLine: 2,
        stats: stats(),
        description: `Set first Fibonacci number: F[0] = 1.`
      });
    }

    if (n > 1) {
      workingArr[1] = 1;
      // Step 3: F[1] = 1
      snapshots.push({
        array: [...workingArr],
        highlights: [1],
        pointers: { F1: 1 },
        executingLine: 3,
        stats: stats(),
        description: `Set second Fibonacci number: F[1] = 1.`
      });
    }

    for (let i = 2; i < n; i++) {
      // Step 4: Loop iteration check
      snapshots.push({
        array: [...workingArr],
        highlights: [i-2, i-1],
        pointers: { prev2: i-2, prev1: i-1, i: i },
        executingLine: 4,
        stats: stats(),
        description: `Loop index i = ${i}. Prepare to add previous two values.`
      });

      workingArr[i] = workingArr[i-1] + workingArr[i-2];

      // Step 5: F[i] = F[i-1] + F[i-2]
      snapshots.push({
        array: [...workingArr],
        highlights: [i-2, i-1, i],
        pointers: { prev2: i-2, prev1: i-1, i: i },
        executingLine: 5,
        stats: stats(),
        description: `Compute F[${i}] = F[${i-1}] (${workingArr[i-1]}) + F[${i-2}] (${workingArr[i-2]}) = ${workingArr[i]}.`
      });
    }

    // Step 6: Return F
    snapshots.push({
      array: [...workingArr],
      highlights: [],
      pointers: {},
      executingLine: 6,
      stats: stats(),
      description: `Computation complete. Generated Fibonacci sequence: [${workingArr.join(', ')}].`
    });

    return snapshots;
  }
};
