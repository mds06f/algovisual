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

### 23. Workspace Array Reset Button

- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** Utility Features & UX
- **Goal:** Add a "Reset" button to clear custom arrays and reset the visualizer state to defaults.
- **Implementation Guide:**
  1. Add a "Reset" button next to "Save" in the input controls of [visualizer.ejs](views/visualizer.ejs).
  2. Implement a click handler in [player.js](public/js/player.js) that clears `#input-custom`, resets `defaultArray`, and triggers `resetPlayroom`.

### 24. Search Target Found Indicator Color

- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** UI Styling & UX
- **Goal:** Render a unique highlight color (e.g. pulsing green/emerald) when a search target is successfully located.
- **Implementation Guide:**
  1. In [player.js](public/js/player.js) inside `renderBars`, check if the element's index matches the located target.
  2. Apply a new class `array-cell success` instead of `highlight`.
  3. Define custom styling and pulse animations for `.array-cell.success` in [style.css](public/css/style.css).

### 25. Add "Fibonacci Sequence" Visualizer

- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** Algorithm Module Addition
- **Goal:** Create a visualizer module calculating and showing the build-up of the Fibonacci sequence up to N.
- **Implementation Guide:**
  1. Create a new file `public/algorithms/fibonacci.js` to compute Fibonacci states.
  2. Generate step snapshots detailing comparisons and addition operations.
  3. Register the Fibonacci algorithm in [dashboard.ejs](views/dashboard.ejs).

### 26. Workspace Keyboard Shortcuts Support

- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** Interactive UX & Accessibility
- **Goal:** Control playback (Play/Pause, Step Back, Step Next) using arrow keys and the Spacebar.
- **Implementation Guide:**
  1. Register a keydown event listener inside [player.js](public/js/player.js).
  2. Bind Spacebar to play/pause, Left Arrow to step back, and Right Arrow to step next.
  3. Ensure shortcuts are bypassed when interactive textareas or inputs are focused.

### 27. Speed Delay Info Tooltip on Hover

- **Skill Level:** 🟢 Beginner (Good First Issue)
- **Category:** UI Enhancement
- **Goal:** Display a micro-tooltip indicating the current speed delay in milliseconds when hovering over the speed slider.
- **Implementation Guide:**
  1. Add a title attribute or absolute tooltip element above `#slider-speed` in [visualizer.ejs](views/visualizer.ejs).
  2. Dynamically calculate the active delay (e.g., `Math.round(600 / rate)`) and update the tooltip text in [player.js](public/js/player.js).

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

### 28. Add "Binary Search Tree (BST) Insertion" Visualizer

- **Skill Level:** 🟡 Intermediate
- **Category:** Algorithm Module Addition
- **Goal:** Implement a visualizer demonstrating step-by-step element insertion into a Binary Search Tree.
- **Implementation Guide:**
  1. Create `public/algorithms/bstInsert.js` exporting tree traversal and placement generator logic.
  2. Construct snapshots highlighting parent-child comparison nodes.
  3. Adapt the HTML template inside [player.js](public/js/player.js) to render a structured node hierarchy.

### 29. Export Comparison Board Telemetry Report

- **Skill Level:** 🟡 Intermediate
- **Category:** Analytics & Utilities
- **Goal:** Allow users on the comparison board page to export side-by-side run reports as JSON or CSV files.
- **Implementation Guide:**
  1. Place an "Export Report" button on the comparison dashboard UI.
  2. Collect performance telemetry counters (Comparison count, swaps count, step counts).
  3. Generate and trigger a file download using standard data Blobs.

### 30. Random Array Generator with Configurable Parameters

- **Skill Level:** 🟡 Intermediate
- **Category:** Utility Features & UX
- **Goal:** Provide options to generate a random input array with user-specified length and value bounds (Min/Max).
- **Implementation Guide:**
  1. Add configurable inputs for length, minimum value, and maximum value inside the controls wrapper of [visualizer.ejs](views/visualizer.ejs).
  2. Add a "Randomize" trigger button.
  3. Bind a handler in [player.js](public/js/player.js) that synthesizes the random array and updates the playground.

### 31. Custom Sandbox Code Syntax Highlighter

- **Skill Level:** 🟡 Intermediate
- **Category:** Core Sandbox Engine
- **Goal:** Enhance Sandbox Mode by implementing a basic in-editor syntax highlighter or helper container.
- **Implementation Guide:**
  1. Implement structural text highlighting for keywords (`function`, `let`, `for`, `while`, `yield`, `return`) inside Sandbox Mode.
  2. Sync styled backdrop overlays with user inputs to provide high-quality code readability.

