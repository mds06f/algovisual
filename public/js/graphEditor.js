// public/js/graphEditor.js
// Interactive Graph Editor – vertex placement, weighted edge creation, delete, undo

// ── State ──────────────────────────────────────────────────────────────────────
let vertices = [];    // { id, label, x, y }
let edgeList  = [];   // { u, v, w, directed }
let nextId    = 0;
let mode      = 'vertex';  // 'vertex' | 'edge' | 'delete' | 'pan'
let isDirected = false;
let isWeighted = true;
let selectedSource = null; // for edge mode
let dragTarget = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let history = [];   // stack of { vertices, edges } snapshots
let pendingEdge = null; // { u, v } awaiting weight input

const NODE_R = 20;
const LABEL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ── DOM Refs ───────────────────────────────────────────────────────────────────
const canvas      = document.getElementById('graph-editor-canvas');
const ctx         = canvas.getContext('2d');
const statusBar   = document.getElementById('status-bar');
const edgeHint    = document.getElementById('edge-hint');
const emptyHint   = document.getElementById('canvas-empty-hint');
const adjList     = document.getElementById('adjacency-list');
const statV       = document.getElementById('stat-vertices');
const statE       = document.getElementById('stat-edges');
const statDensity = document.getElementById('stat-density');
const statConnected=document.getElementById('stat-connected');
const weightModal = document.getElementById('weight-modal');
const weightInput = document.getElementById('input-weight');
const weightDesc  = document.getElementById('weight-modal-desc');
const selectStart = document.getElementById('select-start-node');
const radioUndir  = document.getElementById('radio-undirected');
const radioDirec  = document.getElementById('radio-directed');
const chkWeighted = document.getElementById('checkbox-weighted');

// ── Canvas size sync ───────────────────────────────────────────────────────────
function resizeCanvas() {
  const wrapper = document.getElementById('canvas-wrapper');
  canvas.width  = wrapper.clientWidth;
  canvas.height = wrapper.clientHeight;
  draw();
}

const ro = new ResizeObserver(resizeCanvas);
ro.observe(document.getElementById('canvas-wrapper'));
window.addEventListener('load', resizeCanvas);

// ── Draw loop ──────────────────────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawEdges();
  drawVertices();
  emptyHint.style.display = vertices.length === 0 ? 'flex' : 'none';
}

function drawEdges() {
  edgeList.forEach(e => {
    const u = vertices.find(v => v.id === e.u);
    const v = vertices.find(v => v.id === e.v);
    if (!u || !v) return;

    ctx.save();
    ctx.strokeStyle = isWeighted ? '#f59e0b' : '#22d3ee';
    ctx.lineWidth = 2;
    ctx.shadowColor = isWeighted ? 'rgba(245,158,11,0.35)' : 'rgba(34,211,238,0.35)';
    ctx.shadowBlur = 6;

    // Draw line
    ctx.beginPath();
    ctx.moveTo(u.x, u.y);
    ctx.lineTo(v.x, v.y);
    ctx.stroke();

    // Draw arrow for directed graph
    if (isDirected || e.directed) {
      const angle = Math.atan2(v.y - u.y, v.x - u.x);
      const ax = v.x - Math.cos(angle) * (NODE_R + 3);
      const ay = v.y - Math.sin(angle) * (NODE_R + 3);
      ctx.fillStyle = isWeighted ? '#f59e0b' : '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 10 * Math.cos(angle - 0.4), ay - 10 * Math.sin(angle - 0.4));
      ctx.lineTo(ax - 10 * Math.cos(angle + 0.4), ay - 10 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
    }

    // Draw weight label
    if (isWeighted && e.w !== undefined) {
      const mx = (u.x + v.x) / 2;
      const my = (u.y + v.y) / 2;
      const angle = Math.atan2(v.y - u.y, v.x - u.x);
      const nx = mx + Math.sin(angle) * -14;
      const ny = my - Math.cos(angle) * -14;

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(9,13,22,0.82)';
      ctx.beginPath();
      ctx.roundRect(nx - 13, ny - 9, 26, 16, 3);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.w, nx, ny);
    }

    ctx.restore();
  });
}

