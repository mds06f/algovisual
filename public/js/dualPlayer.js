// public/js/dualPlayer.js

let snapshotsA = [];
let snapshotsB = [];
let currentIndex = 0;
let maxSteps = 0;
let isPlaying = false;
let playbackInterval = null;
let speedDelay = 600;
let currentArray = [23, 45, 12, 56, 34, 18, 9, 41];

let moduleA = null;
let moduleB = null;

document.addEventListener('DOMContentLoaded', async () => {
  setupThemeToggle();
  await loadAlgorithms();

  document.getElementById('select-algo-a').addEventListener('change', loadAlgorithms);
  document.getElementById('select-algo-b').addEventListener('change', loadAlgorithms);
  
  document.getElementById('btn-play').addEventListener('click', togglePlay);
  document.getElementById('btn-next').addEventListener('click', stepNext);
  document.getElementById('btn-prev').addEventListener('click', stepPrev);
  document.getElementById('btn-reset').addEventListener('click', resetPlayroom);
  
  document.getElementById('btn-apply').addEventListener('click', () => {
    const rawVal = document.getElementById('input-array').value;
    const parsed = rawVal.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
    if (parsed.length > 1) {
      currentArray = parsed;
      resetPlayroom();
    }
  });

  document.getElementById('btn-random').addEventListener('click', () => {
    currentArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);
    document.getElementById('input-array').value = currentArray.join(', ');
    resetPlayroom();
  });

  document.getElementById('slider-speed').addEventListener('input', (e) => {
    const rate = parseFloat(e.target.value);
    speedDelay = Math.round(600 / rate);
    document.getElementById('text-speed').textContent = `${rate}x`;
    if (isPlaying) {
      pauseAnimation();
      startAnimation();
    }
  });
});

function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const toggleIcon = document.getElementById('theme-toggle-icon');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      if (toggleIcon) toggleIcon.textContent = isLight ? '🌙' : '☀️';
    });
  }
}

async function loadAlgorithms() {
  pauseAnimation();
  const nameA = document.getElementById('select-algo-a').value;
  const nameB = document.getElementById('select-algo-b').value;

  try {
    const modA = await import(`/algorithms/${nameA}.js`);
    const modB = await import(`/algorithms/${nameB}.js`);

    moduleA = modA.algorithm;
    moduleB = modB.algorithm;

    document.getElementById('title-viewport-a').textContent = `Engine A: ${moduleA.name}`;
    document.getElementById('title-viewport-b').textContent = `Engine B: ${moduleB.name}`;

    resetPlayroom();
  } catch (err) {
    console.error('Failed to load dual algorithms:', err);
  }
}

function resetPlayroom() {
  pauseAnimation();
  if (!moduleA || !moduleB) return;

  snapshotsA = moduleA.generator([...currentArray]);
  snapshotsB = moduleB.generator([...currentArray]);
  maxSteps = Math.max(snapshotsA.length, snapshotsB.length);

  currentIndex = 0;
  renderStep(0);
}

function renderStep(index) {
  const snapA = snapshotsA[Math.min(index, snapshotsA.length - 1)] || snapshotsA[snapshotsA.length - 1];
  const snapB = snapshotsB[Math.min(index, snapshotsB.length - 1)] || snapshotsB[snapshotsB.length - 1];

  renderBars('container-bars-a', snapA);
  renderBars('container-bars-b', snapB);

  document.getElementById('desc-a').textContent = snapA ? snapA.description : 'Complete.';
  document.getElementById('desc-b').textContent = snapB ? snapB.description : 'Complete.';

  if (snapA && snapA.stats) {
    document.getElementById('stat-comp-a').textContent = snapA.stats.comparisons || 0;
    document.getElementById('stat-swap-a').textContent = snapA.stats.swaps || 0;
  }
  if (snapB && snapB.stats) {
    document.getElementById('stat-comp-b').textContent = snapB.stats.comparisons || 0;
    document.getElementById('stat-swap-b').textContent = snapB.stats.swaps || 0;
  }

  document.getElementById('step-counter').textContent = `Step ${index + 1} / ${maxSteps}`;
}

function renderBars(containerId, snapshot) {
  const container = document.getElementById(containerId);
  if (!container || !snapshot || !snapshot.array) return;

  container.innerHTML = '';
  const arr = snapshot.array;
  const maxVal = Math.max(...arr, 1);

  arr.forEach((val, idx) => {
    const col = document.createElement('div');
    col.className = 'dual-bar-col';

    const bar = document.createElement('div');
    const pct = Math.max(10, Math.round((val / maxVal) * 100));
    bar.style.height = `${pct}%`;

    const isHighlight = snapshot.highlights && snapshot.highlights.includes(idx);
    const isCompleted = snapshot.executingLine === snapshot.array.length;

    if (isCompleted) {
      bar.className = 'dual-bar completed';
    } else if (isHighlight) {
      bar.className = 'dual-bar highlight';
    } else {
      bar.className = 'dual-bar normal';
    }

    col.appendChild(bar);
    container.appendChild(col);
  });
}

function togglePlay() {
  if (isPlaying) {
    pauseAnimation();
  } else {
    startAnimation();
  }
}

function startAnimation() {
  if (isPlaying) return;
  isPlaying = true;
  document.getElementById('btn-play').innerHTML = '<span>⏸</span> Pause';

  playbackInterval = setInterval(() => {
    if (currentIndex < maxSteps - 1) {
      currentIndex++;
      renderStep(currentIndex);
    } else {
      pauseAnimation();
    }
  }, speedDelay);
}

function pauseAnimation() {
  if (!isPlaying) return;
  isPlaying = false;
  document.getElementById('btn-play').innerHTML = '<span>▶</span> Synchronized Play';
  if (playbackInterval) {
    clearInterval(playbackInterval);
    playbackInterval = null;
  }
}

function stepNext() {
  pauseAnimation();
  if (currentIndex < maxSteps - 1) {
    currentIndex++;
    renderStep(currentIndex);
  }
}

function stepPrev() {
  pauseAnimation();
  if (currentIndex > 0) {
    currentIndex--;
    renderStep(currentIndex);
  }
}
