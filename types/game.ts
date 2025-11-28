// Core game types for Fighting Fantasy adventures

export interface CharacterStats {
  skill: number
  stamina: number
  luck: number
  initialSkill: number
  initialStamina: number
  initialLuck: number
}

export interface Item {
  id: string
  name: string
  description?: string
  type?: 'weapon' | 'armor' | 'potion' | 'treasure' | 'key' | 'other'
  quantity?: number
}

export interface Choice {
  text: string
  targetSection: number
  conditions?: {
    requiresItem?: string
    requiresMinSkill?: number
    requiresMinStamina?: number
    requiresMinLuck?: number
  }
}

export interface CombatEncounter {
  enemyName: string
  enemySkill: number
  enemyStamina: number
  onVictorySection?: number
  onDefeatSection?: number
  canFlee?: boolean
  fleeSection?: number
  rewardItems?: Item[]
}

export interface TestYourLuck {
  successSection?: number
  failureSection?: number
  successText?: string
  failureText?: string
}

export interface Section {
  id: number
  title?: string
  text: string
  choices?: Choice[]
  combat?: CombatEncounter
  testLuck?: TestYourLuck
  addItems?: Item[]
  removeItems?: string[]
  modifyStats?: {
    skill?: number
    stamina?: number
    luck?: number
  }
  isEnding?: boolean
  endingType?: 'victory' | 'defeat' | 'neutral'
}

export interface Book {
  id: string
  title: string
  author?: string
  description?: string
  coverImage?: string
  startingSection: number
  initialStats: {
    skill: number
    stamina: number
    luck: number
  }
  sections: Section[]
  startingItems?: Item[]
}

export interface GameState {
  bookId: string
  currentSection: number
  stats: CharacterStats
  inventory: Item[]
  visitedSections: Set<number>
  combatState?: {
    inCombat: boolean
    enemy?: CombatEncounter
    enemyCurrentStamina?: number
    roundNumber?: number
  }
}

export interface SavedGame {
  id: string
  timestamp: number
  bookTitle: string
  gameState: Omit<GameState, 'visitedSections'> & {
    visitedSections: number[]
  }
}
