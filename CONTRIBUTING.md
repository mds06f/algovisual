# Contributing to AlgoVisual 🚀

Thank you for showing interest in contributing to **AlgoVisual**! This project is specifically designed to be extremely developer-friendly, allowing beginners to easily add their first computer science visualization.

---

## Code of Conduct

We expect all participants to maintain a polite, welcoming, and inclusive space. Be supportive and helpful to first-time contributors!

---

## How to Contribute

1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/algovisual.git
   cd algovisual
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch** off the `development` branch:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/my-cool-algorithm
   ```
5. **Develop & Test** (see instructions below).
6. **Submit a Pull Request** to the `development` branch.

---

## How to Add a New Algorithm Visualization

To add a new algorithm (e.g., Insertion Sort, Linear Search, or a Stack/Queue playground), you **do not** need to write any custom HTML, CSS, or timeline buttons. You simply write a standalone ES6 Javascript module.

### Step 1: Create your Algorithm File

Create a new file in `public/algorithms/` (e.g. `public/algorithms/insertionSort.js`).

### Step 2: Implement the Algorithm Structure

Your module must export a single `algorithm` object with the following schema:

```javascript
export const algorithm = {
  name: 'Algorithm Name',
  category: 'Sorting', // or "Searching"
  description: 'A short description of the algorithm.',
  pseudocode: ['line 1 of pseudocode', 'line 2 of pseudocode'],
  generator: function (arr, targetVal) {
    const snapshots = [];
    // ... algorithm logic that pushes snapshot objects to snapshots ...
    return snapshots;
  },
};
```

### Snapshot Schema Reference

Each snapshot object generated during the search or sort loop must include:

| Property        | Type            | Description                                                                 |
| :-------------- | :-------------- | :-------------------------------------------------------------------------- |
| `array`         | `Array<number>` | A copy of the current state of the array.                                   |
| `highlights`    | `Array<number>` | Array indices that should be highlighted.                                   |
| `pointers`      | `Object`        | Key-value pairs mapping label strings to indices.                           |
| `executingLine` | `number`        | The `0`-based line index of the pseudocode array to highlight.              |
| `description`   | `string`        | The text description of the current step.                                   |
| `stats`         | `Object`        | Optional statistics: `{ comparisons, swaps, complexity: { time, space } }`. |

### Step 3: Register in Dashboard

Register your new algorithm by adding a link card in `views/dashboard.ejs` pointing to `/visualizer?algo=yourAlgorithmName`.

---

## Verifying Your Changes

Ensure your code does not introduce compile errors or broken routes:

```bash
# Run Jest verification
npm test
```

Then, start the server and run a manual check:

```bash
npm run dev
```

Navigate to your new algorithm and confirm timeline step controls (`⏮️`, `⏭️`, `▶️`, `⏸️`), custom input parsing, and explanation logs render correctly.