function drawVertices() {
  vertices.forEach(v => {
    const isSelected = selectedSource && selectedSource.id === v.id;
    const isHovered  = mode === 'delete' && hoveredVertex && hoveredVertex.id === v.id;

    ctx.save();

    // Outer glow
    ctx.shadowColor = isSelected ? '#f59e0b' : isHovered ? '#ef4444' : '#00e1d9';
    ctx.shadowBlur  = isSelected || isHovered ? 18 : 10;

    // Circle
    const gradient = ctx.createRadialGradient(v.x - 5, v.y - 5, 2, v.x, v.y, NODE_R);
    if (isSelected) {
      gradient.addColorStop(0, '#fde68a');
      gradient.addColorStop(1, '#d97706');
    } else if (isHovered) {
      gradient.addColorStop(0, '#fca5a5');
      gradient.addColorStop(1, '#dc2626');
    } else {
      gradient.addColorStop(0, '#67e8f9');
      gradient.addColorStop(1, '#0891b2');
    }

    ctx.beginPath();
    ctx.arc(v.x, v.y, NODE_R, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#f59e0b' : isHovered ? '#ef4444' : '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Label
    ctx.shadowBlur = 0;
    ctx.fillStyle  = '#fff';
    ctx.font       = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(v.label, v.x, v.y);

    ctx.restore();
  });
}

// ── Hover state (delete mode) ──────────────────────────────────────────────────
let hoveredVertex = null;
canvas.addEventListener('mousemove', e => {
  const [cx, cy] = canvasCoords(e);
  if (mode === 'delete') {
    hoveredVertex = hitVertex(cx, cy);
    canvas.style.cursor = hoveredVertex ? 'no-drop' : 'default';
    draw();
  } else if (mode === 'pan' && dragTarget) {
    dragTarget.x = cx + dragOffsetX;
    dragTarget.y = cy + dragOffsetY;
    draw();
  } else if (mode === 'vertex') {
    canvas.style.cursor = 'crosshair';
  } else if (mode === 'edge') {
    canvas.style.cursor = hitVertex(cx, cy) ? 'pointer' : 'crosshair';
  }
});

canvas.addEventListener('mouseleave', () => {
  hoveredVertex = null;
  draw();
});

// ── Helpers ────────────────────────────────────────────────────────────────────
function canvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
}

function hitVertex(x, y) {
  return vertices.find(v => Math.hypot(v.x - x, v.y - y) <= NODE_R + 2) || null;
}

function nextLabel() {
  const used = new Set(vertices.map(v => v.label));
  for (const c of LABEL_LETTERS) if (!used.has(c)) return c;
  // fallback: numbered
  let i = 1;
  while (used.has(`V${i}`)) i++;
  return `V${i}`;
}

function snapshot() {
  history.push({
    vertices: JSON.parse(JSON.stringify(vertices)),
    edges:    JSON.parse(JSON.stringify(edgeList))
  });
  if (history.length > 50) history.shift();
}

