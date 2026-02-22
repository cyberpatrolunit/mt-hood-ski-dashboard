# Icon Generator Skill

AI-powered SVG icon generation using Claude. Generates clean, scalable vector icons from text descriptions.

## Usage

### Basic Generation
```bash
node generate.js "minimalist rocket icon"
```

### With Style
```bash
node generate.js "cloud icon, tron style, neon cyan"
```

### Specify Output
```bash
node generate.js "star icon, flat design" output/star.svg
```

## Style Presets

- **minimal** - Clean, simple geometric shapes
- **tron** - 80s retro-futuristic, neon glow effects
- **flat** - Modern flat design, solid colors
- **line** - Outline/stroke only
- **duotone** - Two-color gradient style

## Features

- ✅ Pure SVG output (no raster conversion)
- ✅ 24x24 default viewBox (customizable)
- ✅ Single-color or multi-color support
- ✅ Optimized for web use
- ✅ Claude-powered for intelligent interpretation
- ✅ Works with OpenClaw integration

## Examples

```bash
# Tron-style dashboard icon
node generate.js "CPU processor chip, tron style, cyan glow"

# Simple UI icons
node generate.js "settings gear, minimal, single color"

# Complex composition
node generate.js "abstract data flow network, nodes and connections, blue gradient"
```

## Output

SVG files are saved to `output/` directory by default. Icons include:
- Optimized viewBox (24x24 or specified)
- Clean paths (no unnecessary groups)
- Proper xmlns attributes
- Embedded styling when needed

## Integration

Use in OpenClaw:
```javascript
// From agent skill
const { exec } = require('child_process');
exec('node skills/icon-generator/generate.js "rocket icon"', (err, stdout) => {
  console.log(stdout); // Path to generated SVG
});
```

Use in TRON dashboard:
```javascript
// Dynamic icon loading
fetch('/skills/icon-generator/output/icon.svg')
  .then(r => r.text())
  .then(svg => document.getElementById('icon').innerHTML = svg);
```

## Advanced Options

Create `config.json` for custom settings:
```json
{
  "defaultSize": 24,
  "defaultStyle": "minimal",
  "outputDir": "output",
  "colorPalette": {
    "tron": ["#00ffff", "#0080ff"],
    "fire": ["#ff6b00", "#ff0000"]
  }
}
```

## Tips

- Be specific with descriptions (shapes, style, colors)
- Mention "simple" or "minimal" for clean geometric results
- Add color keywords for automatic palette selection
- Use "outline" or "stroke" for line-only icons
- Combine styles: "flat design with subtle shadow"
