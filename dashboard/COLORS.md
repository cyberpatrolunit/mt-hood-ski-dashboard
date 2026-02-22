# CLAWUNiT Dashboard Color Palette

## Primary Colors

### Cyan (Default/Inactive)
- **Hex:** `#00ffff`
- **RGB:** `0, 255, 255`
- **Usage:** Collapsed cards, default borders, inactive states
- **Glow:** Triple-layer shadow effect

### Blood Orange (Active/Selected)
- **Hex:** `#ff4500`
- **RGB:** `255, 69, 0`
- **Usage:** Expanded cards, active buttons, selected states
- **Glow:** Triple-layer shadow effect

### Blue (Secondary)
- **Hex:** `#0080ff`
- **RGB:** `0, 128, 255`
- **Usage:** Gradients, secondary highlights

### Dark Background
- **Hex:** `#000810`
- **RGB:** `0, 8, 16`
- **Usage:** Page background, card backgrounds

## State Colors

| State | Border | Text | Glow | Background |
|-------|--------|------|------|------------|
| **Collapsed** | Cyan | Cyan | Cyan | Dark |
| **Expanded** | Blood Orange | Blood Orange | Blood Orange | Dark Orange Tint |
| **Hover** | Brighter | Same | Intense | Same |
| **Active Button** | Blood Orange Fill | Black | Blood Orange | Blood Orange |

## Gradient Patterns

### Cyan Gradient (Default)
```css
linear-gradient(90deg, #00ffff, #0080ff)
```

### Blood Orange Gradient (Active)
```css
linear-gradient(90deg, #ff4500, #ff6b35)
```

## Glow Effects

### Cyan Glow
```css
box-shadow: 
  0 0 10px rgba(0, 255, 255, 0.8),
  0 0 20px rgba(0, 255, 255, 0.5),
  0 0 30px rgba(0, 255, 255, 0.3);
```

### Blood Orange Glow
```css
box-shadow: 
  0 0 10px rgba(255, 69, 0, 0.8),
  0 0 20px rgba(255, 69, 0, 0.5),
  0 0 30px rgba(255, 69, 0, 0.3);
```

## Usage Guidelines

✅ **DO:**
- Use cyan for default/inactive states
- Use blood orange for selected/active states
- Maintain glow effects for depth
- Keep text readable with sufficient contrast

❌ **DON'T:**
- Mix cyan and orange in same element (unless transitioning)
- Use orange for error states (it means "selected")
- Remove glow effects (they're part of the aesthetic)

## Animation Transitions

All color transitions use:
```css
transition: all 0.3s ease;
```

This applies to:
- Border colors
- Text colors
- Glow effects
- Background tints
- Fill colors

---

**CLAWUNiT System Monitor** 🎨⚡
