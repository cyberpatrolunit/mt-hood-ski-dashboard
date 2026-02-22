# 🎨 AI Icon Generator

Generate professional SVG icons from text descriptions using AI.

## Quick Start

```bash
# Generate an icon
node generate.js "minimalist rocket icon"

# With custom output path
node generate.js "cloud icon, tron style" my-cloud.svg

# Tron-styled icons
node generate.js "CPU processor, tron style, cyan glow"
```

## Features

✅ **AI-Powered** - Uses Claude to generate SVG code directly  
✅ **Style Presets** - Tron, minimal, flat, line, duotone  
✅ **Pure SVG** - No raster conversion, fully scalable  
✅ **Fast** - Generates in seconds  
✅ **Template Fallback** - Works even without AI API  
✅ **Dashboard Ready** - Perfect for TRON dashboard icons  

## Style Examples

### Tron Style
```bash
node generate.js "rocket icon, tron style, neon cyan"
```
- Neon cyan and blue colors
- Gradient fills
- Glow effects
- Geometric, futuristic design

### Minimal Style
```bash
node generate.js "settings gear, minimal, single color"
```
- Simple geometric shapes
- Solid colors
- Clean lines
- No gradients

### Flat Design
```bash
node generate.js "folder icon, flat design, blue"
```
- Modern flat aesthetic
- 2-3 solid colors
- Slight shadows allowed

## Templates

Pre-made Tron-style templates in `templates/`:
- `tron-rocket.svg` - Rocket with gradient and glow
- `tron-cpu.svg` - CPU chip with connection pins

## Integration Examples

### Use in TRON Dashboard
```javascript
// Generate icon dynamically
const { exec } = require('child_process');

exec('node skills/icon-generator/generate.js "network icon, tron"', 
  (err, stdout) => {
    const iconPath = stdout.trim().split('\n').pop();
    console.log('Icon created:', iconPath);
  }
);
```

### Inline SVG in HTML
```html
<!-- Load generated icon -->
<div id="icon"></div>
<script>
  fetch('/skills/icon-generator/output/icon-123.svg')
    .then(r => r.text())
    .then(svg => document.getElementById('icon').innerHTML = svg);
</script>
```

### React Component
```jsx
import { useState, useEffect } from 'react';

function DynamicIcon({ description }) {
  const [svg, setSvg] = useState('');
  
  useEffect(() => {
    // Generate and fetch icon
    fetch(`/api/generate-icon?desc=${description}`)
      .then(r => r.text())
      .then(setSvg);
  }, [description]);
  
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
```

## Output Format

All icons use:
- **ViewBox**: `0 0 24 24` (24x24 pixels)
- **Namespace**: `xmlns="http://www.w3.org/2000/svg"`
- **Optimized paths**: Clean, minimal SVG code
- **Web-ready**: Can be used directly in HTML/CSS

## Directory Structure

```
icon-generator/
├── SKILL.md          # Detailed documentation
├── README.md         # This file
├── generate.js       # Main generator script
├── templates/        # Pre-made SVG templates
├── examples/         # Example outputs
└── output/           # Generated icons (gitignored)
```

## Tips

💡 **Be specific**: "minimalist rocket, flat design, blue" works better than "rocket"  
💡 **Mention style**: Include "tron", "minimal", or "flat" in description  
💡 **Add colors**: Specify color names for automatic palette  
💡 **Keep it simple**: Best results with geometric shapes  
💡 **Use templates**: Check `templates/` for inspiration  

## Next Steps

Want to integrate this into your app? See SKILL.md for:
- Advanced configuration options
- Custom color palettes
- Batch generation
- API integration patterns
- OpenClaw session commands

---

**Built for the TRON Dashboard** 🎮⚡