### 32. Saved Presets Deletion UI Manager

- **Skill Level:** 🟡 Intermediate
- **Category:** Local Storage & UX
- **Goal:** Enable users to clean up and delete saved custom presets directly from the playground UI.
- **Implementation Guide:**
  1. Place a delete/trash icon next to the presets selector dropdown in [visualizer.ejs](views/visualizer.ejs).
  2. Add a click event to splice the targeted item from `localStorage` and trigger `loadPresetsDropdown`.

### 33. Sound Pitch & Waveform Configurator

- **Skill Level:** 🟡 Intermediate
- **Category:** Audio Synthesis & Accessibility
- **Goal:** Let users choose different sound waveforms (sine, triangle, square) and custom base pitches for sonification feedback.
- **Implementation Guide:**
  1. Add a settings gear/drawer menu inside [visualizer.ejs](views/visualizer.ejs).
  2. Bind selection listeners for oscillator type and base pitch multipliers inside [player.js](public/js/player.js).

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

### 34. Dynamic Maze Generators for Pathfinding Grid

- **Skill Level:** 🔴 Advanced
- **Category:** Grid Algorithms & Complex UI
- **Goal:** Implement maze generator options (Recursive Division or Prim's algorithm) to auto-build grid obstacles.
- **Implementation Guide:**
  1. Add a "Generate Maze" selector to pathfinding algorithm options.
  2. Implement maze generation steps yielding intermediate snapshots to show construction telemetry.
  3. Hook the generated walls sequence into the visualizer player loop.

### 35. Add "Heap Sort" Visualizer with Hierarchical Binary Tree Overlay

- **Skill Level:** 🔴 Advanced
- **Category:** Core Architecture & Complex UI
- **Goal:** Add Heap Sort visualization rendering an interactive SVG/HTML binary tree representation of the array next to the standard bars.
- **Implementation Guide:**
  1. Implement `public/algorithms/heapSort.js` mapping max-heap building and extraction operations.
  2. Render a dynamic tree node overlay showing parent-child links that light up during comparison swaps.

### 36. Custom Sandbox Code Debugger with Set Breakpoints

- **Skill Level:** 🔴 Advanced
- **Category:** Core Sandbox Engine
- **Goal:** Allow users to set interactive line breakpoints in Sandbox Mode to pause playback when hitting those statements.
- **Implementation Guide:**
  1. Enable clicking on line gutter numbers in the Sandbox editor panel to toggle breakpoints list.
  2. Instrument the sandboxed function string compilation to inject conditional pauses (`debugger` triggers or execution pauses) when lines are reached.

### 37. Playback Undo Action (Deep Backtracking System)

- **Skill Level:** 🔴 Advanced
- **Category:** Core Playback Architecture
- **Goal:** Optimize step-by-step navigation to support deep backtracking states without recalculating the entire array path.
- **Implementation Guide:**
  1. Refactor playback controllers in [player.js](public/js/player.js) to support state-delta trackers or deep copies of mutable items.
  2. Enable clean reversal of advanced grid/array updates without performance stutter.

### 38. Interactive Node Weights for Pathfinding Grid

- **Skill Level:** 🔴 Advanced
- **Category:** Grid Canvas Events & Traversal
- **Goal:** Support non-uniform traversal costs (e.g. weighted nodes) on the pathfinding grid and update Dijkstra/A* to search through weighted cells.
- **Implementation Guide:**
  1. Add a weight paint tool allowing users to paint cell nodes with custom costs (e.g., mud cells with cost 5).
  2. Update pathfinders (`dijkstra.js`, `aStar.js`) to parse custom weights from nodes and animate cumulative g-costs in registers HUD.

### 39. Multi-Threaded Sandbox Execution using Web Workers

- **Skill Level:** 🔴 Advanced
- **Category:** Sandbox Performance & Security
- **Goal:** Execute sandbox code generation inside a background Web Worker thread to prevent the browser window from locking up during large-scale calculations.
- **Implementation Guide:**
  1. Create a dynamic Web Worker script compiled from the custom sandbox textarea string.
  2. Run the generator calculation asynchronously on a background worker thread.
  3. Transfer resulting snapshot buffers back to the main UI thread to initialize player execution safely.
