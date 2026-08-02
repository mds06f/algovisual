// public/js/treeRenderer.js

export function drawTree(svgElement, treeRoot, pointers = {}) {
  // Clear other child elements (excluding definitions)
  const defsExist = svgElement.querySelector('defs');
  svgElement.innerHTML = '';
  
  if (defsExist) {
    svgElement.appendChild(defsExist);
  } else {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <radialGradient id="default-node-gradient" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#22d3ee" />
        <stop offset="100%" stop-color="#0891b2" />
      </radialGradient>
      <radialGradient id="red-node-gradient" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#f87171" />
        <stop offset="100%" stop-color="#b91c1c" />
      </radialGradient>
      <radialGradient id="black-node-gradient" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#4b5563" />
        <stop offset="100%" stop-color="#111827" />
      </radialGradient>
      <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    `;
    svgElement.appendChild(defs);
  }

  if (!treeRoot) return;

  const width = svgElement.clientWidth || 600;
  const height = svgElement.clientHeight || 360;

  const nodesList = [];
  const linksList = [];

  function layoutNode(node, x, y, dx, level) {
    if (!node) return;

    nodesList.push({
      key: node.key,
      color: node.color,
      x: x,
      y: y
    });

    if (node.left) {
      const lx = x - dx;
      const ly = y + 55;
      linksList.push({
        x1: x,
        y1: y,
        x2: lx,
        y2: ly
      });
      layoutNode(node.left, lx, ly, dx * 0.5, level + 1);
    }

    if (node.right) {
      const rx = x + dx;
      const ry = y + 55;
      linksList.push({
        x1: x,
        y1: y,
        x2: rx,
        y2: ry
      });
      layoutNode(node.right, rx, ry, dx * 0.5, level + 1);
    }
  }

  // Set initial dimensions
  layoutNode(treeRoot, width / 2, 40, width / 4.8, 0);

  // 1. Draw connecting link lines
  linksList.forEach(link => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', link.x1);
    line.setAttribute('y1', link.y1);
    line.setAttribute('x2', link.x2);
    line.setAttribute('y2', link.y2);
    line.setAttribute('stroke', '#1e293b');
    line.setAttribute('stroke-width', '2.2');
    line.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    svgElement.appendChild(line);
  });

  // 2. Draw nodes (circles with text label overlays)
  nodesList.forEach(node => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', '16');
    circle.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

    if (node.color === 'red') {
      circle.setAttribute('fill', 'url(#red-node-gradient)');
      circle.setAttribute('stroke', '#ef4444');
    } else if (node.color === 'black') {
      circle.setAttribute('fill', 'url(#black-node-gradient)');
      circle.setAttribute('stroke', '#1f2937');
    } else {
      circle.setAttribute('fill', 'url(#default-node-gradient)');
      circle.setAttribute('stroke', '#06b6d4');
    }
    circle.setAttribute('stroke-width', '2.2');

    // Highlight node if target pointers refer to it
    let isPointed = false;
    for (const [k, v] of Object.entries(pointers)) {
      if (v === node.key) isPointed = true;
    }
    if (isPointed) {
      circle.setAttribute('stroke', '#f59e0b');
      circle.setAttribute('stroke-width', '3');
      circle.setAttribute('filter', 'url(#node-glow)');
    }

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('fill', '#ffffff');
    text.setAttribute('font-size', '10px');
    text.setAttribute('font-family', 'Courier New, monospace');
    text.setAttribute('font-weight', 'bold');
    text.textContent = node.key;
    text.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

    group.appendChild(circle);
    group.appendChild(text);
    svgElement.appendChild(group);
  });
}
