// public/js/player.js

let snapshots = [];
let currentIndex = 0;
let isPlaying = false;
let isLooping = false;
let playbackInterval = null;
let speedDelay = 600; // ms per step (default)
let currentAlgorithm = null;
let defaultArray = [23, 45, 12, 56, 34, 18, 9, 41];

// Grid wall drawing mouse state flags
let isGridMouseDown = false;
let isDrawingWall = true;

// DOM elements
let barsContainer;
let pseudocodeContainer;
let consoleLog;
let playPauseBtn;
let btnUndo;
let prevBtn;
let nextBtn;
let btnLoop;
let speedSlider;
let speedValueText;
let customInput;
let btnApplyInput;
let narrativeText;
let selectPreset;
let btnSavePreset;
let btnReset;
let btnDeletePreset;
let btnToggleSandbox;
let btnRunSandbox;
let sandboxContainer;
let sandboxTextarea;
let labelCodeType;
let btnAudioToggle;
let audioToggleIcon;
let audioCtx = null;
let isAudioMuted = true;
let soundWaveform = 'sine';
let soundPitchMultiplier = 1.0;
let btnAudioSettings;
let audioSettingsDrawer;
let selectWaveform;
let sliderPitch;
let textPitch;
let btnExportLog;
let stepCounterText;
let btnBenchmarkSandbox;
let sandboxBenchmarkPanel;
let btnCloseBenchmark;
let benchmarkChartContainer;
let selectHeuristic;
let containerHeuristicSelect;
let btnRandomize;
let containerMazeSelect;
let selectMazeType;
let btnGenerateMaze;
let activeBreakpoints = new Set();

export async function initPlayer(algoName) {
  try {
    // Dynamically load the selected algorithm module
    const module = await import(`/algorithms/${algoName}.js`);
    currentAlgorithm = module.algorithm;

    // Cache DOM nodes
    barsContainer = document.getElementById('bars-container');
    pseudocodeContainer = document.getElementById('pseudocode-container');
    consoleLog = document.getElementById('console-log');
    playPauseBtn = document.getElementById('btn-play');
    btnUndo = document.getElementById('btn-undo');
    prevBtn = document.getElementById('btn-prev');
    nextBtn = document.getElementById('btn-next');
    btnLoop = document.getElementById('btn-loop');
    speedSlider = document.getElementById('slider-speed');
    speedValueText = document.getElementById('text-speed');
    customInput = document.getElementById('input-custom');
    btnApplyInput = document.getElementById('btn-apply-input');
    narrativeText = document.getElementById('narrative-text');
    selectPreset = document.getElementById('select-preset');
    btnSavePreset = document.getElementById('btn-save-preset');
    btnReset = document.getElementById('btn-reset');
    btnDeletePreset = document.getElementById('btn-delete-preset');
    btnToggleSandbox = document.getElementById('btn-toggle-sandbox');
    btnRunSandbox = document.getElementById('btn-run-sandbox');
    sandboxContainer = document.getElementById('sandbox-container');
    sandboxTextarea = document.getElementById('sandbox-textarea');
    labelCodeType = document.getElementById('label-code-type');
    btnAudioToggle = document.getElementById('btn-audio-toggle');
    audioToggleIcon = document.getElementById('audio-toggle-icon');
    btnAudioSettings = document.getElementById('btn-audio-settings');
    audioSettingsDrawer = document.getElementById('audio-settings-drawer');
    selectWaveform = document.getElementById('select-waveform');
    sliderPitch = document.getElementById('slider-pitch');
    textPitch = document.getElementById('text-pitch');
    btnExportLog = document.getElementById('btn-export-log');
    stepCounterText = document.getElementById('step-counter-text');
    btnBenchmarkSandbox = document.getElementById('btn-benchmark-sandbox');
    sandboxBenchmarkPanel = document.getElementById('sandbox-benchmark-panel');
    btnCloseBenchmark = document.getElementById('btn-close-benchmark');
    benchmarkChartContainer = document.getElementById(
      'benchmark-chart-container',
    );
    selectHeuristic = document.getElementById('select-heuristic');
    containerHeuristicSelect = document.getElementById(
      'container-heuristic-select',
    );
    btnRandomize = document.getElementById('btn-randomize');
    containerMazeSelect = document.getElementById('container-maze-select');
    selectMazeType = document.getElementById('select-maze-type');
    btnGenerateMaze = document.getElementById('btn-generate-maze');

    // Clear sandbox editor contents and return view to default state
    if (sandboxTextarea) sandboxTextarea.value = '';
    if (sandboxContainer) sandboxContainer.classList.add('hidden');
    if (sandboxBenchmarkPanel) sandboxBenchmarkPanel.classList.add('hidden');
    if (pseudocodeContainer) pseudocodeContainer.classList.remove('hidden');
    if (btnToggleSandbox) btnToggleSandbox.textContent = 'Sandbox Mode';
    if (labelCodeType) labelCodeType.textContent = 'PSEUDOCODE';

    // Setup document title, page title, description and breadcrumbs
    document.title = `${currentAlgorithm.name} - AlgoVisual`;
    const algoTitleElem = document.getElementById('algo-title');
    if (algoTitleElem) algoTitleElem.textContent = currentAlgorithm.name;
    const algoDescElem = document.getElementById('algo-desc');
    if (algoDescElem) algoDescElem.textContent = currentAlgorithm.description;

    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbAlgo = document.getElementById('breadcrumb-algo');
    if (breadcrumbCategory) breadcrumbCategory.textContent = currentAlgorithm.category || 'Algorithms';
    if (breadcrumbAlgo) breadcrumbAlgo.textContent = currentAlgorithm.name;

    // Populate pseudocode lines
    renderPseudocode(currentAlgorithm.pseudocode);

    // Show/hide target input depending on algorithm category
    const targetInputContainer = document.getElementById(
      'container-target-input',
    );
    const customInputsContainer = document.getElementById(
      'container-custom-inputs',
    );
    let initialTarget = undefined;

    if (customInputsContainer) {
      if (currentAlgorithm.category === 'Pathfinding') {
        customInputsContainer.classList.add('hidden');
      } else {
        customInputsContainer.classList.remove('hidden');
      }
    }

    if (containerHeuristicSelect) {
      if (algoName === 'aStar') {
        containerHeuristicSelect.classList.remove('hidden');
        if (selectHeuristic) {
          initialTarget = selectHeuristic.value || 'manhattan';
        }
      } else {
        containerHeuristicSelect.classList.add('hidden');
      }
    }

    if (containerMazeSelect) {
      if (currentAlgorithm.category === 'Pathfinding') {
        containerMazeSelect.classList.remove('hidden');
      } else {
        containerMazeSelect.classList.add('hidden');
      }
    }

    if (targetInputContainer) {
      if (currentAlgorithm.category === 'Searching') {
        targetInputContainer.classList.remove('hidden');
        const targetInput = document.getElementById('input-target');
        if (targetInput) {
          initialTarget = parseInt(targetInput.value.trim(), 10) || 34;
        }
      } else {
        targetInputContainer.classList.add('hidden');
      }
    }

    const containerDsInputs = document.getElementById('container-ds-inputs');
    if (containerDsInputs) {
      if (currentAlgorithm.category === 'Data Structures') {
        containerDsInputs.classList.remove('hidden');
      } else {
        containerDsInputs.classList.add('hidden');
      }
    }

    if (currentAlgorithm.category === 'Pathfinding') {
      const TOTAL_NODES = 96;
      defaultArray = Array(TOTAL_NODES).fill(0); // STATE_EMPTY
      defaultArray[25] = 1; // STATE_START
      defaultArray[70] = 2; // STATE_END
      const defaultWalls = [17, 29, 41, 53, 65, 43, 44, 45, 46];
      defaultWalls.forEach((idx) => {
        defaultArray[idx] = 3; // STATE_WALL
      });
    } else {
      defaultArray = [23, 45, 12, 56, 34, 18, 9, 41];
    }

    // Initial setup
    resetPlayroom(defaultArray, initialTarget);

    // Bind event listeners
    bindEvents();

    // Load presets dropdown from localStorage
    loadPresetsDropdown();
  } catch (err) {
    console.error('Failed to initialize visualizer player:', err);
  }
}

