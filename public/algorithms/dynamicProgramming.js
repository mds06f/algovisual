// public/algorithms/dynamicProgramming.js

export const algorithm = {
  name: 'Dynamic Programming',
  category: 'DP',
  description:
    'Visualizes two classic DP algorithms on string pairs: Longest Common Subsequence (LCS) fills a 2D table tracking character matches, then backtracks to reconstruct the LCS string. Edit Distance (Levenshtein) tracks minimum insert/delete/replace costs to transform one string into another.',
  pseudocode: [
    'procedure dp(str1, str2, mode):',
    '  build table T of size (m+1) x (n+1)',
    '  initialize T[i][0] = i,  T[0][j] = j',
    '',
    '  for i = 1 to m:',
    '    for j = 1 to n:',
    '      if str1[i-1] == str2[j-1]:',
    '        T[i][j] = T[i-1][j-1] + (LCS: 1, Edit: 0)',
    '      else:',
    '        T[i][j] = 1 + min(T[i-1][j],    // delete',
    '                          T[i][j-1],    // insert',
    '                          T[i-1][j-1])  // replace',
    '',
    '  backtrack from T[m][n] to reconstruct result'
  ],

  generator: function (arr, target) {
    const mode = (target === 'edit') ? 'edit' : 'lcs';

    // Default strings encoded as char-codes in arr, or use defaults
    const STR1 = 'ABCBDAB';
    const STR2 = 'BDCAB';

    const s1 = STR1;
    const s2 = STR2;
    const m = s1.length;
    const n = s2.length;

    const snapshots = [];
    let stepCount = 0;

    const stats = () => ({ comparisons: stepCount, swaps: 0, complexity: { time: 'O(m·n)', space: 'O(m·n)' } });

    // ── Build the DP table ─────────────────────────────────────────────────────
    // T[i][j] – full table, filled incrementally
    const T = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Initialise base cases
    for (let i = 0; i <= m; i++) T[i][0] = mode === 'edit' ? i : 0;
    for (let j = 0; j <= n; j++) T[0][j] = mode === 'edit' ? j : 0;

    function snap(hi, hj, phase, desc, backtrack = []) {
      stepCount++;
      snapshots.push({
        array: [],
        highlights: [],
        dpTable: T.map(row => [...row]),
        dpStrings: { s1, s2 },
        dpHighlight: { i: hi, j: hj },
        dpBacktrack: backtrack,
        dpMode: mode,
        dpPhase: phase,
        executingLine: phase === 'fill' ? (hi === 0 || hj === 0 ? 2 : 7) : 14,
        stats: stats(),
        description: desc
      });
    }

    // Initial state
    snap(-1, -1, 'init', `Building ${mode === 'lcs' ? 'LCS' : 'Edit Distance'} DP table for "${s1}" vs "${s2}"`);

    // Base case snapshots
    for (let i = 0; i <= m; i++) snap(i, 0, 'fill', `Base case: T[${i}][0] = ${T[i][0]}`);
    for (let j = 1; j <= n; j++) snap(0, j, 'fill', `Base case: T[0][${j}] = ${T[0][j]}`);

    // Fill the table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const match = s1[i - 1] === s2[j - 1];

        if (mode === 'lcs') {
          if (match) {
            T[i][j] = T[i - 1][j - 1] + 1;
            snap(i, j, 'fill', `s1[${i - 1}]='${s1[i-1]}' == s2[${j - 1}]='${s2[j-1]}' → match! T[${i}][${j}] = T[${i-1}][${j-1}]+1 = ${T[i][j]}`);
          } else {
            T[i][j] = Math.max(T[i - 1][j], T[i][j - 1]);
            snap(i, j, 'fill', `s1[${i - 1}]='${s1[i-1]}' ≠ s2[${j - 1}]='${s2[j-1]}' → T[${i}][${j}] = max(${T[i-1][j]}, ${T[i][j-1]}) = ${T[i][j]}`);
          }
        } else {
          if (match) {
            T[i][j] = T[i - 1][j - 1];
            snap(i, j, 'fill', `s1[${i - 1}]='${s1[i-1]}' == s2[${j - 1}]='${s2[j-1]}' → no cost. T[${i}][${j}] = ${T[i][j]}`);
          } else {
            const del = T[i - 1][j];
            const ins = T[i][j - 1];
            const rep = T[i - 1][j - 1];
            T[i][j] = 1 + Math.min(del, ins, rep);
            const op = del <= ins && del <= rep ? 'delete' : ins <= rep ? 'insert' : 'replace';
            snap(i, j, 'fill', `s1[${i - 1}]='${s1[i-1]}' ≠ s2[${j - 1}]='${s2[j-1]}' → ${op}. T[${i}][${j}] = 1+min(${del},${ins},${rep}) = ${T[i][j]}`);
          }
        }
      }
    }

    // ── Backtracking ───────────────────────────────────────────────────────────
    const path = [];
    let i = m, j = n;

    if (mode === 'lcs') {
      snap(i, j, 'backtrack', `Table complete! LCS length = ${T[m][n]}. Backtracking from T[${m}][${n}]…`, [...path]);
      while (i > 0 && j > 0) {
        path.push([i, j]);
        if (s1[i - 1] === s2[j - 1]) {
          snap(i, j, 'backtrack', `Match: '${s1[i-1]}' is part of the LCS → move diagonally`, [...path]);
          i--; j--;
        } else if (T[i - 1][j] >= T[i][j - 1]) {
          snap(i, j, 'backtrack', `No match → follow max: move up`, [...path]);
          i--;
        } else {
          snap(i, j, 'backtrack', `No match → follow max: move left`, [...path]);
          j--;
        }
      }
      const lcs = [];
      let bi = m, bj = n;
      while (bi > 0 && bj > 0) {
        if (s1[bi - 1] === s2[bj - 1]) { lcs.unshift(s1[bi - 1]); bi--; bj--; }
        else if (T[bi - 1][bj] >= T[bi][bj - 1]) bi--;
        else bj--;
      }
      snap(-1, -1, 'done', `LCS = "${lcs.join('')}" (length ${T[m][n]})`, [...path]);
    } else {
      snap(i, j, 'backtrack', `Table complete! Edit Distance = ${T[m][n]}. Backtracking…`, [...path]);
      while (i > 0 || j > 0) {
        path.push([i, j]);
        if (i === 0) {
          snap(i, j, 'backtrack', `Insert '${s2[j-1]}'`, [...path]);
          j--;
        } else if (j === 0) {
          snap(i, j, 'backtrack', `Delete '${s1[i-1]}'`, [...path]);
          i--;
        } else if (s1[i - 1] === s2[j - 1]) {
          snap(i, j, 'backtrack', `Match '${s1[i-1]}' — no operation`, [...path]);
          i--; j--;
        } else {
          const del = T[i - 1][j];
          const ins = T[i][j - 1];
          const rep = T[i - 1][j - 1];
          if (rep <= del && rep <= ins) {
            snap(i, j, 'backtrack', `Replace '${s1[i-1]}' → '${s2[j-1]}'`, [...path]);
            i--; j--;
          } else if (del <= ins) {
            snap(i, j, 'backtrack', `Delete '${s1[i-1]}'`, [...path]);
            i--;
          } else {
            snap(i, j, 'backtrack', `Insert '${s2[j-1]}'`, [...path]);
            j--;
          }
        }
      }
      snap(-1, -1, 'done', `Edit Distance = ${T[m][n]} operations to transform "${s1}" → "${s2}"`, [...path]);
    }

    return snapshots;
  }
};
