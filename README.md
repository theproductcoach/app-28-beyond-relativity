# Beyond Relativity: Interactive Einstein Visualizations

A Next.js application that explores the boundaries of Einstein's theories through interactive visualizations of physical phenomena where General Relativity breaks down.

## Overview

This educational app provides interactive visualizations of three key areas where Einstein's theories face limitations:

1. **Black Hole Spacetime Warping** - Visualization of how mass warps spacetime according to General Relativity and where it breaks down at the singularity
2. **Quantum Double-Slit Experiment** - Demonstration of wave-particle duality and quantum measurement effects
3. **Big Bang Simulation** - Visualization of universe expansion and cosmic timeline

## Features

### Black Hole Visualization

- Interactive 3D visualization of spacetime curvature using Three.js
- Adjustable black hole mass with real-time updates to the visualization
- Mathematical equations that change based on increasing mass
- Calculated event horizon radius and spacetime curvature metrics
- Orbit controls allowing users to zoom, rotate, and pan the visualization

### Quantum Double-Slit Experiment

- Interactive particle simulation showing quantum wave-particle duality
- Toggle between "Classical" and "Quantum" (interference pattern) modes
- Adjustable slit width, separation, and particle count
- Support for different particle types (electrons and photons)
- Visualization of the famous double-slit experiment that troubled Einstein

### Big Bang Universe Expansion

- Timeline visualization of cosmic evolution
- Interactive simulation of expanding space
- Visualization of the Big Bang singularity

## Technologies Used

- **Next.js** - React framework for the frontend
- **TypeScript** - For type-safe code
- **Three.js** - For 3D visualizations and physics simulations
- **MathJax** - For rendering mathematical equations

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

- Navigate through the main page to explore different phenomena
- Use the interactive controls on each visualization:
  - Black Hole: Adjust mass slider, drag to rotate, scroll to zoom
  - Quantum Demo: Toggle between Classical/Quantum modes, adjust particle settings
  - Big Bang: Follow the cosmic timeline and expanding universe visualization

## Educational Context

This application is designed to illustrate key concepts in modern physics where Einstein's theories face limitations:

1. **Singularities** - Points where spacetime curvature becomes infinite and General Relativity breaks down
2. **Quantum Mechanics** - The probabilistic nature of quantum physics which Einstein famously rejected with "God does not play dice"
3. **Universe Origin** - The limits of our understanding at t=0 of the Big Bang

## Development

The project structure is organized as follows:

```
app/
├── page.tsx            # Main overview page
├── black-holes/        # Black hole visualization
├── quantum-demo/       # Double-slit experiment
└── big-bang/           # Universe expansion
```

## Credits

Created as an educational tool to demonstrate Einstein's theories and their limitations in an interactive and visual way.
