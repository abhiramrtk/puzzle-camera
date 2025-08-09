# Live Camera Jigsaw Puzzle

A minimal React + Vite application that turns your live camera feed into a draggable jigsaw puzzle.

## Features

- **Live Camera Puzzle:**  
  - Requests access to your camera.
  - Splits the live video feed into draggable puzzle pieces.
  - Drag and drop pieces to solve the puzzle.
  - Handles camera errors gracefully.

- **Modern Frontend Stack:**  
  - Built with React 19 and Vite.
  - Uses functional components and hooks.
  - Fast development experience with hot module replacement.

- **Clean UI:**  
  - Custom CSS variables for theming.
  - Centered layout and modern color scheme.

## Getting Started

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Start development server:**
   ```
   npm run dev
   ```

3. **Build for production:**
   ```
   npm run build
   ```

## Project Structure

- `src/main.jsx` — Entry point, renders the app.
- `src/App.jsx` — Main component with puzzle logic.
- `src/index.css`, `src/App.css` — Styling.
- `public/` and `src/assets/` — Static assets.
- `vite.config.js` — Vite configuration.
- `eslint.config.js` — ESLint configuration.

## Areas for Improvement

- Add unit tests for puzzle logic.
- Migrate to TypeScript for type safety.
- Make puzzle container fully responsive.
- Enhance mobile/touch support.
- Persist puzzle progress between reloads.
