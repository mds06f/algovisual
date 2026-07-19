// public/js/player.js

let snapshots = [];
let currentIndex = 0;
let isPlaying = false;
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
let prevBtn;
let nextBtn;
let speedSlider;
let speedValueText;
let customInput;
let btnApplyInput;
let narrativeText;
let selectPreset;
let btnSavePreset;
let btnToggleSandbox;
let btnRunSandbox;
let sandboxContainer;
let sandboxTextarea;
let labelCodeType;
let btnAudioToggle;
let audioToggleIcon;
let audioCtx = null;
let isAudioMuted = true;
let btnExportLog;
let stepCounterText;

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
    prevBtn = document.getElementById('btn-prev');
    nextBtn = document.getElementById('btn-next');
    speedSlider = document.getElementById('slider-speed');
    speedValueText = document.getElementById('text-speed');
    customInput = document.getElementById('input-custom');
    btnApplyInput = document.getElementById('btn-apply-input');
    narrativeText = document.getElementById('narrative-text');
    selectPreset = document.getElementById('select-preset');
    btnSavePreset = document.getElementById('btn-save-preset');
    btnToggleSandbox = document.getElementById('btn-toggle-sandbox');
    btnRunSandbox = document.getElementById('btn-run-sandbox');
    sandboxContainer = document.getElementById('sandbox-container');
    sandboxTextarea = document.getElementById('sandbox-textarea');
    labelCodeType = document.getElementById('label-code-type');
    btnAudioToggle = document.getElementById('btn-audio-toggle');
    audioToggleIcon = document.getElementById('audio-toggle-icon');
    btnExportLog = document.getElementById('btn-export-log');
    stepCounterText = document.getElementById('step-counter-text');

    // Clear sandbox editor contents and return view to default state
    if (sandboxTextarea) sandboxTextarea.value = '';
    if (sandboxContainer) sandboxContainer.classList.add('hidden');
    if (pseudocodeContainer) pseudocodeContainer.classList.remove('hidden');
    if (btnToggleSandbox) btnToggleSandbox.textContent = "Sandbox Mode";
    if (labelCodeType) labelCodeType.textContent = "PSEUDOCODE";

    // Setup title and description
    document.getElementById('algo-title').textContent = currentAlgorithm.name;
    document.getElementById('algo-desc').textContent = currentAlgorithm.description;

    // Populate pseudocode lines
    renderPseudocode(currentAlgorithm.pseudocode);

    // Show/hide target input depending on algorithm category
    const targetInputContainer = document.getElementById('container-target-input');
    const customInputsContainer = document.getElementById('container-custom-inputs');
    let initialTarget = undefined;
    
    if (customInputsContainer) {
      if (currentAlgorithm.category === 'Pathfinding') {
        customInputsContainer.classList.add('hidden');
      } else {
        customInputsContainer.classList.remove('hidden');
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

    // Initial setup
    resetPlayroom(defaultArray, initialTarget);

    // Bind event listeners
    bindEvents();

    // Load presets dropdown from localStorage
    loadPresetsDropdown();
  } catch (err) {
    console.error("Failed to initialize visualizer player:", err);
  }
}

