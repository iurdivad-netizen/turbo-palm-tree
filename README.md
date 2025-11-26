# Fighting Fantasy Web App

An interactive web application for playing Fighting Fantasy-style gamebook adventures. Upload your own adventure books in JSON format and experience branching narratives, combat encounters, stat tracking, and inventory management.

## Features

- **Book Upload System**: Upload adventure books in JSON format
- **Character Management**:
  - Track SKILL, STAMINA, and LUCK stats
  - Visual stat bars with color-coded health indicators
  - Inventory system with item categorization
- **Combat System**:
  - Classic Fighting Fantasy dice-based combat
  - Combat log showing round-by-round action
  - Support for fleeing from combat
- **Navigation**:
  - Choice-based story progression
  - Conditional choices based on stats or items
  - Journey map showing visited sections
- **Game State**:
  - Save/load functionality using localStorage
  - Section tracking and history
  - Test Your Luck mechanics
- **Example Adventure**: Includes "The Cavern of Fear" demo adventure

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Creating Your Own Adventures

Adventures are defined in JSON format. Here's the structure:

### Book Format

```json
{
  "id": "unique-book-id",
  "title": "Your Adventure Title",
  "author": "Author Name",
  "description": "A brief description",
  "startingSection": 1,
  "initialStats": {
    "skill": 8,
    "stamina": 20,
    "luck": 9
  },
  "startingItems": [
    {
      "id": "item-id",
      "name": "Item Name",
      "description": "Description",
      "type": "weapon|armor|potion|treasure|key|other"
    }
  ],
  "sections": [...]
}
```

### Section Format

```json
{
  "id": 1,
  "title": "Section Title",
  "text": "The section narrative text...",
  "choices": [
    {
      "text": "Choice text",
      "targetSection": 2,
      "conditions": {
        "requiresItem": "item-id",
        "requiresMinSkill": 8,
        "requiresMinStamina": 10,
        "requiresMinLuck": 7
      }
    }
  ],
  "combat": {
    "enemyName": "Enemy Name",
    "enemySkill": 7,
    "enemyStamina": 10,
    "onVictorySection": 5,
    "onDefeatSection": 99,
    "canFlee": true,
    "fleeSection": 3
  },
  "testLuck": {
    "successSection": 10,
    "failureSection": 11,
    "successText": "You were lucky!",
    "failureText": "You were unlucky!"
  },
  "addItems": [...],
  "removeItems": ["item-id"],
  "modifyStats": {
    "skill": 1,
    "stamina": -2,
    "luck": 1
  },
  "isEnding": true,
  "endingType": "victory|defeat|neutral"
}
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI**: React 18

## Project Structure

```
/app                  # Next.js app directory
  /globals.css       # Global styles
  /layout.tsx        # Root layout
  /page.tsx          # Main page
/components          # React components
  /BookUploader.tsx  # Upload and select books
  /GameReader.tsx    # Main game interface
  /CharacterSheet.tsx # Stats display
  /CombatManager.tsx  # Combat system
  /InventoryDisplay.tsx # Inventory UI
  /MapTracker.tsx     # Progress tracking
/store               # State management
  /gameStore.ts      # Zustand store
/types               # TypeScript definitions
  /game.ts           # Game type definitions
/public              # Static files
  /example-adventure.json # Example book
```

## Game Mechanics

### Stats
- **SKILL**: Combat effectiveness
- **STAMINA**: Health points
- **LUCK**: Success in luck tests (decreases with each test)

### Combat
1. Player and enemy each roll 2 dice
2. Add SKILL to dice roll for Attack Strength
3. Higher Attack Strength wins the round
4. Loser takes 2 STAMINA damage
5. Combat continues until one combatant reaches 0 STAMINA

### Test Your Luck
- Roll 2 dice
- If result ≤ LUCK: Success
- LUCK decreases by 1 after each test

## Building for Production

```bash
npm run build
npm start
```

## License

MIT License - feel free to use this for your own Fighting Fantasy adventures!

## Credits

Inspired by the classic Fighting Fantasy gamebooks by Steve Jackson and Ian Livingstone.