// ── Main click handler ─────────────────────────────────────────────────────────
canvas.addEventListener('mousedown', e => {
  const [x, y] = canvasCoords(e);

  if (mode === 'vertex') {
    if (!hitVertex(x, y)) {
      snapshot();
      vertices.push({ id: nextId++, label: nextLabel(), x, y });
      updateUI();
    }
  } else if (mode === 'edge') {
    const hit = hitVertex(x, y);
    if (!hit) return;
    if (!selectedSource) {
      selectedSource = hit;
      statusBar.textContent = `Edge Mode: Source → ${hit.label} selected. Now click target vertex.`;
    } else {
      if (hit.id === selectedSource.id) { selectedSource = null; updateStatusBar(); return; }
      // check duplicate
      const exists = edgeList.find(ed =>
        (ed.u === selectedSource.id && ed.v === hit.id) ||
        (!isDirected && ed.u === hit.id && ed.v === selectedSource.id)
      );
      if (exists) {
        statusBar.textContent = `⚠ Edge ${selectedSource.label} ↔ ${hit.label} already exists.`;
        selectedSource = null;
        setTimeout(updateStatusBar, 1500);
        draw();
        return;
      }
      if (isWeighted) {
        pendingEdge = { u: selectedSource.id, v: hit.id };
        weightDesc.textContent = `Edge: ${selectedSource.label} → ${hit.label}`;
        weightInput.value = 1;
        weightModal.classList.remove('hidden');
        weightInput.focus();
        weightInput.select();
      } else {
        snapshot();
        edgeList.push({ u: selectedSource.id, v: hit.id, w: 1, directed: isDirected });
        selectedSource = null;
        updateUI();
      }
    }
    draw();
  } else if (mode === 'delete') {
    const hit = hitVertex(x, y);
    if (hit) {
      snapshot();
      vertices = vertices.filter(v => v.id !== hit.id);
      edgeList = edgeList.filter(e => e.u !== hit.id && e.v !== hit.id);
      if (selectedSource && selectedSource.id === hit.id) selectedSource = null;
      updateUI();
    } else {
      // Try to delete an edge
      const edgeIdx = findEdgeNear(x, y);
      if (edgeIdx >= 0) {
        snapshot();
        edgeList.splice(edgeIdx, 1);
        updateUI();
      }
    }
  } else if (mode === 'pan') {
    const hit = hitVertex(x, y);
    if (hit) {
      dragTarget  = hit;
      dragOffsetX = hit.x - x;
      dragOffsetY = hit.y - y;
    }
  }
});

canvas.addEventListener('mouseup', () => { dragTarget = null; });

// ── Edge proximity detection (for delete) ─────────────────────────────────────
function findEdgeNear(px, py, threshold = 8) {
  for (let i = edgeList.length - 1; i >= 0; i--) {
    const e = edgeList[i];
    const u = vertices.find(v => v.id === e.u);
    const v = vertices.find(v => v.id === e.v);
    if (!u || !v) continue;
    const d = distToSegment(px, py, u.x, u.y, v.x, v.y);
    if (d < threshold) return i;
  }
  return -1;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// ── Weight Modal ───────────────────────────────────────────────────────────────
document.getElementById('btn-confirm-weight').addEventListener('click', () => {
  if (!pendingEdge) return;
  const w = parseInt(weightInput.value, 10) || 1;
  snapshot();
  edgeList.push({ u: pendingEdge.u, v: pendingEdge.v, w, directed: isDirected });
  selectedSource = null;
  pendingEdge = null;
  weightModal.classList.add('hidden');
  updateUI();
});

document.getElementById('btn-cancel-weight').addEventListener('click', () => {
  pendingEdge    = null;
  selectedSource = null;
  weightModal.classList.add('hidden');
  updateStatusBar();
  draw();
});

weightInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-confirm-weight').click();
  if (e.key === 'Escape') document.getElementById('btn-cancel-weight').click();
});

// ── Mode buttons ───────────────────────────────────────────────────────────────
document.getElementById('mode-buttons').addEventListener('click', e => {
  const btn = e.target.closest('[data-mode]');
  if (!btn) return;
  setMode(btn.dataset.mode);
});

function setMode(m) {
  mode = m;
  selectedSource = null;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active-mode'));
  document.querySelector(`[data-mode="${m}"]`)?.classList.add('active-mode');
  updateStatusBar();
  draw();
}

function updateStatusBar() {
  const msgs = {
    vertex: 'Mode: Add Vertex — Click on canvas to place a vertex',
    edge:   'Mode: Add Edge — Click a source, then a target vertex',
    delete: 'Mode: Delete — Click a vertex or edge to remove it',
    pan:    'Mode: Pan/Drag — Click and drag vertices to reposition'
  };
  statusBar.textContent = msgs[mode] || '';
  edgeHint.classList.toggle('hidden', mode !== 'edge');
  canvas.style.cursor = mode === 'pan' ? 'grab' : mode === 'delete' ? 'default' : 'crosshair';
}

