# Good First Issues & Project Roadmap 🗺️

Welcome, SoC contributors! Here is a list of curated tasks designed to help you get familiar with the codebase. We have organized these issues by difficulty levels. Feel free to claim any of these by opening an issue on GitHub!

---

## 🟢 Beginner Issues

### 1. Add "Selection Sort" Visualizer
- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** Algorithm Module Addition
- **Goal:** Create a visualizer module for the Selection Sort algorithm.
- **Implementation Guide:**
  1. Create a new file [selectionSort.js](public/algorithms/selectionSort.js).
  2. Implement the selection sort state generator logic to yield step snapshots.
  3. Yield snapshots highlighting comparisons, swaps, and pointer references.
  4. Register Selection Sort in [dashboard.ejs](views/dashboard.ejs) to replace the current placeholder.

### 2. Add "Linear Search" Visualizer
- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** Algorithm Module Addition
- **Goal:** Create a visualizer module for Linear Search.
- **Implementation Guide:**
  1. Create a new file [linearSearch.js](public/algorithms/linearSearch.js).
  2. The algorithm searches an unsorted array sequentially for a target.
  3. Highlight each element index as it's checked, updating the pointer to indicate `i`.
  4. Register Linear Search in [dashboard.ejs](views/dashboard.ejs).

### 3. Implement "Insertion Sort" Visualizer
- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** Algorithm Module Addition
- **Goal:** Add Insertion Sort module using the template outline in `CONTRIBUTING.md`.
- **Implementation Guide:**
  1. Create [insertionSort.js](public/algorithms/insertionSort.js).
  2. Build snapshots recording array state swaps as items are inserted into the sorted subarray.

---

## 🟡 Intermediate Issues

### 4. Add Contrast / Light Mode Toggle
- **Skill Level:** 🟡 Intermediate
- **Category:** Styling & User Experience
- **Goal:** Implement a Light Mode alternative theme for users who prefer higher contrast backgrounds.
- **Implementation Guide:**
  1. Add a toggle button in the top navigation of [visualizer.ejs](views/visualizer.ejs) and [dashboard.ejs](views/dashboard.ejs).
  2. Update [style.css](public/css/style.css) to support a `.light-theme` class overriding CSS variables (e.g., using cream/soft grey background colors).
  3. Store theme state in `localStorage` to preserve the user's preference across pages.

### 5. Local Storage Array Presets
- **Skill Level:** 🟡 Intermediate
- **Category:** Local Storage & UX
- **Goal:** Allow users to save custom arrays they input to a dropdown list of preset options.
- **Implementation Guide:**
  1. Add a "Save Array" button next to "Apply" in the control bar.
  2. On click, store the custom array in `localStorage` under a user-defined name.
  3. Render a dropdown preset selector that populates from the stored arrays.

---

## 🔴 Advanced Issues

### 6. Implement Pathfinding Visualizer Module (Grid-Based)
- **Skill Level:** 🔴 Advanced
- **Category:** Core Architecture & Complex UI
- **Goal:** Create a pathfinding grid visualizer supporting Dijkstra's or A* algorithm.
- **Implementation Guide:**
  1. Add a new view type in the visualizer for grid coordinates.
  2. Implement grid node types (start, end, obstacle/wall, visited, path).
  3. Write the state generator mapping nodes visited at each iteration step.
  4. Update [player.js](public/js/player.js) to render a grid table instead of bars/tape when this category is active.

### 7. Dynamic Algorithm Code Evaluator
- **Skill Level:** 🔴 Advanced
- **Category:** Core Sandbox Engine
- **Goal:** Allow users to write and execute their own algorithm generator code directly inside the browser.
- **Implementation Guide:**
  1. Integrate an in-browser code editor (like Monaco Editor or CodeJar) into the visualizer code panel.
  2. Extract the user's written algorithm code, execute it securely within a sandbox, and feed the output snapshots back to `initPlayer`.