function renderPseudocode(lines) {
  pseudocodeContainer.innerHTML = '';
  lines.forEach((line, index) => {
    const lineElem = document.createElement('div');
    lineElem.className =
      'code-line-item px-3 py-1.5 text-xs sm:text-sm font-mono text-slate-400 border-l-4 border-transparent transition duration-150 relative cursor-pointer';
    
    const gutterSpan = document.createElement('span');
    gutterSpan.className = 'code-gutter-num';
    gutterSpan.textContent = `${index + 1}`;

    const textSpan = document.createElement('span');
    const spaces = line.match(/^\s*/)[0].length;
    textSpan.style.paddingLeft = `${spaces * 6}px`;
    textSpan.textContent = line.trim();

    const tooltipElem = document.createElement('div');
    tooltipElem.className = 'code-tooltip-overlay';
    tooltipElem.id = `code-tooltip-${index}`;
    tooltipElem.textContent = `Line ${index + 1}: ${line.trim()}`;

    lineElem.appendChild(gutterSpan);
    lineElem.appendChild(textSpan);
    lineElem.appendChild(tooltipElem);
    lineElem.id = `code-line-${index}`;
    pseudocodeContainer.appendChild(lineElem);
  });
}

function resetPlayroom(array, target) {
  pauseAnimation();
  currentIndex = 0;
  // Generate snapshots
  snapshots = currentAlgorithm.generator(array, target);

  // Render first snapshot
  renderSnapshot(currentIndex);
  updateStatusHUD('READY');
}

function renderSnapshot(index) {
  if (snapshots.length === 0 || index < 0 || index >= snapshots.length) return;
  const snapshot = snapshots[index];

  // 1. Render data bars (with algorithm category context)
  renderBars(
    snapshot.array,
    snapshot.highlights,
    snapshot.pointers,
    currentAlgorithm.category,
    snapshot.auxLeft,
    snapshot.auxRight,
    snapshot.auxLeftStart,
    snapshot.scores,
  );

  // 2. Highlight active pseudocode line
  updateCodeHighlight(snapshot.executingLine, snapshot);

  // 3. Update narration text
  narrativeText.textContent = snapshot.description;

  // 4. Append log to console
  appendConsoleLog(snapshot.description);

  // 5. Update registers and metrics HUDs
  updateTelemetryHUD(snapshot);

  // 8. Render call stack if snapshot carries frame data
  updateCallStack(snapshot);

  // 6. Update disabled states of timeline buttons
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === snapshots.length - 1;

  // 7. Update step counter text
  if (stepCounterText) {
    stepCounterText.textContent = `Step ${index + 1} / ${snapshots.length}`;
  }
}

