# Fighting Fantasy - Standalone HTML App

A complete standalone HTML version of the Fighting Fantasy web app. No installation, no build process - just open `index.html` in your browser!

## 🚀 Quick Start

1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Click "Load Example Adventure" to try the demo, or upload your own adventure JSON file

That's it! No npm, no Node.js, no dependencies required.

## ✨ Features

- **Fully Standalone**: Single HTML file with all CSS and JavaScript embedded
- **No Build Process**: Works directly in any modern browser
- **Complete Gameplay**:
  - Character stats tracking (SKILL, STAMINA, LUCK)
  - Dice-based combat system
  - Inventory management with item types
  - Journey map showing visited sections
  - Save/load functionality using localStorage
  - Test Your Luck mechanics
  - Conditional choices based on stats and items
  - Multiple ending types

## 📁 Files

- `index.html` - The complete app (open this in your browser)
- `example-adventure.json` - Demo adventure "The Cavern of Fear"

## 🎮 How to Play

1. **Load an Adventure**:
   - Click "Load Example Adventure" for the demo
   - Or drag and drop your own JSON adventure file
   - Or click to browse for a JSON file

2. **Start Your Quest**:
   - Review your starting stats
   - Click "Start Adventure"

3. **Make Choices**:
   - Read each section carefully
   - Click on choices to progress
   - Fight enemies in turn-based combat
   - Manage your inventory and stats

4. **Save Your Progress**:
   - Click "Save Game" at any time
   - Your save is stored in your browser's localStorage

## 📝 Creating Custom Adventures

Adventures are defined in JSON format. Place your JSON file in the same directory as `index.html`.

### Book Structure

```json
{
  "id": "unique-adventure-id",
  "title": "Your Adventure Title",
  "author": "Your Name",
  "description": "A brief description of your adventure",
  "startingSection": 1,
  "initialStats": {
    "skill": 8,
    "stamina": 20,
    "luck": 9
  },
  "startingItems": [
    {
      "id": "sword",
      "name": "Iron Sword",
      "description": "Your trusty blade",
      "type": "weapon"
    }
  ],
  "sections": [...]
}
```

### Section Structure

Each section can have:

- **Basic Info**: `id`, `title`, `text`
- **Choices**: Array of choices with `text`, `targetSection`, and optional `conditions`
- **Combat**: Enemy encounters with stats and outcomes
- **Test Your Luck**: Luck-based challenges with success/failure paths
- **Items**: `addItems` and `removeItems` arrays
- **Stat Changes**: `modifyStats` object for skill/stamina/luck changes
- **Endings**: `isEnding` and `endingType` (victory/defeat/neutral)

### Example Section with Combat

```json
{
  "id": 2,
  "title": "Forest Encounter",
  "text": "A goblin jumps out from behind a tree!",
  "combat": {
    "enemyName": "Goblin",
    "enemySkill": 5,
    "enemyStamina": 6,
    "onVictorySection": 3,
    "onDefeatSection": 99,
    "canFlee": true,
    "fleeSection": 1
  }
}
```

### Example Section with Choices

```json
{
  "id": 1,
  "title": "The Crossroads",
  "text": "You come to a fork in the road.",
  "choices": [
    {
      "text": "Go left",
      "targetSection": 2
    },
    {
      "text": "Go right (requires key)",
      "targetSection": 3,
      "conditions": {
        "requiresItem": "rusty-key"
      }
    }
  ]
}
```

### Item Types

- `weapon` - ⚔️ Weapons
- `armor` - 🛡️ Armor and shields
- `potion` - 🧪 Potions and consumables
- `treasure` - 💎 Gold and valuables
- `key` - 🔑 Keys and access items
- `other` - 📦 Miscellaneous items

### Conditional Choices

Choices can require:
- `requiresItem`: Specific item ID
- `requiresMinSkill`: Minimum SKILL value
- `requiresMinStamina`: Minimum STAMINA value
- `requiresMinLuck`: Minimum LUCK value

## 🎲 Game Mechanics

### Combat System
1. Both combatants roll 2 dice
2. Add SKILL to dice roll for Attack Strength
3. Higher Attack Strength wins the round
4. Loser takes 2 STAMINA damage
5. Combat continues until one reaches 0 STAMINA

### Test Your Luck
- Roll 2 dice
- Success if roll ≤ current LUCK
- LUCK decreases by 1 after each test

### Stats
- **SKILL**: Combat effectiveness (doesn't change often)
- **STAMINA**: Health points (0 = death)
- **LUCK**: Success in luck tests (decreases with use)

## 🌐 Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## 📱 Mobile Support

The app is responsive and works on mobile devices, though desktop provides the best experience.

## 💾 Save System

- Saves are stored in browser localStorage
- Each save includes full game state
- Saves persist between sessions
- Clear browser data to reset saves

## 🎨 Customization

The HTML file is fully self-contained. You can easily customize:
- Colors and styling (edit the `<style>` section)
- Game mechanics (edit the JavaScript)
- UI layout (edit the render functions)

## 📖 Example Adventure

"The Cavern of Fear" includes:
- 24 interconnected sections
- 3 unique enemies
- Multiple paths and choices
- Hidden treasures and secrets
- 3 different endings

## 🔧 Troubleshooting

**"Could not load example book" error:**
- Make sure `example-adventure.json` is in the same directory as `index.html`
- Check that the file is valid JSON

**Choices are grayed out:**
- You don't meet the requirements (check your stats or inventory)

**Combat not working:**
- Make sure your STAMINA is above 0
- Try refreshing the page

## 📄 License

MIT License - Free to use and modify for your own adventures!

## 🎮 Credits

Inspired by the classic Fighting Fantasy gamebooks by Steve Jackson and Ian Livingstone.

---

**Enjoy your adventure!** Create your own gamebooks and share them with friends. Just send them the `index.html` and your custom JSON file!