// ── Graph Type toggles ─────────────────────────────────────────────────────────
radioUndir.addEventListener('change', () => { isDirected = false; draw(); });
radioDirec.addEventListener('change', () => { isDirected = true; draw(); });
chkWeighted.addEventListener('change', () => { isWeighted = chkWeighted.checked; draw(); });

// ── Undo ──────────────────────────────────────────────────────────────────────
document.getElementById('btn-undo').addEventListener('click', () => {
  if (!history.length) return;
  const prev = history.pop();
  vertices  = prev.vertices;
  edgeList  = prev.edges;
  nextId    = vertices.length ? Math.max(...vertices.map(v => v.id)) + 1 : 0;
  selectedSource = null;
  updateUI();
});

// ── Clear ─────────────────────────────────────────────────────────────────────
document.getElementById('btn-clear').addEventListener('click', () => {
  if (!vertices.length && !edgeList.length) return;
  snapshot();
  vertices  = [];
  edgeList  = [];
  nextId    = 0;
  selectedSource = null;
  updateUI();
});

// ── Load Sample Graph ─────────────────────────────────────────────────────────
document.getElementById('btn-sample').addEventListener('click', () => {
  snapshot();
  vertices = [];
  edgeList = [];
  nextId = 0;
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const labels = ['A','B','C','D','E','F'];
  labels.forEach((lbl, i) => {
    const angle = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
    vertices.push({ id: nextId++, label: lbl, x: cx + Math.cos(angle) * 130, y: cy + Math.sin(angle) * 110 });
  });
  const rawEdges = [[0,1,4],[0,2,2],[1,2,1],[1,3,5],[2,3,8],[2,4,10],[3,4,2],[3,5,6],[4,5,3]];
  rawEdges.forEach(([ui,vi,w]) => edgeList.push({ u: ui, v: vi, w, directed: false }));
  updateUI();
});

// ── Export JSON ───────────────────────────────────────────────────────────────
document.getElementById('btn-export-json').addEventListener('click', () => {
  const labelOf = id => vertices.find(v => v.id === id)?.label || id;
  const data = {
    directed: isDirected,
    weighted: isWeighted,
    vertices: vertices.map(v => ({ label: v.label, x: Math.round(v.x), y: Math.round(v.y) })),
    edges: edgeList.map(e => ({ u: labelOf(e.u), v: labelOf(e.v), w: e.w }))
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'graph.json'; a.click();
});

// ── Import JSON ───────────────────────────────────────────────────────────────
document.getElementById('input-import-json').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      snapshot();
      vertices = []; edgeList = []; nextId = 0;
      if (data.directed !== undefined) { isDirected = data.directed; document.querySelector(`input[name="graph-type"][value="${isDirected ? 'directed' : 'undirected'}"]`).checked = true; }
      if (data.weighted !== undefined) { isWeighted = data.weighted; chkWeighted.checked = isWeighted; }
      const labelToId = {};
      (data.vertices || []).forEach(v => {
        const id = nextId++;
        labelToId[v.label] = id;
        vertices.push({ id, label: v.label, x: v.x || 100, y: v.y || 100 });
      });
      (data.edges || []).forEach(e => {
        const uid = labelToId[e.u], vid = labelToId[e.v];
        if (uid !== undefined && vid !== undefined) edgeList.push({ u: uid, v: vid, w: e.w ?? 1, directed: isDirected });
      });
      updateUI();
    } catch (err) {
      alert('Invalid JSON file: ' + err.message);
    }
    e.target.value = '';
  };
  reader.readAsText(file);
});

