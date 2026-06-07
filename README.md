# AlgoVisual 📚

[![AlgoVisual CI](https://github.com/sandipanxd/algovisual/actions/workflows/ci.yml/badge.svg)](https://github.com/sandipanxd/algovisual/actions)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> **Summer of Code Project Description:**  
> AlgoVisual is a zero-configuration, interactive computer science algorithm and data structure visualizer playground built on Express and EJS. Designed specifically to demystify complex computations for beginners, it allows students to run, step, pause, and control the speed of algorithms while watching synced pseudocode line-by-line highlights alongside real-time visual array elements and descriptive narration logs. By isolating algorithm code into lightweight, browser-native ES6 modules, the platform offers a seamless sandbox that invites open-source newcomers to contribute new visualizations with zero build tool complexity.

---

## Key Features

- **Dynamic Interactive Canvas**: Watch algorithms manipulate visual bars representing data values.
- **Synced Code Execution**: Highlights the precise pseudocode line being executed in real-time.
- **Narrated Console Feed**: Generates clear, human-readable explanations of every swap, pivot, or boundary division.
- **Complete Playback Controls**: Step backward, step forward, play, pause, and speed rate slider (0.5x to 3.0x).
- **Custom Input Sandbox**: Type comma-separated integer lists to generate custom test cases on the fly.
- **Contributor Friendly**: Zero-build bundlers or compiler configurations. Adding an algorithm is as simple as creating a single Javascript file.

---

## File Structure

```text
algovisual/
├── .github/
│   ├── ISSUE_TEMPLATE/       # Templates for bug reports, features, & new algorithms
│   └── workflows/
│       └── ci.yml            # GitHub Actions continuous integration suite
├── public/
│   ├── css/
│   │   └── style.css         # UI design tokens (Amber/Warm Charcoal glow)
│   ├── js/
│   │   └── player.js         # Core visualizer timeline & animation engine
│   └── algorithms/
│       ├── bubbleSort.js     # Bubble Sort snapshot generator module
│       └── binarySearch.js   # Binary Search snapshot generator module
├── views/
│   ├── dashboard.ejs         # Grid selector panel for algorithm categories
│   └── visualizer.ejs        # Timeline playground & simulation canvas layout
├── tests/
│   └── routes.test.js        # Server integrations and routes verification tests
├── server.js                 # Express bootstrap server entry point
├── package.json              # Project script runs and testing dependencies
└── README.md                 # Main setup guide
```

---

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (Node 18.x or 20.x recommended).

### 1. Install Dependencies
Clone the repository and run:
```bash
npm install
```

### 2. Run the Development Server
Start the local server with nodemon reloading:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 3. Run the Test Suite
Ensure the routes build properly by executing Jest:
```bash
npm test
```

---

## Contributing

We love contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) to get started on setting up your local workspace and implementing a new algorithm module. Check out [ISSUES.md](ISSUES.md) for a list of "Good First Issues" awaiting developers.
