// public/algorithms/mergeSort.js

export const algorithm = {
  name: "Merge Sort",
  category: "Sorting",
  description: "Merge Sort is a divide-and-conquer algorithm. It recursively splits the array into two halves, sorts each half, then merges them back together in order. An auxiliary canvas beneath the main view shows the active sub-array segments.",
  pseudocode: [
    "procedure mergeSort(A):",
    "  if length(A) > 1 then:",
    "    mid = length(A) / 2",
    "    L = A[0 .. mid-1]",
    "    R = A[mid .. end]",
    "    mergeSort(L)",
    "    mergeSort(R)",
    "    merge(A, L, R)",
    "",
    "procedure merge(A, L, R):",
    "  i = 0, j = 0, k = 0",
    "  while i < len(L) and j < len(R):",
    "    if L[i] <= R[j]: A[k++] = L[i++]",
    "    else:            A[k++] = R[j++]",
    "  copy remaining L or R into A"
  ],
  generator: function(arr) {
    const snapshots = [];
    const workingArr = [...arr];
    let comparisons = 0;
    let swaps = 0;

    const stats = () => ({ comparisons, swaps, complexity: { time: "O(n log n)", space: "O(n)" } });
    const callStack = [];

    const snap = (line, desc, highlights = [], auxLeft = null, auxRight = null, leftStart = -1) => {
      snapshots.push({
        array: [...workingArr],
        highlights,
        pointers: {},
        executingLine: line,
        stats: stats(),
        description: desc,
        callStack: [...callStack],
        // auxiliary sub-array data for the split canvas
        auxLeft: auxLeft ? [...auxLeft] : null,
        auxRight: auxRight ? [...auxRight] : null,
        auxLeftStart: leftStart
      });
    };

    snap(0, `Starting Merge Sort on array of size ${arr.length}.`);

    function mergeSort(start, end) {
      const frameName = `mergeSort(start: ${start}, end: ${end})`;
      callStack.push(frameName);

      if (end - start < 1) {
        callStack.pop();
        return;
      }

      const mid = Math.floor((start + end) / 2);
      const segment = workingArr.slice(start, end + 1);
      snap(1, `Splitting segment at indices [${start}..${end}] into [${start}..${mid}] and [${mid+1}..${end}].`,
        Array.from({ length: end - start + 1 }, (_, i) => start + i),
        workingArr.slice(start, mid + 1),
        workingArr.slice(mid + 1, end + 1),
        start
      );

      mergeSort(start, mid);
      mergeSort(mid + 1, end);

      // Merge phase
      const L = workingArr.slice(start, mid + 1);
      const R = workingArr.slice(mid + 1, end + 1);

      snap(9, `Merging sub-arrays [${start}..${mid}] and [${mid+1}..${end}].`,
        Array.from({ length: end - start + 1 }, (_, i) => start + i),
        [...L], [...R], start
      );

      let i = 0, j = 0, k = start;
      while (i < L.length && j < R.length) {
        comparisons++;
        snap(11, `Compare L[${i}]=${L[i]} with R[${j}]=${R[j]}.`,
          [k],
          [...L], [...R], start
        );

        if (L[i] <= R[j]) {
          workingArr[k] = L[i];
          snap(12, `L[${i}]=${L[i]} ≤ R[${j}]=${R[j]}. Place ${L[i]} at index ${k}.`,
            [k],
            [...L], [...R], start
          );
          i++; k++;
        } else {
          workingArr[k] = R[j];
          swaps++;
          snap(13, `L[${i}]=${L[i]} > R[${j}]=${R[j]}. Place ${R[j]} at index ${k}.`,
            [k],
            [...L], [...R], start
          );
          j++; k++;
        }
      }
      while (i < L.length) {
        workingArr[k] = L[i];
        snap(14, `Copy remaining L[${i}]=${L[i]} to index ${k}.`, [k], [...L], [...R], start);
        i++; k++;
      }
      while (j < R.length) {
        workingArr[k] = R[j];
        snap(14, `Copy remaining R[${j}]=${R[j]} to index ${k}.`, [k], [...L], [...R], start);
        j++; k++;
      }

      callStack.pop();
    }

    mergeSort(0, workingArr.length - 1);

    snap(0, "Merge Sort complete! Array fully sorted.", [], null, null, -1);
    return snapshots;
  }
};