function renderPseudocode(lines) {
  pseudocodeContainer.innerHTML = '';
  lines.forEach((line, index) => {
    const lineElem = document.createElement('div');
    lineElem.className = 'px-4 py-1.5 text-xs sm:text-sm font-mono text-slate-400 border-l-4 border-transparent transition duration-150';
    // Match indentations
    const spaces = line.match(/^\s*/)[0].length;
    lineElem.style.paddingLeft = `${Math.max(16, spaces * 8 + 16)}px`;
    lineElem.textContent = line.trim();
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
  renderBars(snapshot.array, snapshot.highlights, snapshot.pointers, currentAlgorithm.category, snapshot.auxLeft, snapshot.auxRight, snapshot.auxLeftStart);

  // 2. Highlight active pseudocode line
  updateCodeHighlight(snapshot.executingLine);

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

function renderBars(arr, highlights, pointers, category, auxLeft = null, auxRight = null, auxLeftStart = -1) {
  barsContainer.innerHTML = '';
  
  if (category === 'Pathfinding') {
    barsContainer.className = "grid-visualizer";
    
    arr.forEach((cellType, index) => {
      const cell = document.createElement('div');
      let cellClass = 'grid-cell';
      if (cellType === 1) cellClass += ' start';
      else if (cellType === 2) cellClass += ' end';
      else if (cellType === 3) cellClass += ' wall';
      else if (cellType === 4) cellClass += ' visited';
      else if (cellType === 5) cellClass += ' path';
      
      cell.className = cellClass;
      cell.dataset.index = index;
      cell.addEventListener('dragstart', (e) => e.preventDefault());
      
      if (cellType === 1) {
        cell.innerHTML = '<span class="text-[10px] font-bold text-white flex items-center justify-center h-full select-none">S</span>';
      } else if (cellType === 2) {
        cell.innerHTML = '<span class="text-[10px] font-bold text-white flex items-center justify-center h-full select-none">E</span>';
      }
      
      barsContainer.appendChild(cell);
    });
  } else if (category === 'Searching') {
    // Apply array-tape layout styles
    barsContainer.className = "array-tape";
    
    arr.forEach((value, index) => {
      const cell = document.createElement('div');
      
      let cellClass = 'array-cell normal';
      if (highlights.includes(index)) {
        cellClass = 'array-cell highlight';
      }
      if (pointers.hasOwnProperty('mid') && pointers.mid === index) {
        cellClass = 'array-cell mid';
      }
      
      // Determine if index is out of search space bounds [low, high]
      const hasLow = pointers.hasOwnProperty('low');
      const hasHigh = pointers.hasOwnProperty('high');
      if ((hasLow && index < pointers.low) || (hasHigh && index > pointers.high)) {
        cellClass += ' diagonal-hatch';
      }
      
      cell.className = cellClass;
      
      // Render pointers labels dynamically above/below the cell
      let badgesHtml = '';
      for (const [pName, pIndex] of Object.entries(pointers)) {
        if (pIndex === index) {
          const badgeType = pName === 'low' ? 'low' : pName === 'high' ? 'high' : pName === 'mid' ? 'mid' : 'generic';
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
    barsContainer.className = "flex flex-col gap-2 w-full";
    const maxVal = Math.max(...arr, 1);

    // Main bar chart row
    const mainRow = document.createElement('div');
    mainRow.className = 'bar-container gap-2 sm:gap-4 justify-center items-end h-[220px]';

    arr.forEach((value, index) => {
      const col = document.createElement('div');
      col.className = 'flex-1 flex flex-col justify-end items-center h-full relative';

      let tubeClass = 'bar-tube normal';
      if (highlights.includes(index)) tubeClass = 'bar-tube highlight';
      if (currentIndex === snapshots.length - 1) tubeClass = 'bar-tube completed';

      let pointerLabels = [];
      for (const [pName, pIndex] of Object.entries(pointers)) {
        if (pIndex === index) pointerLabels.push(pName);
      }
      const pointerHtml = pointerLabels.length > 0
        ? `<div class="pointer-badge generic" style="top:-24px">${pointerLabels.join(', ')}</div>` : '';

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
      auxLabel.className = 'text-[9px] text-slate-500 font-technical uppercase tracking-wider mb-1 px-1';
      auxLabel.textContent = `Aux Split — Left[${auxLeft.length}]  |  Right[${auxRight.length}]`;
      auxRow.appendChild(auxLabel);

      const auxCanvas = document.createElement('div');
      auxCanvas.className = 'flex items-end gap-1 h-[80px] border-t border-slate-900 pt-2';

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

function updateCodeHighlight(activeLineIndex) {
  // Reset all lines
  const lines = pseudocodeContainer.children;
  for (let i = 0; i < lines.length; i++) {
    lines[i].classList.remove('code-line-active');
  }

  // Set active line
  const activeLine = document.getElementById(`code-line-${activeLineIndex}`);
  if (activeLine) {
    activeLine.classList.add('code-line-active');
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
  if (compEl) compEl.textContent = snapshot.stats ? snapshot.stats.comparisons : 0;
  if (swapsEl) swapsEl.textContent = snapshot.stats ? snapshot.stats.swaps : 0;
  if (complexityTimeEl) complexityTimeEl.textContent = snapshot.stats ? snapshot.stats.complexity.time : 'N/A';
  if (complexitySpaceEl) complexitySpaceEl.textContent = snapshot.stats ? snapshot.stats.complexity.space : 'N/A';
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
  logItem.className = 'py-1 text-[11px] text-slate-300 font-mono flex items-start gap-2 border-b border-slate-900/40';
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

function bindEvents() {
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      pauseAnimation();
    } else {
      startAnimation();
    }
  });

  prevBtn.addEventListener('click', stepPrev);
  nextBtn.addEventListener('click', stepNext);

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
    document.querySelectorAll('.speed-preset-btn').forEach(btn => {
      const btnRate = parseFloat(btn.dataset.speed);
      btn.classList.toggle('speed-preset-active', btnRate === rate);
    });
  });

  // Speed preset buttons
  document.querySelectorAll('.speed-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rate = parseFloat(btn.dataset.speed);

      // Clamp to slider range (0.5 - 3.0); 5x is an extended preset beyond slider
      const sliderRate = Math.min(rate, 3.0);
      speedSlider.value = sliderRate;
      speedDelay = Math.round(600 / rate);
      speedValueText.textContent = `${rate}x`;

      // Toggle active highlight
      document.querySelectorAll('.speed-preset-btn').forEach(b => b.classList.remove('speed-preset-active'));
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
    const parsed = val.split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));

    if (parsed.length < 3 || parsed.length > 15) {
      alert("Please enter between 3 and 15 numbers.");
      return;
    }

    let targetVal = undefined;
    if (currentAlgorithm.category === 'Searching') {
      const targetInput = document.getElementById('input-target');
      if (targetInput) {
        const parsedTarget = parseInt(targetInput.value.trim(), 10);
        if (isNaN(parsedTarget)) {
          alert("Please enter a valid target number.");
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

  // Click event on btn-save-preset
  if (btnSavePreset) {
    btnSavePreset.addEventListener('click', () => {
      const val = customInput.value.trim();
      if (!val) {
        alert("Please enter a valid comma-separated array first.");
        return;
      }
      
      const parsed = val.split(',')
        .map(v => parseInt(v.trim(), 10))
        .filter(v => !isNaN(v));

      if (parsed.length < 3 || parsed.length > 15) {
        alert("Please enter between 3 and 15 numbers.");
        return;
      }

      const presetName = prompt("Enter a name for this custom array preset:");
      if (!presetName) return;
      const trimmedName = presetName.trim();
      if (!trimmedName) return;

      const storedPresets = JSON.parse(localStorage.getItem('algovisual_presets') || '[]');
      storedPresets.push({ name: trimmedName, array: val });
      localStorage.setItem('algovisual_presets', JSON.stringify(storedPresets));
      
      loadPresetsDropdown();
      // Select the newly added option
      if (selectPreset) {
        selectPreset.value = val;
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
        btnToggleSandbox.textContent = "PSEUDOCODE MODE";
        if (labelCodeType) labelCodeType.textContent = "SANDBOX";
        
        // Populate textarea with current algorithm's generator function code
        if (!sandboxTextarea.value.trim()) {
          sandboxTextarea.value = currentAlgorithm.generator.toString();
        }
      } else {
        // Switch to pseudocode mode
        sandboxContainer.classList.add('hidden');
        pseudocodeContainer.classList.remove('hidden');
        btnToggleSandbox.textContent = "SANDBOX MODE";
        if (labelCodeType) labelCodeType.textContent = "PSEUDOCODE";
      }
    });
  }

  // Run custom sandbox algorithm code
  if (btnRunSandbox) {
    btnRunSandbox.addEventListener('click', () => {
      const userCode = sandboxTextarea.value.trim();
      if (!userCode) {
        alert("Please enter your algorithm generator function code.");
        return;
      }
      
      try {
        // Evaluate the function body typed in the textarea
        const compiledFn = new Function(`return (${userCode})`)();
        
        if (typeof compiledFn !== 'function') {
          throw new Error("Parsed code is not a function. Make sure it is formatted as: function(arr, targetVal) { ... }");
        }
        
        // Set as the current generator
        currentAlgorithm.generator = compiledFn;
        
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
        
        // Re-initialize playroom
        resetPlayroom(defaultArray, targetVal);
        alert("Custom sandbox algorithm loaded successfully!");
      } catch (err) {
        console.error("Sandbox evaluation error:", err);
        alert("Compilation or runtime error:\n" + err.message);
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

  // Download Debug Log
  if (btnExportLog) {
    btnExportLog.addEventListener('click', () => {
      const logs = Array.from(consoleLog.querySelectorAll('div'))
        .map(div => div.textContent)
        .join('\n');
      if (!logs) {
        alert("Execution logs are empty. Run the algorithm first to accumulate logs.");
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
        alert("Please pause the playback first before editing narration.");
        return;
      }
      
      const currentDesc = snapshots[currentIndex]?.description || '';
      const input = document.createElement('textarea');
      input.value = currentDesc;
      input.className = "w-full bg-slate-950 text-xs font-mono text-cyan-400 border border-slate-900 rounded p-2 focus:outline-none focus:border-cyan-500 min-h-[44px]";
      
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
  if (barsContainer) {
    barsContainer.addEventListener('mousedown', (e) => {
      if (currentAlgorithm.category !== 'Pathfinding') return;
      const cell = e.target.closest('.grid-cell');
      if (!cell) return;

      const index = parseInt(cell.dataset.index, 10);
      if (isNaN(index)) return;

      // Do not allow drawing over start (index 25) or end (index 70)
      if (index === 25 || index === 70) return;

      // Determine drawing mode (draw wall vs erase wall)
      if (defaultArray[index] === 3) {
        isDrawingWall = false;
        defaultArray[index] = 0;
      } else {
        isDrawingWall = true;
        defaultArray[index] = 3;
      }

      isGridMouseDown = true;
      resetPlayroom(defaultArray);
    });

    barsContainer.addEventListener('mouseover', (e) => {
      if (currentAlgorithm.category !== 'Pathfinding' || !isGridMouseDown) return;
      const cell = e.target.closest('.grid-cell');
      if (!cell) return;

      const index = parseInt(cell.dataset.index, 10);
      if (isNaN(index)) return;

      if (index === 25 || index === 70) return;

      const newType = isDrawingWall ? 3 : 0;
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
  const storedPresets = JSON.parse(localStorage.getItem('algovisual_presets') || '[]');
  storedPresets.forEach(preset => {
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
    const freq = minFreq + (Math.max(0, Math.min(99, value - 1)) / 99) * (maxFreq - minFreq);

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Dynamic volume ramp to prevent audio clicks/pops
    gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (err) {
    console.error("Audio sonification synthesis failed:", err);
  }
}
