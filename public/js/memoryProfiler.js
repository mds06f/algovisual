// public/js/memoryProfiler.js

export function calculateMemory(snapshot, prevMemory) {
  if (!snapshot) {
    return {
      primaryArrayBytes: 0,
      auxArrayBytes: 0,
      stackFrameBytes: 0,
      variablesBytes: 0,
      totalBytes: 0,
      gcOccurred: false,
      gcAmount: 0,
      framesCount: 0
    };
  }

  // 1. Primary Array Space: 8 bytes per number (float64)
  const primaryCount = Array.isArray(snapshot.array) ? snapshot.array.length : 0;
  const primaryArrayBytes = primaryCount * 8;

  // 2. Auxiliary Array Space (e.g. auxLeft, auxRight, temp buffers)
  let auxArrayBytes = 0;
  if (Array.isArray(snapshot.auxLeft)) {
    auxArrayBytes += snapshot.auxLeft.length * 8;
  }
  if (Array.isArray(snapshot.auxRight)) {
    auxArrayBytes += snapshot.auxRight.length * 8;
  }
  if (snapshot.auxArray && Array.isArray(snapshot.auxArray)) {
    auxArrayBytes += snapshot.auxArray.length * 8;
  }

  // 3. Stack Frame allocations: 48 bytes per recursion stack call frame overhead
  let framesCount = 1;
  if (snapshot.callStack && Array.isArray(snapshot.callStack)) {
    framesCount = snapshot.callStack.length;
  } else if (snapshot.pointers && typeof snapshot.pointers.depth === 'number') {
    framesCount = snapshot.pointers.depth + 1;
  }
  const stackFrameBytes = framesCount * 48;

  // 4. Local Variables & Pointers footprints
  let variablesBytes = 0;
  const pointers = snapshot.pointers || {};
  for (const [key, val] of Object.entries(pointers)) {
    if (typeof val === 'number') {
      variablesBytes += 8;
    } else if (typeof val === 'boolean') {
      variablesBytes += 4;
    } else if (typeof val === 'string') {
      variablesBytes += val.length * 2;
    } else if (val && typeof val === 'object') {
      variablesBytes += 16;
    }
  }

  const totalBytes = primaryArrayBytes + auxArrayBytes + stackFrameBytes + variablesBytes;

  // 5. GC drop calculation compared to previous step allocation total
  let gcOccurred = false;
  let gcAmount = 0;
  if (prevMemory) {
    const prevTotal = prevMemory.totalBytes || 0;
    if (totalBytes < prevTotal) {
      gcOccurred = true;
      gcAmount = prevTotal - totalBytes;
    }
  }

  return {
    primaryArrayBytes,
    auxArrayBytes,
    stackFrameBytes,
    variablesBytes,
    totalBytes,
    gcOccurred,
    gcAmount,
    framesCount
  };
}

export function updateMemoryChart(pathElement, memoryHistory) {
  if (!pathElement || memoryHistory.length === 0) return;

  const width = 300;
  const height = 80;
  const margin = 5;

  const maxVal = Math.max(...memoryHistory.map(h => h.totalBytes || 100), 500);
  const points = [];

  for (let i = 0; i < memoryHistory.length; i++) {
    const val = memoryHistory[i].totalBytes || 0;
    const x = margin + (i / (memoryHistory.length - 1 || 1)) * (width - margin * 2);
    const y = (height - margin) - (val / maxVal) * (height - margin * 2);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  const d = points.length > 0 ? 'M ' + points.join(' L ') : '';
  pathElement.setAttribute('d', d);
}
