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

### 8. Add "Min/Max Value Finder" Visualizer
- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** Algorithm Module Addition
- **Goal:** Create a sequential scanning visualizer module to locate the minimum and maximum values in an array.
- **Implementation Guide:**
  1. Create a new file `public/algorithms/minMaxFinder.js`.
  2. Implement sequential checks, keeping pointers tracking the current minimum and maximum values.
  3. Register Min/Max Finder in [dashboard.ejs](views/dashboard.ejs).

### 9. Telemetry Audio Sonification (Beeps on Comparison)
- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** Audio Synthesis & Accessibility
- **Goal:** Synthesize audio tones mapped to values being evaluated to aid accessibility.
- **Implementation Guide:**
  1. Leverage the Web Audio API inside [player.js](public/js/player.js).
  2. Synthesize frequency pitches mapped to array values during comparison step triggers.
  3. Provide a simple toggle mute switch inside [visualizer.ejs](views/visualizer.ejs).

### 10. Visualizer History Log Downloader
- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** Utility Features & UX
- **Goal:** Allow users to download the accumulated execution console logs text sequence as a local text file.
- **Implementation Guide:**
  1. Place an "Export Log" button in the Execution Debug Logs card header of [visualizer.ejs](views/visualizer.ejs).
  2. Bind a click handler that aggregates all list items inside `#console-log` and triggers a text blob downloader.

### 11. Add "Reverse Array" Visualizer
- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** Algorithm Module Addition
- **Goal:** Create a visualizer module demonstrating array reversing via a two-pointer technique.
- **Implementation Guide:**
  1. Create a new file `public/algorithms/reverseArray.js`.
  2. Manage two pointers starting from extremes, swapping values, and moving towards the center.
  3. Register Reverse Array in [dashboard.ejs](views/dashboard.ejs).

### 12. Display Execution Step Counter
- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** UI Enhancement
- **Goal:** Add a step index tracker showing active progress in the playroom timeline.
- **Implementation Guide:**
  1. Add a step indicator node (`#step-counter-text`) in [visualizer.ejs](views/visualizer.ejs) beside the play/pause button.
  2. Update its content dynamically in [player.js](public/js/player.js) inside `renderSnapshot()` using `currentIndex + 1` and `snapshots.length`.

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

### 13. Add "Quick Sort" Visualizer
- **Skill Level:** 🟡 Intermediate
- **Category:** Algorithm Module Addition
- **Goal:** Implement Quick Sort partitioning visualization using pivot indicators.
- **Implementation Guide:**
  1. Create a new file `public/algorithms/quickSort.js` exporting generator logic.
  2. Highlight the pivot element, partition subdivisions, and comparative swaps.
  3. Register Quick Sort in [dashboard.ejs](views/dashboard.ejs).

### 14. Custom Step-by-Step Narration Editor
- **Skill Level:** 🟡 Intermediate
- **Category:** Interactive UX
- **Goal:** Allow users to override narration text dynamically during step-by-step review.
- **Implementation Guide:**
  1. Make `#narrative-text` double-clickable to toggle into an editable input field.
  2. Update the corresponding snapshot description on save to let users customize narration files.

### 15. Speed Delay Presets
- **Skill Level:** 🟡 Intermediate
- **Category:** UI Enhancement & Usability
- **Goal:** Add instant speed adjustment preset buttons (0.5x, 1x, 2x, 5x) to the speed selector.
- **Implementation Guide:**
  1. Render preset buttons beside the slider inside [visualizer.ejs](views/visualizer.ejs).
  2. Add event listeners updating the delay parameter and restarting the animation loop if playing.

### 16. Multi-Algorithm Speed Comparison Board
- **Skill Level:** 🟡 Intermediate
- **Category:** Dashboard & Analytics
- **Goal:** Compare performance metrics of multiple sorting algorithms using identical arrays side-by-side.
- **Implementation Guide:**
  1. Create a dedicated comparison view `/compare` inside backend routes.
  2. Plot total comparison and swap counts side-by-side in bar meters.

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

### 17. Add "Merge Sort" Visualizer with Auxiliary Array View
- **Skill Level:** 🔴 Advanced
- **Category:** Visual Canvas Addition
- **Goal:** Implement Merge Sort displaying dynamic sub-array splits and auxiliary array merge steps.
- **Implementation Guide:**
  1. Create `public/algorithms/mergeSort.js` compiling auxiliary split ranges.
  2. Render a separate visual tape structure beneath the main bar chart to display active array merges.

### 18. Dynamic Call Stack Visualizer for Recursive Algorithms
- **Skill Level:** 🔴 Advanced
- **Category:** Sandbox UI Extension
- **Goal:** Render recursive active parameters stack visualization alongside pseudocode lines.
- **Implementation Guide:**
  1. Include recursion depth tracking inside snapshots.
  2. Render a vertical call stack representation of active parameters scopes in a new panel.

### 19. Interactive Grid Wall Weight Configuration
- **Skill Level:** 🔴 Advanced
- **Category:** Canvas Events & Interactive UX
- **Goal:** Allow mouse clicks and drags on the pathfinding grid to draw walls/obstacles interactively.
- **Implementation Guide:**
  1. Add pointer event listeners (`mousedown`, `mouseenter`, `mouseup`) to nodes on the visualizer canvas.
  2. Synchronize cell coordinates with active wall sets, resetting Dijkstra execution on changes.

### 20. Infinite Loop Detection and Guard for Sandbox Mode
- **Skill Level:** 🔴 Advanced
- **Category:** Core Sandbox Security
- **Goal:** Protect sandbox executions from freezing the page during infinite loops in user-submitted code.
- **Implementation Guide:**
  1. Instrument user code strings using regex insertion rules to track loop boundaries.
  2. Force-terminate execution context if thresholds (e.g. 50k iterations) are crossed.

### 21. Real-Time Time Complexity Benchmarker
- **Skill Level:** 🔴 Advanced
- **Category:** Sandbox Utilities & Analytics
- **Goal:** Benchmark running times of algorithms inside sandbox mode across varying array lengths.
- **Implementation Guide:**
  1. Add execution time benchmarks utilizing performance clocks.
  2. Render a lightweight SVG trend line graphing calculation time against data size.

### 22. A* Search Pathfinder with Heuristic Options
- **Skill Level:** 🔴 Advanced
- **Category:** Core Architecture & Complex UI
- **Goal:** Implement A* Pathfinding visualizer supporting Manhattan, Chebyshev, and Euclidean distance heuristics.
- **Implementation Guide:**
  1. Create `public/algorithms/aStar.js` state generator.
  2. Add heuristic selection dropdowns to visualizer options.
  3. Draw path scores (F, G, H values) directly inside grid cell tiles.