function renderBars(
  arr,
  highlights,
  pointers,
  category,
  auxLeft = null,
  auxRight = null,
  auxLeftStart = -1,
  scores = null,
) {
  barsContainer.innerHTML = '';

  if (category === 'Pathfinding') {
    barsContainer.className = 'grid-visualizer';

    arr.forEach((cellType, index) => {
      const cell = document.createElement('div');
      let cellClass = 'grid-cell';
      if (cellType === 1) cellClass += ' start';
      else if (cellType === 2) cellClass += ' end';
      else if (cellType === 3) cellClass += ' wall';
      else if (cellType === 4) cellClass += ' visited';
      else if (cellType === 5) cellClass += ' path';
      else if (cellType === 6) cellClass += ' weight';

      cell.className = cellClass;
      cell.dataset.index = index;
      cell.addEventListener('dragstart', (e) => e.preventDefault());

      if (cellType === 1) {
        cell.innerHTML =
          '<span class="text-[10px] font-bold text-white flex items-center justify-center h-full select-none">S</span>';
      } else if (cellType === 2) {
        cell.innerHTML =
          '<span class="text-[10px] font-bold text-white flex items-center justify-center h-full select-none">E</span>';
      } else if (cellType === 6) {
        cell.innerHTML =
          '<span class="text-[9px] font-bold text-amber-200 flex items-center justify-center h-full select-none">5</span>';
      } else if (scores && scores[index]) {
        const scoreObj = scores[index];
        const f = scoreObj.f.toFixed(0);
        const g = scoreObj.g.toFixed(0);
        const h = scoreObj.h.toFixed(0);
        cell.innerHTML = `
          <div class="text-[7px] leading-tight text-slate-400 font-technical flex flex-col justify-between items-center h-full p-0.5 select-none">
            <div class="flex justify-between w-full">
              <span>g:${g}</span>
              <span>h:${h}</span>
            </div>
            <span class="font-bold text-[8px] text-[#00f3ff]">f:${f}</span>
          </div>
        `;
      }

      barsContainer.appendChild(cell);
    });
  } else if (category === 'Searching') {
    // Apply array-tape layout styles
    barsContainer.className = 'array-tape';

    arr.forEach((value, index) => {
      const cell = document.createElement('div');

      let cellClass = 'array-cell normal';
      if (highlights.includes(index)) {
        cellClass = 'array-cell highlight';
        
        // Render target found indicator for binarySearch or linearSearch
        const currentSnapshot = snapshots[currentIndex];
        if (currentSnapshot && currentSnapshot.description && currentSnapshot.description.includes("Found target")) {
          const targetInput = document.getElementById('input-target');
          if (targetInput) {
            const targetVal = parseInt(targetInput.value.trim(), 10);
            if (!isNaN(targetVal) && value === targetVal) {
              cellClass = 'array-cell success';
            }
          }
        }
      }
      if (pointers.hasOwnProperty('mid') && pointers.mid === index) {
        // Only override to mid if it's not the success cell
        if (cellClass !== 'array-cell success') {
          cellClass = 'array-cell mid';
        }
      }

      // Determine if index is out of search space bounds [low, high]
      const hasLow = pointers.hasOwnProperty('low');
      const hasHigh = pointers.hasOwnProperty('high');
      if (
        (hasLow && index < pointers.low) ||
        (hasHigh && index > pointers.high)
      ) {
        cellClass += ' diagonal-hatch';
      }

      cell.className = cellClass;

      // Render pointers labels dynamically above/below the cell
      let badgesHtml = '';
      for (const [pName, pIndex] of Object.entries(pointers)) {
        if (pIndex === index) {
          const badgeType =
            pName === 'low'
              ? 'low'
              : pName === 'high'
                ? 'high'
                : pName === 'mid'
                  ? 'mid'
                  : 'generic';
          badgesHtml += `<div class="pointer-badge ${badgeType}">${pName}</div>`;
        }
      }

      cell.innerHTML = `
        ${badgesHtml}
        <span>${value}</span>
        <span class="text-[9px] text-slate-500 absolute bottom-1 right-1 font-mono font-light select-none">${index}</span>
      `;
      barsContainer.appendChild(cell);
    });
  } else {
    // Apply sorting bars layout styles — wrap in a flex column to allow aux canvas below
    barsContainer.className = 'flex flex-col gap-2 w-full';
    const maxVal = Math.max(...arr, 1);

    // Main bar chart row
    const mainRow = document.createElement('div');
    mainRow.className =
      'bar-container gap-2 sm:gap-4 justify-center items-end h-[220px]';

    arr.forEach((value, index) => {
      const col = document.createElement('div');
      col.className =
        'flex-1 flex flex-col justify-end items-center h-full relative';

      let tubeClass = 'bar-tube normal';
      if (highlights.includes(index)) tubeClass = 'bar-tube highlight';
      if (currentIndex === snapshots.length - 1)
        tubeClass = 'bar-tube completed';

      let pointerLabels = [];
      for (const [pName, pIndex] of Object.entries(pointers)) {
        if (pIndex === index) pointerLabels.push(pName);
      }
      const pointerHtml =
        pointerLabels.length > 0
          ? `<div class="pointer-badge generic" style="top:-24px">${pointerLabels.join(', ')}</div>`
          : '';

      const heightPercent = (value / maxVal) * 100;
      col.innerHTML = `
        ${pointerHtml}
        <div class="${tubeClass}" style="height:${heightPercent}%"></div>
        <span class="text-slate-400 font-technical text-xs mt-2 select-none font-semibold font-mono">${value}</span>
      `;
      mainRow.appendChild(col);
    });
    barsContainer.appendChild(mainRow);

    // Auxiliary split sub-array canvas (Merge Sort only)
    if (auxLeft && auxRight && auxLeftStart >= 0) {
      const auxRow = document.createElement('div');
      auxRow.className = 'w-full';

      const auxMaxVal = Math.max(...auxLeft, ...auxRight, 1);
      const auxLabel = document.createElement('div');
      auxLabel.className =
        'text-[9px] text-slate-500 font-technical uppercase tracking-wider mb-1 px-1';
      auxLabel.textContent = `Aux Split — Left[${auxLeft.length}]  |  Right[${auxRight.length}]`;
      auxRow.appendChild(auxLabel);

      const auxCanvas = document.createElement('div');
      auxCanvas.className =
        'flex items-end gap-1 h-[80px] border-t border-slate-900 pt-2';

      // Left sub-array bars (gold)
      auxLeft.forEach((val) => {
        const col = document.createElement('div');
        col.className = 'flex-1 flex flex-col justify-end items-center h-full';
        const heightPct = (val / auxMaxVal) * 100;
        col.innerHTML = `
          <div style="height:${heightPct}%;background:linear-gradient(to top,rgba(234,179,8,0.6),rgba(234,179,8,0.2));border:1px solid rgba(234,179,8,0.6);border-radius:2px 2px 0 0"></div>
          <span class="text-[8px] text-yellow-500 font-mono mt-1 select-none">${val}</span>
        `;
        auxCanvas.appendChild(col);
      });

      // Divider
      const divider = document.createElement('div');
      divider.className = 'w-px h-full bg-slate-700 mx-1 self-stretch';
      auxCanvas.appendChild(divider);

      // Right sub-array bars (magenta)
      auxRight.forEach((val) => {
        const col = document.createElement('div');
        col.className = 'flex-1 flex flex-col justify-end items-center h-full';
        const heightPct = (val / auxMaxVal) * 100;
        col.innerHTML = `
          <div style="height:${heightPct}%;background:linear-gradient(to top,rgba(168,85,247,0.6),rgba(168,85,247,0.2));border:1px solid rgba(168,85,247,0.6);border-radius:2px 2px 0 0"></div>
          <span class="text-[8px] text-purple-400 font-mono mt-1 select-none">${val}</span>
        `;
        auxCanvas.appendChild(col);
      });

      auxRow.appendChild(auxCanvas);
      barsContainer.appendChild(auxRow);
    }
  }

  // Sonify active comparison highlights or active node scans
  if (highlights && highlights.length > 0) {
    const val = arr[highlights[0]];
    if (val !== undefined && typeof val === 'number') {
      if (category === 'Pathfinding') {
        // Map node index (0-95) to frequency scale
        playToneForValue((highlights[0] / 95) * 100);
      } else {
        playToneForValue(val);
      }
    }
  }
}

function updateCodeHighlight(activeLineIndex, snapshot) {
  // Reset all lines
  const lines = pseudocodeContainer.children;
  for (let i = 0; i < lines.length; i++) {
    lines[i].classList.remove('code-line-active');
  }

  // Set active line
  const activeLine = document.getElementById(`code-line-${activeLineIndex}`);
  if (activeLine) {
    activeLine.classList.add('code-line-active');
    const tooltip = activeLine.querySelector('.code-tooltip-overlay');
    if (tooltip && snapshot && snapshot.pointers) {
      const vars = Object.entries(snapshot.pointers).map(([k, v]) => `${k}=${v}`).join(', ');
      tooltip.textContent = vars ? `🔍 ${vars}` : `Line ${activeLineIndex + 1}`;
    }
  }
}

