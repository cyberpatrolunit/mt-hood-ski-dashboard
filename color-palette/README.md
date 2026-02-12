# Nature's Essence Color Palette 🌿

A carefully curated collection of 16 nature-inspired colors, perfect for bringing the calming and vibrant essence of the natural world into your design projects.

## 🎨 Color Categories

The palette is organized into four thematic categories:

### 🌱 Flora (4 colors)
- **Forest Green** `#2D5016` - Deep, rich green reminiscent of dense forest canopies
- **Moss** `#8A9A5B` - Soft, muted green like moss-covered stones
- **Sage** `#9CAF88` - Gentle, earthy green with a hint of gray
- **Fern** `#4F7942` - Vibrant green inspired by young fern fronds

### 🌊 Sky & Water (4 colors)
- **Sky Blue** `#87CEEB` - Bright, cheerful blue of a clear summer sky
- **Ocean** `#006994` - Deep, mysterious blue of open waters
- **Mist** `#D4E4ED` - Soft, light blue-gray like early morning fog
- **Twilight** `#5B7C99` - Cool, dusky blue of the evening sky

### 🪨 Earth (6 colors)
- **Clay** `#C4816D` - Warm, reddish-brown of terracotta pottery
- **Terracotta** `#D4816F` - Lighter, sun-baked earth tone
- **Sand** `#E8D5B7` - Soft beige of beach sand
- **Soil** `#6B4423` - Rich, dark brown of fertile earth
- **Stone Gray** `#8B8680` - Cool gray of weathered stone
- **Driftwood** `#9B8B7E` - Warm gray-brown of sun-bleached wood

### ✨ Accent (2 colors)
- **Sunset Orange** `#FF6B35` - Vibrant, warm orange of golden hour
- **Coral** `#FF8C61` - Softer, peachy orange inspired by coral reefs

## 📦 What's Included

### Files
- **`index.html`** - Interactive color palette viewer
- **`palette.json`** - Complete color data in JSON format
- **`README.md`** - This documentation file

## 🚀 Using the Interactive Viewer

### Features
1. **Grid Display** - All colors displayed in a responsive grid layout
2. **Click to Copy** - Click on any HEX or RGB value to copy to clipboard
3. **Theme Toggle** - Switch between light and dark modes
4. **Export Options**:
   - **JSON** - Raw color data for programmatic use
   - **CSS Variables** - Ready-to-use CSS custom properties
   - **Tailwind Config** - Drop-in Tailwind CSS configuration
5. **Responsive Design** - Works beautifully on desktop, tablet, and mobile

### Opening the Viewer
Simply open `index.html` in any modern web browser:
```bash
open index.html
```

Or navigate to the file in your browser.

## 💻 Using the Colors in Your Projects

### CSS Variables
Export the CSS variables and include in your stylesheet:
```css
:root {
  --color-forest-green: #2D5016;
  --color-moss: #8A9A5B;
  /* ... etc */
}

.my-element {
  background-color: var(--color-sage);
  color: var(--color-soil);
}
```

### Tailwind CSS
Add the exported Tailwind config to your `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'forest-green': '#2D5016',
        'moss': '#8A9A5B',
        // ... etc
      },
    },
  },
};
```

Then use in your HTML:
```html
<div class="bg-sage text-ocean">Hello World</div>
```

### Raw JSON
Load the `palette.json` file in your application:
```javascript
fetch('palette.json')
  .then(response => response.json())
  .then(data => {
    console.log(data.palette.colors);
  });
```

## 🎯 Use Cases

This palette works beautifully for:
- **Wellness & Health** - Calming, natural tones
- **Environmental** - Eco-friendly branding
- **Lifestyle & Home** - Organic, earthy aesthetics
- **Outdoor & Travel** - Adventure and nature themes
- **Food & Beverage** - Natural, organic products
- **Technology** - Humanizing digital experiences

## 🌈 Color Accessibility

When using these colors:
- **Text Contrast**: Always check WCAG contrast ratios for text
- **Dark Colors** (Forest Green, Soil, Ocean) work well for text on light backgrounds
- **Light Colors** (Mist, Sand, Sky Blue) work as backgrounds for dark text
- **Medium Colors** require careful pairing for accessibility

## 📝 License

This color palette is provided as-is for personal and commercial use. Feel free to modify and adapt to your needs.

## 🙏 Credits

Created with care and inspired by the beauty of the natural world.

---

**Questions or feedback?** Open the `index.html` file and start exploring your new nature-inspired color palette! 🌍
