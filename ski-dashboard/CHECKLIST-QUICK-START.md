# 🎿 Gear Checklist - Quick Start Guide

## 🚀 Accessing the Checklist

### From Main Dashboard
1. Open http://localhost:18791/
2. Click the green **"🎿 Gear Checklist"** button (top left)

### Direct Access
- Local: http://localhost:18791/checklist.html
- Network: http://192.168.1.36:18791/checklist.html

## 📋 How to Use

### Basic Packing Flow
1. **Check off items** as you pack them (click checkbox)
2. **Watch progress bar** fill up (so satisfying!)
3. **Get motivated** by changing messages
4. **Hit 100%** for confetti celebration! 🎉

### Advanced Features

#### Add Custom Items
1. Scroll to bottom of any category
2. Type item name in "Add custom item..." field
3. Click "+ Add" or press Enter
4. Your item appears with ✨ icon

#### Reorder Items
1. Click and hold any item
2. Drag up or down
3. Drop in new position
4. Works within same category only

#### Delete Custom Items
1. Hover over custom item (or just tap on mobile)
2. Click 🗑️ button
3. Confirm deletion
4. Default items can't be deleted (safety!)

#### Enable Sound Effects
1. Click "🔇 Sound OFF" button
2. Becomes "🔊 Sound ON"
3. Hear satisfying "ding" when checking items
4. Extra sounds at 100% completion!

#### Reset for Next Trip
1. Click "🔄 Reset All" button
2. Confirm reset
3. All items unchecked
4. Custom items stay (only packed state resets)

#### Print Checklist
1. Click "🖨️ Print" button
2. Printer-friendly version appears
3. All categories expanded
4. Clean black & white layout

## 💡 Pro Tips

### Desktop
- **Hover over items** for funny/helpful tips
- **Delete buttons** appear on hover
- **Drag smoothly** for reordering

### Mobile
- **Easy tap targets** - big checkboxes
- **Delete always visible** - no hover needed
- **No tips** - they don't work on touch screens
- **Pack while packing** - use your phone while packing!

### General
- **Auto-saves** - everything saves automatically
- **Survives refresh** - close and reopen, state persists
- **Category progress** - see X/Y completed per category
- **Motivation** - watch the messages change as you progress

## 🎯 Default Categories & Items

### ⛷️ Gear (10 items)
Essential ski equipment - skis/board, boots, helmet, jacket, pants, layers, gloves, goggles, socks, extras

### 🎒 Accessories (4 items)
Cold weather gear - hat, neck warmer, sunscreen, lip balm

### 🍪 Snacks (6 items)
Fuel for the mountain - granola bars, trail mix, chocolate, thermos, hot cocoa, jerky

### 📱 Tech (4 items)
Electronics - phone, AirPods, speaker, charger

### ✨ Essentials (5 items)
Don't forget these - sunglasses, ID/ticket, cash/card, keys, camera

## 🎨 Features at a Glance

✅ Interactive checkboxes with pop animation  
✅ Progress bar with shimmer effect  
✅ Motivational messages (6 different ones!)  
✅ Collapsible categories  
✅ Drag & drop to reorder  
✅ Add unlimited custom items  
✅ Delete custom items (not defaults)  
✅ Sound effects toggle  
✅ 100% completion celebration  
✅ Auto-save to localStorage  
✅ Print-friendly version  
✅ Mobile optimized  
✅ Funny hover tips (desktop)  
✅ Cozy ski-lodge design  
✅ Snow animation background  

## 🐛 Troubleshooting

### Checklist not loading?
- Check server is running: `ps aux | grep "node.*server.js"`
- Restart server: `cd /Users/cpuai/.openclaw/workspace/ski-dashboard && ./start.sh`
- Clear cache: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)

### Items not saving?
- Check localStorage is enabled in browser
- Try different browser
- Clear localStorage and restart: localStorage.clear() in console

### Sound not working?
1. Make sure sound is enabled (🔊 button)
2. Check browser audio isn't muted
3. Interact with page first (browser autoplay policy)

### Print looks weird?
- Use Chrome or Safari for best results
- Check print preview before printing
- Adjust margins in print dialog

## 📱 Mobile Checklist

Great for packing on-the-go!

✅ Large tap targets  
✅ Easy to check off items while packing  
✅ Persistent state (won't lose progress if interrupted)  
✅ Works offline (after first load)  
✅ Save to Home Screen for quick access  

## 🎉 Fun Facts

- **29 default items** covering everything you need
- **35+ features** implemented
- **0 dependencies** - pure vanilla JS!
- **~35KB total** - loads instantly
- **60fps animations** - buttery smooth
- **Web Audio API** - synthesized sounds (not audio files!)
- **100% responsive** - works on any screen size
- **Print-friendly** - thoughtful print styles included

## 📚 More Info

- **Full Documentation:** [GEAR-CHECKLIST.md](GEAR-CHECKLIST.md)
- **Test Results:** [CHECKLIST-TEST-RESULTS.md](CHECKLIST-TEST-RESULTS.md)
- **Main Dashboard:** [README.md](README.md)

---

**Happy packing! See you on the mountain! 🏔️⛷️**