// ── Run Algorithm ─────────────────────────────────────────────────────────────
document.getElementById('btn-run').addEventListener('click', () => {
  if (!vertices.length) { alert('Please add at least one vertex to the graph.'); return; }
  const algo  = document.getElementById('select-algo').value;
  const start = selectStart.value;
  const labelOf = id => vertices.find(v => v.id === id)?.label || id;
  const graphData = {
    vertices: vertices.map(v => v.label),
    edges: edgeList.map(e => ({ u: labelOf(e.u), v: labelOf(e.v), w: e.w })),
    directed: isDirected,
    start: start || vertices[0]?.label
  };
  // Store in sessionStorage so visualizer can pick it up
  sessionStorage.setItem('graphEditorData', JSON.stringify(graphData));
  const algoMap = { dijkstra: 'dijkstra', bfs: 'graphOps', dfs: 'graphOps' };
  window.location.href = `/visualizer?algo=${algoMap[algo] || 'graphOps'}&from=editor`;
});

// ── Update UI (adjacency list, stats, dropdowns) ──────────────────────────────
function updateUI() {
  draw();
  updateAdjacencyList();
  updateStats();
  updateStartDropdown();
}

function updateAdjacencyList() {
  const labelOf = id => vertices.find(v => v.id === id)?.label || `?${id}`;
  if (!vertices.length) { adjList.innerHTML = '<p class="text-slate-700 italic">Empty graph</p>'; return; }
  adjList.innerHTML = vertices.map(v => {
    const neighbors = edgeList
      .filter(e => e.u === v.id || (!isDirected && e.v === v.id))
      .map(e => {
        const nid = e.u === v.id ? e.v : e.u;
        return isWeighted ? `${labelOf(nid)}(${e.w})` : labelOf(nid);
      });
    return `<div class="py-0.5 border-b border-slate-900/50">
      <span class="text-[#00e1d9] font-bold">${v.label}</span>
      <span class="text-slate-600 mx-1">→</span>
      <span class="text-slate-400">${neighbors.length ? neighbors.join(', ') : '∅'}</span>
    </div>`;
  }).join('');
}

function updateStats() {
  const V = vertices.length;
  const E = edgeList.length;
  statV.textContent = V;
  statE.textContent = E;
  const maxEdges = isDirected ? V * (V - 1) : V * (V - 1) / 2;
  statDensity.textContent = `Density: ${maxEdges > 0 ? (E / maxEdges).toFixed(2) : '0.00'}`;
  statConnected.textContent = `Connected: ${V === 0 ? '—' : isConnected() ? 'Yes ✓' : 'No ✗'}`;
}

function isConnected() {
  if (vertices.length <= 1) return true;
  const visited = new Set();
  const start   = vertices[0].id;
  const queue   = [start];
  visited.add(start);
  while (queue.length) {
    const cur = queue.shift();
    edgeList.forEach(e => {
      if (e.u === cur && !visited.has(e.v)) { visited.add(e.v); queue.push(e.v); }
      if (!isDirected && e.v === cur && !visited.has(e.u)) { visited.add(e.u); queue.push(e.u); }
    });
  }
  return visited.size === vertices.length;
}

function updateStartDropdown() {
  const prev = selectStart.value;
  selectStart.innerHTML = '<option value="">— Select Start Node —</option>';
  vertices.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.label; opt.textContent = v.label;
    if (v.label === prev) opt.selected = true;
    selectStart.appendChild(opt);
  });
}

// ── Keyboard shortcuts ─────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'v' || e.key === 'V') setMode('vertex');
  if (e.key === 'e' || e.key === 'E') setMode('edge');
  if (e.key === 'd' || e.key === 'D') setMode('delete');
  if (e.key === 'p' || e.key === 'P') setMode('pan');
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); document.getElementById('btn-undo').click(); }
  if (e.key === 'Escape') { selectedSource = null; draw(); updateStatusBar(); }
});

// ── Init ───────────────────────────────────────────────────────────────────────
updateStatusBar();
draw();
