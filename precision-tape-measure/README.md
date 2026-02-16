# Precision Tape Measure

A professional-grade, high-precision measurement visualization tool for CAD designers and engineers.

## Features

- **Dual System Support**: Toggle between Imperial (US) and Metric (SI) systems
- **Variable Precision**: For Imperial inches, precision up to 1/128"
- **Smart Input**: Mathematical expression evaluation (e.g., `5 + 3/8` or `12 * 2`)
- **Live Conversion**: Real-time equivalent display in opposite system
- **D3.js Tape Measure**: Responsive SVG-based ruler with dynamic scaling
- **Dark Cyberpunk UI**: Industrial aesthetic with carbon-fiber texture and neon accents
- **History Log**: Track all measurements with timestamp
- **Quick Presets**: Common measurements for rapid input
- **Keyboard Controls**:
  - `Enter`: Save to history
  - `Arrow Up/Down`: Nudge value by smallest precision step
- **Clipboard**: Copy formatted results

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- D3.js
- Vite

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Enter a measurement or expression in the input field
2. Toggle between Imperial/Metric systems
3. Select unit (inches/feet for imperial, mm/cm/m for metric)
4. For imperial inches, adjust precision (1/16, 1/32, 1/64, 1/128)
5. View the visual ruler representation with D3.js
6. Save measurements to history
7. Use quick presets for common values

## Color Coding

- **Lime Green**: Imperial mode
- **Cyan/Blue**: Metric mode
- **Neon Pink**: Measurement indicator

## License

MIT
