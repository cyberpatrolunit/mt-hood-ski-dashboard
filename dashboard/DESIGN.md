# CLAWUNiT Dashboard Design Philosophy

## Ultra-Minimal Data-First Approach

### Core Principles

1. **Data Over Words** - Numbers speak louder than labels
2. **Visuals Over Text** - Every metric has a live chart
3. **Gold Highlights** - Current values pop in gold
4. **Minimal Chrome** - Remove everything that isn't data

## Color System

### Three-Color Palette

| Color | Hex | Usage | Emotion |
|-------|-----|-------|---------|
| **Cyan** | `#00ffff` | Default, inactive, grid | Cool, calm, data |
| **Blood Orange** | `#ff4500` | Active, selected, focus | Hot, attention, action |
| **Gold** | `#ffd700` | Current values, highlights | Premium, important, now |

### Color Hierarchy

```
Background (Dark) → Grid (Cyan 15%) → Labels (Cyan 50%) → Values (Gold 100%)
```

### State Colors

- **Collapsed:** Cyan borders, cyan icons, minimal
- **Expanded:** Orange borders, orange icons, full data
- **Current Value:** Gold glow, emphasized

## Typography Scale

### Ultra-Minimal Sizing

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| **Data Values** | 24px | 900 | Hero numbers |
| **Labels** | 9px | 400 | Minimal context |
| **Units** | 12px | 400 | Subtle indicators |
| **Headers** | 32px | 900 | Page title |
| **Subtitles** | 10px | 400 | Meta info |
| **Status** | 9px | 400 | System state |

### Letter Spacing

- Headers: 4px (was 8px) - more compact
- Labels: 0.5px - tight and minimal
- Values: -1px - condensed for impact

## Data Visualization

### Live Bar Charts

Every metric gets a 20-bar real-time chart:
- **Height:** 30px
- **Bars:** 20 (most recent data)
- **Gap:** 2px
- **Width:** Flexible (fills container)
- **Last Bar:** Gold highlight
- **Animation:** Smooth 0.3s transitions

### Chart Colors

- **Default:** Cyan → Blue gradient
- **Highlight (last bar):** Gold gradient
- **Expanded:** Orange → Orange-light gradient

### Visualization Density

```
Collapsed: Mini sparkline (15 bars, 20px height)
Expanded: Full chart (20 bars, 30px height)
```

## Layout

### Grid

- Auto-fit columns (min 300px)
- 30px gap on desktop
- 10px gap on mobile
- Single column on < 768px

### Cards

- **Collapsed:** 12px padding, minimal height
- **Expanded:** 25px padding, full content
- **Border:** 1px (ultra-thin)
- **Glow:** Triple-layer shadow

### Spacing

- Section gaps: 30px → 20px (tighter)
- Card padding: 25px → 12px collapsed
- Stat rows: 12px → 8px (denser)

## Interaction

### Hover States

- Brightness increase
- Glow intensity up
- No transform (stable)

### Expanded States

- Border: Cyan → Blood Orange
- Icon: Cyan → Blood Orange
- Values: Gold (stays gold)
- Charts: Cyan → Orange

### Transitions

```css
transition: all 0.3s ease;
```

Everything smoothly animates between states.

## Mobile Optimization

### Breakpoints

- `< 768px` - Mobile optimizations
- `< 400px` - Extra compact (iPhone SE)

### Mobile Changes

- Header: 32px → 20px
- Cards: Full width, single column
- Charts: Maintained (still 30px)
- Labels: Stay readable at 9px
- Touch targets: Maintained for taps

## Data Hierarchy

### Information Pyramid

```
1. Big Numbers (Gold 24px) ←────────── Primary focus
2. Live Charts (30px bars) ←────────── Visual context
3. Icons (20px) ←──────────────────── Category
4. Labels (9px) ←──────────────────── Minimal text
5. Units (12px) ←──────────────────── Subtle detail
```

### Reading Flow

1. Eye catches gold numbers first
2. Scans chart patterns second
3. Identifies icon third
4. Reads label if needed

## Examples

### CPU Display

```
Old:  "CPU Load: 34.2%"  [=========>          ]
New:  "CPU"
       34                ||||||||||||||||||||
       (9px)            (24px gold)    (chart bars)
```

### Network Display

```
Old:  "↓ RX Rate: 125.3 KB/s"
New:  "↓ RX"
       125.3 KB/s        ||||||||||||||||||||
       (gold 24px)       (last bar gold)
```

## Icons

### Inline SVG

- Size: 20x20px
- Stroke: 2px
- Color: Inherits from heading
- Changes: Cyan → Orange on expand

### Icon Set

All custom, no emojis:
- CPU chip (rect + pins)
- Neural network (connected nodes)
- Heartbeat (waveform)
- Signal waves (arcs)
- Settings gear (radial)
- Grid (4 squares)
- Globe (circle + meridians)
- Disk (cylinder)

## Performance

### Optimization

- 20 datapoints per chart (not 100)
- CSS animations (GPU accelerated)
- Minimal DOM updates
- Efficient data structures

### Update Frequencies

- Data viz: 1 second
- System stats: 3 seconds
- Heartbeat visual: 100ms
- Network latency: 2 seconds

## Accessibility

### Contrast Ratios

- Gold on dark: 12:1 (AAA)
- Cyan on dark: 10:1 (AAA)
- Orange on dark: 8:1 (AA)

### Text Sizing

- Minimum: 9px (labels, supplementary)
- Primary: 24px (data, main content)
- Touch targets: 40px+ (mobile cards)

---

**Design Goal:** Maximum information density with zero clutter.  
**Motto:** *Data over decoration. Visuals over verbosity. Gold over noise.*
