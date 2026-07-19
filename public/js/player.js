// public/js/player.js

let snapshots = [];
let currentIndex = 0;
let isPlaying = false;
let playbackInterval = null;
let speedDelay = 600; // ms per step (default)
let currentAlgorithm = null;
let defaultArray = [23, 45, 12, 56, 34, 18, 9, 41];

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

    // Setup title and description
    document.getElementById('algo-title').textContent = currentAlgorithm.name;
    document.getElementById('algo-desc').textContent = currentAlgorithm.description;

    // Populate pseudocode lines
    renderPseudocode(currentAlgorithm.pseudocode);

    // Show/hide target input depending on algorithm category
    const targetInputContainer = document.getElementById('container-target-input');
    let initialTarget = undefined;
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
  renderBars(snapshot.array, snapshot.highlights, snapshot.pointers, currentAlgorithm.category);

  // 2. Highlight active pseudocode line
  updateCodeHighlight(snapshot.executingLine);

  // 3. Update narration text
  narrativeText.textContent = snapshot.description;

  // 4. Append log to console
  appendConsoleLog(snapshot.description);

  // 5. Update registers and metrics HUDs
  updateTelemetryHUD(snapshot);

  // 6. Update disabled states of timeline buttons
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === snapshots.length - 1;
}

function renderBars(arr, highlights, pointers, category) {
  barsContainer.innerHTML = '';
  
  if (category === 'Searching') {
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
    // Apply sorting bars layout styles
    barsContainer.className = "bar-container gap-2 sm:gap-4 justify-center items-end h-[220px]";
    const maxVal = Math.max(...arr, 1);
    
    arr.forEach((value, index) => {
      const col = document.createElement('div');
      col.className = 'flex-1 flex flex-col justify-end items-center h-full relative';
      
      let tubeClass = 'bar-tube normal';
      if (highlights.includes(index)) {
        tubeClass = 'bar-tube highlight';
      }
      
      // If we are at the last snapshot, highlight the completed state
      if (currentIndex === snapshots.length - 1) {
        tubeClass = 'bar-tube completed';
      }
      
      // Render pointer label badges above sorting bars
      let pointerLabels = [];
      for (const [pName, pIndex] of Object.entries(pointers)) {
        if (pIndex === index) {
          pointerLabels.push(pName);
        }
      }
      const pointerHtml = pointerLabels.length > 0
        ? `<div class="pointer-badge generic" style="top: -24px;">${pointerLabels.join(', ')}</div>`
        : '';
        
      const heightPercent = (value / maxVal) * 100;
      
      col.innerHTML = `
        ${pointerHtml}
        <div class="${tubeClass}" style="height: ${heightPercent}%;"></div>
        <span class="text-slate-400 font-technical text-xs mt-2 select-none font-semibold font-mono">${value}</span>
      `;
      barsContainer.appendChild(col);
    });
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