function updateTelemetryHUD(snapshot) {
  // 1. Update State Registers Table
  const varBody = document.getElementById('hud-variables-body');
  if (varBody) {
    varBody.innerHTML = '';
    const entries = Object.entries(snapshot.pointers);
    if (entries.length === 0) {
      varBody.innerHTML = `<tr><td colspan="2" class="text-slate-600 font-mono text-center py-4">No active registers</td></tr>`;
    } else {
      entries.forEach(([key, val]) => {
        varBody.innerHTML += `
          <tr class="border-b border-slate-900">
            <td class="font-mono text-slate-400 py-2 font-bold">${key}</td>
            <td class="font-mono text-right py-2"><span class="hud-value-highlight">${val}</span></td>
          </tr>
        `;
      });
    }
  }

  // 2. Update Performance Metrics Counters
  const stepEl = document.getElementById('stat-step');
  const compEl = document.getElementById('stat-comparisons');
  const swapsEl = document.getElementById('stat-swaps');
  const complexityTimeEl = document.getElementById('stat-complexity-time');
  const complexitySpaceEl = document.getElementById('stat-complexity-space');

  if (stepEl) stepEl.textContent = `${currentIndex + 1} / ${snapshots.length}`;
  if (compEl)
    compEl.textContent = snapshot.stats ? snapshot.stats.comparisons : 0;
  if (swapsEl) swapsEl.textContent = snapshot.stats ? snapshot.stats.swaps : 0;
  if (complexityTimeEl)
    complexityTimeEl.textContent = snapshot.stats
      ? snapshot.stats.complexity.time
      : 'N/A';
  if (complexitySpaceEl)
    complexitySpaceEl.textContent = snapshot.stats
      ? snapshot.stats.complexity.space
      : 'N/A';
}

// Renders the call stack HUD panel; shows/hides panel based on callStack presence
function updateCallStack(snapshot) {
  const panel = document.getElementById('callstack-panel');
  const container = document.getElementById('callstack-container');
  if (!panel || !container) return;

  const frames = snapshot.callStack;
  if (!frames || frames.length === 0) {
    panel.classList.add('hidden');
    panel.classList.remove('flex');
    container.innerHTML = '';
    return;
  }

  panel.classList.remove('hidden');
  panel.classList.add('flex');
  container.innerHTML = '';

  // Render frames bottom (oldest) to top (newest)
  // flex-col-reverse means last item visually appears on top
  frames.forEach((frame, i) => {
    const chip = document.createElement('div');
    const isTop = i === frames.length - 1;
    chip.className = `callstack-frame${isTop ? ' active' : ''}`;
    chip.textContent = frame;
    container.appendChild(chip);
  });
}

function updateStatusHUD(status) {
  const statusLed = document.getElementById('status-led');
  const statusText = document.getElementById('status-text');
  if (!statusLed || !statusText) return;

  if (status === 'RUNNING') {
    statusLed.className = 'led-indicator led-active led-pulse';
    statusText.textContent = 'RUNNING';
  } else if (status === 'PAUSED') {
    statusLed.className = 'led-indicator led-standby led-pulse';
    statusText.textContent = 'PAUSED';
  } else if (status === 'FINISHED') {
    statusLed.className = 'led-indicator led-active';
    statusLed.classList.remove('led-pulse');
    statusText.textContent = 'COMPLETED';
  } else if (status === 'READY') {
    statusLed.className = 'led-indicator led-standby';
    statusText.textContent = 'READY';
  }
}

function appendConsoleLog(text) {
  const logItem = document.createElement('div');
  logItem.className =
    'py-1 text-[11px] text-slate-300 font-mono flex items-start gap-2 border-b border-slate-900/40';
  logItem.innerHTML = `<span class="text-[var(--color-accent-cyan)] select-none">&gt;</span> <span>${text}</span>`;
  consoleLog.appendChild(logItem);
  consoleLog.scrollTop = consoleLog.scrollHeight;
}

// Playback operations
function startAnimation() {
  if (isPlaying) return;
  isPlaying = true;
  playPauseBtn.innerHTML = '<span>⏸️</span> Pause';
  updateStatusHUD('RUNNING');

  playbackInterval = setInterval(() => {
    if (currentIndex < snapshots.length - 1) {
      currentIndex++;
      renderSnapshot(currentIndex);
      const curLine = snapshots[currentIndex]?.executingLine;
      if (curLine !== undefined && activeBreakpoints.has(curLine)) {
        pauseAnimation();
        appendConsoleLog(`[BREAKPOINT] Execution paused at line ${curLine}`);
      }
    } else if (isLooping) {
      currentIndex = 0;
      renderSnapshot(currentIndex);
    } else {
      pauseAnimation();
      updateStatusHUD('FINISHED');
    }
  }, speedDelay);
}

function pauseAnimation() {
  if (!isPlaying) return;
  isPlaying = false;
  playPauseBtn.innerHTML = '<span>▶️</span> Play';
  if (playbackInterval) {
    clearInterval(playbackInterval);
    playbackInterval = null;
  }
  updateStatusHUD('PAUSED');
}

function stepNext() {
  pauseAnimation();
  if (currentIndex < snapshots.length - 1) {
    currentIndex++;
    renderSnapshot(currentIndex);
    if (currentIndex === snapshots.length - 1) {
      updateStatusHUD('FINISHED');
    }
  } else if (isLooping) {
    currentIndex = 0;
    renderSnapshot(currentIndex);
  }
}

function stepPrev() {
  pauseAnimation();
  if (currentIndex > 0) {
    currentIndex--;
    renderSnapshot(currentIndex);
    updateStatusHUD('PAUSED');
  }
}

function undoAction() {
  pauseAnimation();
  if (currentIndex > 0) {
    currentIndex = Math.max(0, currentIndex - 1);
    renderSnapshot(currentIndex);
    appendConsoleLog(`[UNDO] Deep backtracked execution state to step ${currentIndex + 1}`);
    updateStatusHUD('PAUSED');
  }
}

