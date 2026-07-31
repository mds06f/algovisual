// public/js/astTranspiler.js

export function transpileCode(userCode) {
  const acorn = window.acorn;
  if (!acorn) {
    throw new Error('Acorn AST parser library is not loaded.');
  }

  // Parse the user code to get the Abstract Syntax Tree (AST)
  const ast = acorn.parse(userCode, { ecmaVersion: 2020, locations: true });

  let paramName = 'arr';
  let functionNode = null;

  // 1. Find the main function declaration/expression
  function findFunction(node) {
    if (!node) return;
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      functionNode = node;
      if (node.params && node.params.length > 0 && node.params[0].type === 'Identifier') {
        paramName = node.params[0].name;
      }
      return;
    }
    for (let key in node) {
      if (node[key] && typeof node[key] === 'object') {
        findFunction(node[key]);
      }
    }
  }
  findFunction(ast);

  if (!functionNode) {
    throw new Error('No valid function declaration found in custom code.');
  }

  // 2. Collect all variables declared in the function body to pass to the snapshot logger
  const declaredVars = new Set();
  function collectVars(node) {
    if (!node) return;
    if (node.type === 'VariableDeclarator') {
      if (node.id.type === 'Identifier') {
        declaredVars.add(node.id.name);
      }
    }
    for (let key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(child => collectVars(child));
        } else {
          collectVars(node[key]);
        }
      }
    }
  }
  collectVars(functionNode);

  // 3. Build parent map for syntax nodes to find enclosing statement bounds
  const parentMap = new Map();
  function buildParents(node, parent = null) {
    if (!node) return;
    if (parent) {
      parentMap.set(node, parent);
    }
    for (let key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(child => buildParents(child, node));
        } else {
          buildParents(node[key], parent);
        }
      }
    }
  }
  buildParents(ast);

  function isStatement(type) {
    return [
      'ExpressionStatement',
      'VariableDeclaration',
      'ReturnStatement',
      'IfStatement',
      'ForStatement',
      'WhileStatement',
      'DoWhileStatement'
    ].includes(type);
  }

  function getParentStatement(node) {
    let curr = node;
    while (curr) {
      if (isStatement(curr.type)) return curr;
      curr = parentMap.get(curr);
    }
    return null;
  }

  // 4. Construct safe variables dictionary string to serialize scope variables dynamically
  const varObjParts = [];
  declaredVars.forEach(v => {
    // Avoid checking builtins
    if (v !== paramName && v !== 'undefined') {
      varObjParts.push(`${v}: typeof ${v} !== 'undefined' ? ${v} : undefined`);
    }
  });
  const variablesString = `{ ${varObjParts.join(', ')} }`;

  const insertions = [];

  // Helper to add insertion item
  function addInsertion(index, text) {
    insertions.push({ index, text });
  }

  // 5. Traverse AST to identify loops and reassignments to insert snapshot hooks
  function walk(node) {
    if (!node) return;

    // A. Loop structures (insert loop guard and snapshot)
    if (
      node.type === 'ForStatement' ||
      node.type === 'WhileStatement' ||
      node.type === 'DoWhileStatement' ||
      node.type === 'ForInStatement' ||
      node.type === 'ForOfStatement'
    ) {
      const body = node.body;
      const line = node.loc.start.line;
      if (body.type === 'BlockStatement') {
        addInsertion(
          body.start + 1,
          `\n    _loopGuard();\n    __recordSnapshot(${paramName}, ${line}, ${variablesString});`
        );
      } else {
        // Wrap statement body in BlockStatement braces
        addInsertion(
          body.start,
          `{\n    _loopGuard();\n    __recordSnapshot(${paramName}, ${line}, ${variablesString});\n    `
        );
        addInsertion(body.end, `\n  }`);
      }
    }

    // B. Variable reassignments / Array mutations
    if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
      const parentStmt = getParentStatement(node);
      if (parentStmt && parentStmt.end) {
        const line = node.loc.start.line;
        addInsertion(
          parentStmt.end,
          `\n  __recordSnapshot(${paramName}, ${line}, ${variablesString});`
        );
      }
    }

    // C. Variable declarations
    if (node.type === 'VariableDeclaration') {
      const line = node.loc.start.line;
      addInsertion(
        node.end,
        `\n  __recordSnapshot(${paramName}, ${line}, ${variablesString});`
      );
    }

    // Recursion
    for (let key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(child => walk(child));
        } else {
          walk(node[key]);
        }
      }
    }
  }

  walk(functionNode);

  // 6. Sort and deduplicate insertions (run reverse index injection)
  insertions.sort((a, b) => b.index - a.index);
  const seenIndices = new Set();
  const uniqueInsertions = [];
  insertions.forEach(ins => {
    if (!seenIndices.has(ins.index)) {
      seenIndices.add(ins.index);
      uniqueInsertions.push(ins);
    }
  });

  // Apply insertions
  let transpiled = userCode;
  uniqueInsertions.forEach(ins => {
    transpiled = transpiled.slice(0, ins.index) + ins.text + transpiled.slice(ins.index);
  });

  // 7. Re-parse transpiled code to find the function body end index and inject helpers
  const transpiledAst = acorn.parse(transpiled, { ecmaVersion: 2020, locations: true });
  let finalFunctionNode = null;
  function findFinalFunction(node) {
    if (!node) return;
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      finalFunctionNode = node;
      return;
    }
    for (let key in node) {
      if (node[key] && typeof node[key] === 'object') {
        findFinalFunction(node[key]);
      }
    }
  }
  findFinalFunction(transpiledAst);

  if (!finalFunctionNode) {
    throw new Error('Failed to find final function node after code injection.');
  }

  const bodyStart = finalFunctionNode.body.start + 1;
  const bodyEnd = finalFunctionNode.body.end - 1;

  // Helpers code definition block
  const helpersCode = `
  const _snapshots = [];
  let _loopCount = 0;

  function _loopGuard() {
    if (++_loopCount > 50000) {
      throw new Error("Potential infinite loop detected (limit of 50000 iterations exceeded). Execution aborted.");
    }
  }

  function __recordSnapshot(arrayState, lineNo, variables = {}) {
    const arrayCopy = Array.isArray(arrayState) ? [...arrayState] : [];
    const highlights = [];
    const pointers = {};

    for (const [k, v] of Object.entries(variables)) {
      if (typeof v === 'number') {
        pointers[k] = v;
        if (v >= 0 && v < arrayCopy.length && k !== 'n' && k !== 'len' && k !== 'length' && k !== 'size') {
          highlights.push(v);
        }
      } else if (typeof v === 'string') {
        pointers[k] = v;
      }
    }

    const uniqueHighlights = [...new Set(highlights)].sort((a, b) => a - b);

    _snapshots.push({
      array: arrayCopy,
      highlights: uniqueHighlights,
      pointers: pointers,
      executingLine: lineNo,
      stats: { comparisons: _snapshots.length, swaps: 0 },
      description: \`Line \${lineNo}: Executing algorithm step.\`
    });
  }
  `;

  // Inject helpers at the start and return statement at the end of the function body
  const finalCode = 
    transpiled.slice(0, bodyStart) +
    helpersCode +
    transpiled.slice(bodyStart, bodyEnd) +
    `\n  return _snapshots;\n` +
    transpiled.slice(bodyEnd);

  return finalCode;
}
