// public/js/graphRenderer.js

let nodes = [];
let edges = [
  { u: 'A', v: 'B', w: 4 },
  { u: 'A', v: 'C', w: 2 },
  { u: 'B', v: 'C', w: 1 },
  { u: 'B', v: 'D', w: 5 },
  { u: 'C', v: 'D', w: 8 },
  { u: 'C', v: 'E', w: 10 },
  { u: 'D', v: 'E', w: 2 },
  { u: 'D', v: 'F', w: 6 },
  { u: 'E', v: 'F', w: 3 }
];

let draggedNode = null;
let canvasElement = null;
let ctx = null;
let isInitialized = false;
let currentSnapshot = null;

// Initialize nodes in a circle
function initNodes(width, height) {
  const nodeIds = ['A', 'B', 'C', 'D', 'E', 'F'];
  nodes = [];
  nodeIds.forEach((id, idx) => {
    const angle = (idx / nodeIds.length) * Math.PI * 2;
    nodes.push({
      id: id,
      x: width / 2 + Math.cos(angle) * 110,
      y: height / 2 + Math.sin(angle) * 110,
      vx: 0,
      vy: 0
    });
  });
  isInitialized = true;
}

// Simple physics step
function updatePhysics(width, height) {
  if (nodes.length === 0) return;

  const kRepel = 900; // repulsion coefficient
  const kAttract = 0.05; // spring coefficient
  const restLength = 130; // spring rest length
  const kCenter = 0.015; // center attraction coefficient
  const damping = 0.85;

  // 1. Repulsion between all nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < 280) {
        const force = kRepel / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        
        n1.vx -= fx;
        n1.vy -= fy;
        n2.vx += fx;
        n2.vy += fy;
      }
    }
  }

  // 2. Attraction along edges
  edges.forEach((edge) => {
    const n1 = nodes.find(n => n.id === edge.u);
    const n2 = nodes.find(n => n.id === edge.v);
    if (n1 && n2) {
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - restLength) * kAttract;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      n1.vx += fx;
      n1.vy += fy;
      n2.vx -= fx;
      n2.vy -= fy;
    }
  });

  // 3. Central attraction
  const cx = width / 2;
  const cy = height / 2;
  nodes.forEach((n) => {
    n.vx += (cx - n.x) * kCenter;
    n.vy += (cy - n.y) * kCenter;
  });

  // 4. Apply forces & damping
  nodes.forEach((n) => {
    if (n === draggedNode) return;
    n.x += n.vx;
    n.y += n.vy;
    n.vx *= damping;
    n.vy *= damping;

    // Boundaries
    const radius = 22;
    n.x = Math.max(radius, Math.min(width - radius, n.x));
    n.y = Math.max(radius, Math.min(height - radius, n.y));
  });
}

function handleMouseDown(e) {
  const rect = canvasElement.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Scale coordinates to canvas width/height
  const canvasX = (mouseX / rect.width) * canvasElement.width;
  const canvasY = (mouseY / rect.height) * canvasElement.height;

  // Find node near click
  draggedNode = nodes.find((n) => {
    const dist = Math.hypot(n.x - canvasX, n.y - canvasY);
    return dist < 22;
  }) || null;
}

function handleMouseMove(e) {
  if (!draggedNode) return;
  const rect = canvasElement.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Scale coordinates
  draggedNode.x = (mouseX / rect.width) * canvasElement.width;
  draggedNode.y = (mouseY / rect.height) * canvasElement.height;
  draggedNode.vx = 0;
  draggedNode.vy = 0;
}

function handleMouseUp() {
  draggedNode = null;
}

function drawLoop() {
  if (!canvasElement || !ctx) return;

  const w = canvasElement.width;
  const h = canvasElement.height;

  updatePhysics(w, h);

  // Clear Canvas
  ctx.clearRect(0, 0, w, h);

  const getEdgeKey = (u, v) => [u, v].sort().join('-');

  // 1. Draw Edges
  edges.forEach((edge) => {
    const n1 = nodes.find(n => n.id === edge.u);
    const n2 = nodes.find(n => n.id === edge.v);
    if (!n1 || !n2) return;

    const edgeKey = getEdgeKey(edge.u, edge.v);
    const state = currentSnapshot && currentSnapshot.edgesState
      ? currentSnapshot.edgesState[edgeKey]
      : 'default';

    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nodeRadius = 18;
    const tx = n2.x - (dx / dist) * nodeRadius;
    const ty = n2.y - (dy / dist) * nodeRadius;

    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(tx, ty);

    if (state === 'active') {
      ctx.strokeStyle = '#f59e0b'; // Amber
      ctx.lineWidth = 3.5;
    } else if (state === 'mst') {
      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.lineWidth = 4.5;
    } else {
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)'; // Dark slate
      ctx.lineWidth = 1.8;
    }
    ctx.stroke();

    const isDirected = (currentSnapshot && currentSnapshot.isDirected) || (document.getElementById('select-graph-type')?.value === 'directed');
    if (isDirected) {
      const angle = Math.atan2(dy, dx);
      const arrowSize = 7;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - arrowSize * Math.cos(angle - Math.PI / 6), ty - arrowSize * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(tx - arrowSize * Math.cos(angle + Math.PI / 6), ty - arrowSize * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    }

    // Draw Edge Weight labels
    const mx = (n1.x + n2.x) / 2;
    const my = (n1.y + n2.y) / 2;

    ctx.beginPath();
    ctx.arc(mx, my, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(edge.w, mx, my);
  });

  // 2. Draw Nodes
  nodes.forEach((node) => {
    const state = currentSnapshot && currentSnapshot.nodesState
      ? currentSnapshot.nodesState[node.id]
      : 'unvisited';

    ctx.beginPath();
    ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);

    let gradient = ctx.createRadialGradient(node.x - 4, node.y - 4, 2, node.x, node.y, 18);

    if (state === 'visited') {
      gradient.addColorStop(0, '#34d399'); // light green
      gradient.addColorStop(1, '#047857'); // dark green
      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
    } else if (state === 'visiting') {
      gradient.addColorStop(0, '#fbbf24'); // light amber
      gradient.addColorStop(1, '#b45309'); // dark amber
      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
    } else {
      gradient.addColorStop(0, '#334155'); // slate
      gradient.addColorStop(1, '#0f172a'); // dark slate
      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
    }
    ctx.fill();
    ctx.stroke();

    // Draw Node text labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.id, node.x, node.y);
  });

  requestAnimationFrame(drawLoop);
}

export function drawGraph(canvas, snapshot) {
  currentSnapshot = snapshot;
  if (canvasElement !== canvas) {
    canvasElement = canvas;
    ctx = canvas.getContext('2d');
    
    // Add Event Listeners for Dragging
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // Initial position nodes
    initNodes(canvas.width, canvas.height);
    
    // Start layout drawing physics loop
    drawLoop();
  }
}
