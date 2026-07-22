# Architecture

AlgoVisual is a zero-configuration, interactive computer science algorithm and data structure visualizer playground. It is designed specifically to demystify complex computations for beginners. The application utilizes a lightweight Node.js/Express backend paired with an EJS and Vanilla ES6 JavaScript frontend, creating a sandbox environment that invites open-source newcomers to contribute new visualizations with minimal friction.

## System Overview

### High-Level Architecture
1. **Client (Browser):**
   - Renders the EJS templates into HTML.
   - Executes `player.js`, which handles the timeline, animation loop, speed controls, and DOM manipulation (e.g., swapping DOM nodes that represent array elements).
   - Loads isolated algorithm modules (e.g., `bubbleSort.js`) as ES6 modules. These modules generate a "snapshot" or "frame" array representing every state change.
2. **Server (Node.js & Express):**
   - Serves static assets (`/public/*`).
   - Resolves routes (`/`, `/visualizer`, `/compare`) and renders the appropriate `.ejs` view template, injecting query parameters (like which algorithm to load) directly into the HTML response.

### Data Flow for Visualizations
The core animation engine revolves around generating a pre-calculated sequence of states (snapshots), which are then "played back" by the client-side player.
1. The user selects an algorithm on the dashboard.
2. The browser navigates to `/visualizer?algo=bubbleSort`.
3. Express captures the `algo` query parameter and renders `visualizer.ejs`, passing `{ algo: 'bubbleSort' }`.
4. The client browser loads `player.js` and dynamically imports `/algorithms/bubbleSort.js`.
5. The algorithm module runs purely in-memory and returns an array of `Snapshot` objects.
6. `player.js` iterates through the `Snapshot` array using `requestAnimationFrame` or `setTimeout` based on the user's selected speed rate, updating the DOM bars and the narration console in sync.

## Directory Structure Deep-Dive

```text
algovisual/
├── public/                 # Static assets served by Express
│   ├── css/
│   │   └── style.css       # Global UI tokens (Amber/Warm Charcoal glow), flexbox layouts
│   ├── js/
│   │   └── player.js       # Core Visualizer Engine: Timeline, Play/Pause logic, DOM renderer
│   └── algorithms/         # Isolated ES6 Modules for algorithms
│       ├── bubbleSort.js   # Generates snapshots for Bubble Sort
│       └── binarySearch.js # Generates snapshots for Binary Search
├── views/                  # EJS Templates
│   ├── dashboard.ejs       # Landing page; Grid selector panel for algorithm categories
│   ├── visualizer.ejs      # Timeline playground & simulation canvas layout
│   └── compare.ejs         # Split-screen comparison board for analyzing two algorithms
├── tests/                  # Test Suites (Jest)
│   └── routes.test.js      # Verifies Express routing and EJS rendering
├── server.js               # Express application bootstrap and route definitions
└── package.json            # Scripts (`npm run dev`, `npm test`) and dependencies
```

## How to Contribute a New Algorithm

Because AlgoVisual isolates algorithms into pure JavaScript modules, adding a new visualization requires **zero build tool configuration** (no Webpack, Babel, or TypeScript configuration needed).

1. **Create the Algorithm File:**
   Create a new file in `public/algorithms/`, e.g., `mergeSort.js`.
2. **Implement the Generator:**
   Write a pure function that accepts an initial array and returns an array of snapshots. A snapshot typically includes:
   ```javascript
   {
       arrayState: [3, 1, 4, 2], // The current array values
       activeIndices: [0, 1],    // Indices currently being compared/swapped (highlighted in UI)
       narration: "Comparing 3 and 1" // Text to display in the narration log
   }
   ```
3. **Export the Function:**
   Ensure the function is exported as an ES6 module (`export default function mergeSort(...)`).
4. **Test the Integration:**
   Navigate to `http://localhost:3000/visualizer?algo=mergeSort` to watch your algorithm come to life.

## Testing Strategy
- **Backend Routing:** We use `Jest` combined with `Supertest` (`tests/routes.test.js`) to assert that Express properly responds with the correct HTML payloads for various query parameters without needing to spin up the actual HTTP listener.
- **Frontend Logic:** Because algorithm generators are pure ES6 functions without DOM dependencies, they can be tested independently of the visualization engine.