function bindEvents() {
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      pauseAnimation();
    } else {
      startAnimation();
    }
  });

  if (btnUndo) btnUndo.addEventListener('click', undoAction);
  prevBtn.addEventListener('click', stepPrev);
  nextBtn.addEventListener('click', stepNext);

  if (btnLoop) {
    btnLoop.addEventListener('click', () => {
      isLooping = !isLooping;
      btnLoop.classList.toggle('tech-btn-primary', isLooping);
      appendConsoleLog(`[PLAYBACK] Auto-loop mode ${isLooping ? 'ENABLED' : 'DISABLED'}`);
    });
  }

  const btnDsPush = document.getElementById('btn-ds-push');
  const btnDsPop = document.getElementById('btn-ds-pop');
  const btnDsEnqueue = document.getElementById('btn-ds-enqueue');
  const btnDsDequeue = document.getElementById('btn-ds-dequeue');
  const inputDsVal = document.getElementById('input-ds-val');

  if (btnDsPush) {
    btnDsPush.addEventListener('click', () => {
      const val = parseInt(inputDsVal ? inputDsVal.value : '42', 10) || 42;
      defaultArray.push(val);
      resetPlayroom([...defaultArray]);
      appendConsoleLog(`[STACK] PUSH element ${val}. Array length: ${defaultArray.length}`);
    });
  }

  if (btnDsPop) {
    btnDsPop.addEventListener('click', () => {
      if (defaultArray.length > 0) {
        const val = defaultArray.pop();
        resetPlayroom([...defaultArray]);
        appendConsoleLog(`[STACK] POP element ${val}. Array length: ${defaultArray.length}`);
      }
    });
  }

  if (btnDsEnqueue) {
    btnDsEnqueue.addEventListener('click', () => {
      const val = parseInt(inputDsVal ? inputDsVal.value : '42', 10) || 42;
      defaultArray.push(val);
      resetPlayroom([...defaultArray]);
      appendConsoleLog(`[QUEUE] ENQUEUE element ${val}. Rear at ${defaultArray.length - 1}`);
    });
  }

  if (btnDsDequeue) {
    btnDsDequeue.addEventListener('click', () => {
      if (defaultArray.length > 0) {
        const val = defaultArray.shift();
        resetPlayroom([...defaultArray]);
        appendConsoleLog(`[QUEUE] DEQUEUE front element ${val}. Array length: ${defaultArray.length}`);
      }
    });
  }

  const btnCopyCode = document.getElementById('btn-copy-code');
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      if (currentAlgorithm && currentAlgorithm.pseudocode) {
        const textToCopy = currentAlgorithm.pseudocode.join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
          const origText = btnCopyCode.textContent;
          btnCopyCode.textContent = '✅ Copied!';
          setTimeout(() => {
            btnCopyCode.textContent = origText;
          }, 1500);
        }).catch(err => {
          console.error('Failed to copy pseudocode:', err);
        });
      }
    });
  }

  const btnRecord = document.getElementById('btn-record');
  let mediaRecorder = null;
  let recordedChunks = [];
  let isRecording = false;

  if (btnRecord) {
    btnRecord.addEventListener('click', () => {
      const recordIcon = document.getElementById('record-icon');
      const recordText = document.getElementById('record-text');
      
      if (!isRecording) {
        recordedChunks = [];
        const canvasContainer = document.getElementById('bars-container');
        try {
          const canvas = canvasContainer ? canvasContainer.querySelector('canvas') : null;
          let stream = canvas && canvas.captureStream ? canvas.captureStream(30) : null;
          if (stream && typeof MediaRecorder !== 'undefined') {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) recordedChunks.push(e.data);
            };
            mediaRecorder.onstop = () => {
              const blob = new Blob(recordedChunks, { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `algovisual-${currentAlgorithm ? currentAlgorithm.name.toLowerCase().replace(/\s+/g, '-') : 'session'}.webm`;
              a.click();
              URL.revokeObjectURL(url);
              appendConsoleLog('[RECORDING] Exported webm animation recording file.');
            };
            mediaRecorder.start();
          }
        } catch (err) {
          console.error('MediaRecorder initialisation warning:', err);
        }

        isRecording = true;
        if (recordIcon) recordIcon.textContent = '⏹️';
        if (recordText) recordText.textContent = 'Stop & Save';
        btnRecord.classList.add('tech-btn-primary');
        appendConsoleLog('[RECORDING] Started animation stream recording...');
      } else {
        isRecording = false;
        if (recordIcon) recordIcon.textContent = '🔴';
        if (recordText) recordText.textContent = 'Record';
        btnRecord.classList.remove('tech-btn-primary');

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        } else {
          appendConsoleLog('[RECORDING] Animation recording stopped.');
        }
      }
    });
  }

  // Speed slider change
  speedSlider.addEventListener('input', (e) => {
    const rate = parseFloat(e.target.value);
    speedDelay = Math.round(600 / rate); // base 600ms scaled
    speedValueText.textContent = `${rate}x`;

    // If currently running, restart interval with new speed
    if (isPlaying) {
      pauseAnimation();
      startAnimation();
    }

    // Sync active state on preset buttons
    document.querySelectorAll('.speed-preset-btn').forEach((btn) => {
      const btnRate = parseFloat(btn.dataset.speed);
      btn.classList.toggle('speed-preset-active', btnRate === rate);
    });
  });

  // Speed preset buttons
  document.querySelectorAll('.speed-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rate = parseFloat(btn.dataset.speed);

      // Clamp to slider range (0.5 - 3.0); 5x is an extended preset beyond slider
      const sliderRate = Math.min(rate, 3.0);
      speedSlider.value = sliderRate;
      speedDelay = Math.round(600 / rate);
      speedValueText.textContent = `${rate}x`;

      // Toggle active highlight
      document
        .querySelectorAll('.speed-preset-btn')
        .forEach((b) => b.classList.remove('speed-preset-active'));
      btn.classList.add('speed-preset-active');

      // Restart animation if playing
      if (isPlaying) {
        pauseAnimation();
        startAnimation();
      }
    });
  });

  // Apply custom array input
  btnApplyInput.addEventListener('click', () => {
    const val = customInput.value.trim();
    if (!val) return;

    // Parse values from comma separated inputs
    const parsed = val
      .split(',')
      .map((v) => parseInt(v.trim(), 10))
      .filter((v) => !isNaN(v));

    if (parsed.length < 3 || parsed.length > 15) {
      alert('Please enter between 3 and 15 numbers.');
      return;
    }

    let targetVal = undefined;
    if (currentAlgorithm.category === 'Searching') {
      const targetInput = document.getElementById('input-target');
      if (targetInput) {
        const parsedTarget = parseInt(targetInput.value.trim(), 10);
        if (isNaN(parsedTarget)) {
          alert('Please enter a valid target number.');
          return;
        }
        targetVal = parsedTarget;
      }
    }

    defaultArray = parsed;
    resetPlayroom(defaultArray, targetVal);
  });

  // Change event on select-preset dropdown
  if (selectPreset) {
    selectPreset.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val) {
        customInput.value = val;
        btnApplyInput.click();
      }
    });
  }

  // Change event on select-heuristic dropdown
  if (selectHeuristic) {
    selectHeuristic.addEventListener('change', (e) => {
      const val = e.target.value;
      resetPlayroom(defaultArray, val);
    });
  }

  // Click event on btn-save-preset
  if (btnSavePreset) {
    btnSavePreset.addEventListener('click', () => {
      const val = customInput.value.trim();
      if (!val) {
        alert('Please enter a valid comma-separated array first.');
        return;
      }

      const parsed = val
        .split(',')
        .map((v) => parseInt(v.trim(), 10))
        .filter((v) => !isNaN(v));

      if (parsed.length < 3 || parsed.length > 15) {
        alert('Please enter between 3 and 15 numbers.');
        return;
      }

      const presetName = prompt('Enter a name for this custom array preset:');
      if (!presetName) return;
      const trimmedName = presetName.trim();
      if (!trimmedName) return;

      const storedPresets = JSON.parse(
        localStorage.getItem('algovisual_presets') || '[]',
      );
      storedPresets.push({ name: trimmedName, array: val });
      localStorage.setItem('algovisual_presets', JSON.stringify(storedPresets));

      loadPresetsDropdown();
      // Select the newly added option
      if (selectPreset) {
        selectPreset.value = val;
      }
    });
  }

  // Click event on btn-reset
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (customInput) customInput.value = '';
      if (selectPreset) selectPreset.value = '';
      
      if (currentAlgorithm.category === 'Pathfinding') {
        const TOTAL_NODES = 96;
        defaultArray = Array(TOTAL_NODES).fill(0); // STATE_EMPTY
        defaultArray[25] = 1; // STATE_START
        defaultArray[70] = 2; // STATE_END
        const defaultWalls = [17, 29, 41, 53, 65, 43, 44, 45, 46];
        defaultWalls.forEach(idx => {
          defaultArray[idx] = 3; // STATE_WALL
        });
      } else {
        defaultArray = [23, 45, 12, 56, 34, 18, 9, 41];
      }

      let targetVal = undefined;
      if (currentAlgorithm.category === 'Searching') {
        const targetInput = document.getElementById('input-target');
        if (targetInput) {
          targetInput.value = '34';
          targetVal = 34;
        }
      }
      resetPlayroom(defaultArray, targetVal);
    });
  }

  // Click event on btn-randomize
  if (btnRandomize) {
    btnRandomize.addEventListener('click', () => {
      const lenInput = document.getElementById('random-length');
      const minInput = document.getElementById('random-min');
      const maxInput = document.getElementById('random-max');

      const len = Math.min(15, Math.max(3, parseInt(lenInput?.value, 10) || 8));
      const minVal = Math.min(98, Math.max(1, parseInt(minInput?.value, 10) || 1));
      const maxVal = Math.min(99, Math.max(minVal + 1, parseInt(maxInput?.value, 10) || 99));

      const randomArr = Array.from({ length: len }, () =>
        Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal
      );

      defaultArray = randomArr;
      if (customInput) customInput.value = randomArr.join(',');
      if (selectPreset) selectPreset.value = '';

      let targetVal = undefined;
      if (currentAlgorithm.category === 'Searching') {
        // Pick a random element from the generated array as the target
        targetVal = randomArr[Math.floor(Math.random() * randomArr.length)];
        const targetInput = document.getElementById('input-target');
        if (targetInput) targetInput.value = targetVal;
      }
      resetPlayroom(defaultArray, targetVal);
    });
  }

  // Click event on btn-delete-preset
  if (btnDeletePreset) {
    btnDeletePreset.addEventListener('click', () => {
      if (!selectPreset) return;
      const selectedVal = selectPreset.value;
      // Do not allow deleting the built-in Default Array option
      if (!selectedVal || selectedVal === '23,45,12,56,34,18,9,41') {
        alert('Select a custom saved preset to delete.');
        return;
      }
      const storedPresets = JSON.parse(localStorage.getItem('algovisual_presets') || '[]');
      const updated = storedPresets.filter((p) => p.array !== selectedVal);
      localStorage.setItem('algovisual_presets', JSON.stringify(updated));
      loadPresetsDropdown();
      if (customInput) customInput.value = '';
    });
  }

  // Generate Maze for Pathfinding Grid
  if (btnGenerateMaze) {
    btnGenerateMaze.addEventListener('click', () => {
      const type = selectMazeType ? selectMazeType.value : 'recursive-division';
      const TOTAL_NODES = 96;
      const arr = Array(TOTAL_NODES).fill(0); // 0 = empty
      arr[25] = 1; // start
      arr[70] = 2; // end

      if (type === 'random') {
        for (let i = 0; i < TOTAL_NODES; i++) {
          if (i !== 25 && i !== 70 && Math.random() < 0.35) {
            arr[i] = 3; // wall
          }
        }
      } else if (type === 'recursive-division') {
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 12; c++) {
            const idx = r * 12 + c;
            if (idx === 25 || idx === 70) continue;
            if ((c === 3 && r !== 2 && r !== 6) || (c === 7 && r !== 1 && r !== 5) || (r === 3 && c !== 4 && c !== 9) || (r === 5 && c !== 1 && c !== 8)) {
              arr[idx] = 3;
            }
          }
        }
      } else { // prims
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 12; c++) {
            const idx = r * 12 + c;
            if (idx === 25 || idx === 70) continue;
            if ((r % 2 === 1 && c % 2 === 1) || (r % 2 === 0 && Math.random() < 0.4)) {
              arr[idx] = 3;
            }
          }
        }
      }

      defaultArray = arr;
      resetPlayroom(defaultArray);
    });
  }

  // Toggle Breakpoints in Sandbox
  const btnToggleBp = document.getElementById('btn-toggle-breakpoint');
  const inputBpLine = document.getElementById('input-breakpoint-line');
  const textActiveBp = document.getElementById('text-active-breakpoints');

  if (btnToggleBp && inputBpLine) {
    btnToggleBp.addEventListener('click', () => {
      const lineNum = parseInt(inputBpLine.value.trim(), 10);
      if (isNaN(lineNum) || lineNum < 1) {
        alert('Please enter a valid line number for the breakpoint.');
        return;
      }
      if (activeBreakpoints.has(lineNum)) {
        activeBreakpoints.delete(lineNum);
      } else {
        activeBreakpoints.add(lineNum);
      }
      inputBpLine.value = '';
      if (textActiveBp) {
        textActiveBp.textContent = activeBreakpoints.size > 0
          ? Array.from(activeBreakpoints).sort((a, b) => a - b).join(', ')
          : 'None';
      }
    });
  }

  // Toggle Sandbox Mode
  if (btnToggleSandbox) {
    btnToggleSandbox.addEventListener('click', () => {
      const isSandboxHidden = sandboxContainer.classList.contains('hidden');
      if (isSandboxHidden) {
        // Switch to sandbox mode
        sandboxContainer.classList.remove('hidden');
        pseudocodeContainer.classList.add('hidden');
        btnToggleSandbox.textContent = 'PSEUDOCODE MODE';
        if (labelCodeType) labelCodeType.textContent = 'SANDBOX';

        // Populate textarea with current algorithm's generator function code
        if (!sandboxTextarea.value.trim()) {
          sandboxTextarea.value = currentAlgorithm.generator.toString();
        }
        syncHighlight();
      } else {
        // Switch to pseudocode mode
        sandboxContainer.classList.add('hidden');
        pseudocodeContainer.classList.remove('hidden');
        btnToggleSandbox.textContent = 'SANDBOX MODE';
        if (labelCodeType) labelCodeType.textContent = 'PSEUDOCODE';
      }
    });
  }

  // ── Syntax Highlighter ──────────────────────────────────────────────────
  function syncHighlight() {
    const highlightEl = document.getElementById('sandbox-highlight');
    if (!sandboxTextarea || !highlightEl) return;
    const raw = sandboxTextarea.value;
    const escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const highlighted = escaped
      // Single-line comments
      .replace(/((\/\/)[^\n]*)/g, '<span class="sh-comment">$1</span>')
      // Strings (double, single, backtick)
      .replace(/("[^"\\]*"|'[^'\\]*'|`[^`\\]*`)/g, '<span class="sh-string">$1</span>')
      // yield keyword (before generic keywords)
      .replace(/\b(yield)\b/g, '<span class="sh-yield">$1</span>')
      // JS keywords
      .replace(/\b(function|const|let|var|return|if|else|for|while|do|break|continue|new|true|false|null|undefined|typeof|instanceof|import|export|default|class|extends|this|throw|try|catch|finally|of|in|async|await)\b/g, '<span class="sh-keyword">$1</span>')
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="sh-number">$1</span>');
    highlightEl.innerHTML = highlighted + '\n'; // trailing \n keeps scroll in sync
    // Mirror scroll
    highlightEl.scrollTop = sandboxTextarea.scrollTop;
    highlightEl.scrollLeft = sandboxTextarea.scrollLeft;
  }

  if (sandboxTextarea) {
    sandboxTextarea.addEventListener('input', syncHighlight);
    sandboxTextarea.addEventListener('scroll', syncHighlight);
    sandboxTextarea.addEventListener('keydown', syncHighlight);
  }

  function instrumentSandboxCode(code) {
    const firstBraceIndex = code.indexOf('{');
    if (firstBraceIndex === -1) return code;

    let instrumented =
      code.slice(0, firstBraceIndex + 1) +
      '\n  let _loopCount = 0;\n' +
      code.slice(firstBraceIndex + 1);

    const guard =
      'if (++_loopCount > 50000) { throw new Error("Potential infinite loop detected (limit of 50000 iterations exceeded). Execution aborted."); } ';

    // Combined single regex to match for, while, and do loops followed by open curly braces
    return instrumented.replace(
      /(for|while|do)\s*(\([^)]*\))?\s*\{/g,
      (match, type, cond) => {
        return `${type}${cond || ''} { ${guard}`;
      },
    );
  }

  // Run custom sandbox algorithm code using background Web Worker
  if (btnRunSandbox) {
    btnRunSandbox.addEventListener('click', () => {
      const userCode = sandboxTextarea.value.trim();
      if (!userCode) {
        alert('Please enter your algorithm generator function code.');
        return;
      }

      try {
        // Instrument user code to insert loop guards
        const instrumented = instrumentSandboxCode(userCode);

        // Retrieve target if searching
        let targetVal = undefined;
        if (currentAlgorithm.category === 'Searching') {
          const targetInput = document.getElementById('input-target');
          if (targetInput) {
            const parsedTarget = parseInt(targetInput.value.trim(), 10);
            if (!isNaN(parsedTarget)) {
              targetVal = parsedTarget;
            }
          }
        }

        // Web Worker background thread script
        const workerScript = `
          self.onmessage = function(e) {
            const { code, inputArr, targetVal } = e.data;
            try {
              const fn = new Function('return (' + code + ')')();
              if (typeof fn !== 'function') {
                throw new Error('Parsed code is not a function.');
              }
              const snapshots = fn(inputArr, targetVal);
              self.postMessage({ success: true, snapshots: snapshots });
            } catch(err) {
              self.postMessage({ success: false, error: err.message });
            }
          };
        `;

        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        worker.onmessage = (e) => {
          URL.revokeObjectURL(workerUrl);
          if (e.data.success) {
            currentAlgorithm.generator = () => e.data.snapshots;
            resetPlayroom(defaultArray, targetVal);
            appendConsoleLog('[WEB WORKER] Executed sandbox code asynchronously on background worker thread.');
            alert('Custom sandbox algorithm executed safely via Web Worker!');
          } else {
            console.error('Web Worker Sandbox error:', e.data.error);
            alert('Web Worker compilation/runtime error:\n' + e.data.error);
          }
        };

        worker.onerror = (err) => {
          URL.revokeObjectURL(workerUrl);
          console.error('Web Worker error:', err);
          alert('Web Worker error: ' + err.message);
        };

        worker.postMessage({
          code: instrumented,
          inputArr: [...defaultArray],
          targetVal: targetVal,
        });
      } catch (err) {
        console.error('Sandbox initialization error:', err);
        alert('Compilation error:\n' + err.message);
      }
    });
  }

  // Close Benchmark panel
  if (btnCloseBenchmark) {
    btnCloseBenchmark.addEventListener('click', () => {
      sandboxBenchmarkPanel.classList.add('hidden');
    });
  }

  // Benchmark sandbox algorithm code
  if (btnBenchmarkSandbox) {
    btnBenchmarkSandbox.addEventListener('click', () => {
      const userCode = sandboxTextarea.value.trim();
      if (!userCode) {
        alert(
          'Please enter your algorithm generator function code to benchmark.',
        );
        return;
      }

      try {
        const instrumented = instrumentSandboxCode(userCode);
        const compiledFn = new Function(`return (${instrumented})`)();
        if (typeof compiledFn !== 'function') {
          throw new Error('Parsed code is not a function.');
        }

        const sizes =
          currentAlgorithm.category === 'Pathfinding'
            ? [12, 24, 48, 96]
            : [10, 50, 100, 250, 500, 1000];
        const dataPoints = [];

        for (const size of sizes) {
          let testInput;
          if (currentAlgorithm.category === 'Pathfinding') {
            testInput = Array(size).fill(0);
            if (size > 2) {
              testInput[1] = 1;
              testInput[size - 2] = 2;
            }
          } else {
            testInput = Array.from({ length: size }, () =>
              Math.floor(Math.random() * size),
            );
          }

          let minTime = Infinity;
          for (let run = 0; run < 3; run++) {
            const t0 = performance.now();
            compiledFn([...testInput], 34);
            const t1 = performance.now();
            const elapsed = t1 - t0;
            if (elapsed < minTime) minTime = elapsed;
          }
          dataPoints.push({ size, time: minTime });
        }

        // Plot dynamically as SVG
        const width = 280;
        const height = 130;
        const padding = 25;
        const chartW = width - 2 * padding;
        const chartH = height - 2 * padding;

        const maxValX = sizes[sizes.length - 1];
        const maxValY = Math.max(...dataPoints.map((d) => d.time)) || 0.001;

        // Map data points to SVG coordinates
        const points = dataPoints.map((d) => {
          const x = padding + (d.size / maxValX) * chartW;
          const y = height - padding - (d.time / maxValY) * chartH;
          return { x, y, size: d.size, time: d.time };
        });

        // Path generator
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
          pathD += ` L ${points[i].x} ${points[i].y}`;
        }

        // Render ticks and dots
        let dotsHTML = '';
        points.forEach((p) => {
          dotsHTML += `
            <circle cx="${p.x}" cy="${p.y}" r="3" fill="#00f3ff">
              <title>Size: ${p.size}, Time: ${p.time.toFixed(4)}ms</title>
            </circle>
          `;
        });

        const svgHTML = `
          <svg width="${width}" height="${height}" class="overflow-visible">
            <!-- Grid lines -->
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#1e293b" stroke-width="1" />
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#1e293b" stroke-width="1" />
            
            <!-- Trend Line -->
            <path d="${pathD}" fill="none" stroke="#00f3ff" stroke-width="1.5" />
            
            <!-- Data Dots -->
            ${dotsHTML}
            
            <!-- Axis Labels -->
            <text x="${padding}" y="${height - 8}" fill="#64748b" font-size="8" font-family="monospace">0</text>
            <text x="${width - padding}" y="${height - 8}" fill="#64748b" font-size="8" font-family="monospace" text-anchor="end">${maxValX}</text>
            <text x="${padding - 5}" y="${padding + 5}" fill="#64748b" font-size="8" font-family="monospace" text-anchor="end">${maxValY.toFixed(2)}ms</text>
          </svg>
        `;

        benchmarkChartContainer.innerHTML = svgHTML;
        sandboxBenchmarkPanel.classList.remove('hidden');
      } catch (err) {
        console.error('Benchmark failed:', err);
        alert('Compilation or runtime error:\n' + err.message);
      }
    });
  }

  // Toggle Audio Mute Switch
  if (btnAudioToggle) {
    btnAudioToggle.addEventListener('click', () => {
      isAudioMuted = !isAudioMuted;
      if (audioToggleIcon) {
        audioToggleIcon.textContent = isAudioMuted ? '🔇' : '🔊';
      }

      // Initialize AudioContext on user interaction to comply with browser autoplay policies
      if (!isAudioMuted && !audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
    });
  }

  // Toggle Audio Settings Drawer
  if (btnAudioSettings && audioSettingsDrawer) {
    btnAudioSettings.addEventListener('click', () => {
      audioSettingsDrawer.classList.toggle('hidden');
    });
  }

  // Sound Waveform selection
  if (selectWaveform) {
    selectWaveform.addEventListener('change', (e) => {
      soundWaveform = e.target.value;
    });
  }

  // Sound Pitch Multiplier selection
  if (sliderPitch) {
    sliderPitch.addEventListener('input', (e) => {
      soundPitchMultiplier = parseFloat(e.target.value);
      if (textPitch) {
        textPitch.textContent = `${soundPitchMultiplier.toFixed(1)}x`;
      }
    });
  }

  // Download Debug Log
  if (btnExportLog) {
    btnExportLog.addEventListener('click', () => {
      const logs = Array.from(consoleLog.querySelectorAll('div'))
        .map((div) => div.textContent)
        .join('\n');
      if (!logs) {
        alert(
          'Execution logs are empty. Run the algorithm first to accumulate logs.',
        );
        return;
      }

      const blob = new Blob([logs], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentAlgorithm.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_debug_log.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Edit Narration Text on double click
  if (narrativeText) {
    narrativeText.addEventListener('dblclick', () => {
      // Prevent editing if animation is currently playing
      if (isPlaying) {
        alert('Please pause the playback first before editing narration.');
        return;
      }

      const currentDesc = snapshots[currentIndex]?.description || '';
      const input = document.createElement('textarea');
      input.value = currentDesc;
      input.className =
        'w-full bg-slate-950 text-xs font-mono text-cyan-400 border border-slate-900 rounded p-2 focus:outline-none focus:border-cyan-500 min-h-[44px]';

      // Swap elements
      const parent = narrativeText.parentNode;
      parent.replaceChild(input, narrativeText);
      input.focus();

      const saveChanges = () => {
        const newVal = input.value.trim();
        if (newVal && snapshots[currentIndex]) {
          snapshots[currentIndex].description = newVal;
          narrativeText.textContent = newVal;
        }
        parent.replaceChild(narrativeText, input);
      };

      input.addEventListener('blur', saveChanges);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          saveChanges();
        }
        if (e.key === 'Escape') {
          parent.replaceChild(narrativeText, input);
        }
      });
    });
  }

  // Interactive pathfinding grid drawing events
  let isPaintingWeight = false;
  const btnTogglePaint = document.getElementById('btn-toggle-paint');
  if (btnTogglePaint) {
    btnTogglePaint.addEventListener('click', () => {
      isPaintingWeight = !isPaintingWeight;
      btnTogglePaint.textContent = isPaintingWeight ? 'Tool: Weight (5)' : 'Tool: Wall';
    });
  }

  if (barsContainer) {
    barsContainer.addEventListener('mousedown', (e) => {
      if (currentAlgorithm.category !== 'Pathfinding') return;
      const cell = e.target.closest('.grid-cell');
      if (!cell) return;

      const index = parseInt(cell.dataset.index, 10);
      if (isNaN(index)) return;

      // Do not allow drawing over start (index 25) or end (index 70)
      if (index === 25 || index === 70) return;

      const targetType = isPaintingWeight ? 6 : 3;
      if (defaultArray[index] === targetType) {
        isDrawingWall = false;
        defaultArray[index] = 0;
      } else {
        isDrawingWall = true;
        defaultArray[index] = targetType;
      }

      isGridMouseDown = true;
      resetPlayroom(defaultArray);
    });

    barsContainer.addEventListener('mouseover', (e) => {
      if (currentAlgorithm.category !== 'Pathfinding' || !isGridMouseDown)
        return;
      const cell = e.target.closest('.grid-cell');
      if (!cell) return;

      const index = parseInt(cell.dataset.index, 10);
      if (isNaN(index)) return;

      if (index === 25 || index === 70) return;

      const targetType = isPaintingWeight ? 6 : 3;
      const newType = isDrawingWall ? targetType : 0;
      if (defaultArray[index] !== newType) {
        defaultArray[index] = newType;
        resetPlayroom(defaultArray);
      }
    });

    window.addEventListener('mouseup', () => {
      isGridMouseDown = false;
    });
  }
}

export function loadPresetsDropdown() {
  const selectPreset = document.getElementById('select-preset');
  if (!selectPreset) return;
  selectPreset.innerHTML = `
    <option value="">-- Presets --</option>
    <option value="23,45,12,56,34,18,9,41">Default Array</option>
  `;
  const storedPresets = JSON.parse(
    localStorage.getItem('algovisual_presets') || '[]',
  );
  storedPresets.forEach((preset) => {
    const opt = document.createElement('option');
    opt.value = preset.array;
    opt.textContent = preset.name;
    selectPreset.appendChild(opt);
  });
}

function playToneForValue(value) {
  if (isAudioMuted) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume context if suspended (browser autoplay restrictions)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Map value (1 to 100) to frequency range (220Hz to 880Hz)
    const minFreq = 220;
    const maxFreq = 880;
    const freq =
      minFreq +
      (Math.max(0, Math.min(99, value - 1)) / 99) * (maxFreq - minFreq);

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = soundWaveform;
    osc.frequency.setValueAtTime(freq * soundPitchMultiplier, audioCtx.currentTime);

    // Dynamic volume ramp to prevent audio clicks/pops
    gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioCtx.currentTime + 0.12,
    );

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (err) {
    console.error('Audio sonification synthesis failed:', err);
  }
}
