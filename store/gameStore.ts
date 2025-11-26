import { create } from 'zustand'
import { Book, GameState, Item, CharacterStats, Section } from '@/types/game'

interface GameStore {
  // Book data
  currentBook: Book | null
  isGameStarted: boolean

  // Game state
  currentSection: number
  stats: CharacterStats | null
  inventory: Item[]
  visitedSections: Set<number>

  // Combat state
  inCombat: boolean
  enemyCurrentStamina: number
  combatLog: string[]

  // Actions
  loadBook: (book: Book) => void
  startGame: () => void
  resetGame: () => void
  goToSection: (sectionId: number) => void
  updateStats: (stats: Partial<CharacterStats>) => void
  modifyStats: (changes: { skill?: number; stamina?: number; luck?: number }) => void
  addItem: (item: Item) => void
  removeItem: (itemId: string) => void
  hasItem: (itemId: string) => boolean

  // Combat actions
  startCombat: (enemyStamina: number) => void
  endCombat: () => void
  updateEnemyStamina: (stamina: number) => void
  addCombatLog: (message: string) => void
  clearCombatLog: () => void

  // Dice rolling
  rollDice: () => number
  rollTwoDice: () => number

  // Luck test
  testLuck: () => { success: boolean; newLuck: number }

  // Save/Load
  saveGame: () => void
  loadGame: (saveId: string) => void
  getSavedGames: () => any[]
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  currentBook: null,
  isGameStarted: false,
  currentSection: 1,
  stats: null,
  inventory: [],
  visitedSections: new Set(),
  inCombat: false,
  enemyCurrentStamina: 0,
  combatLog: [],

  // Load a book
  loadBook: (book: Book) => {
    set({
      currentBook: book,
      isGameStarted: false,
      currentSection: book.startingSection,
      stats: null,
      inventory: [],
      visitedSections: new Set(),
    })
  },

  // Start the game
  startGame: () => {
    const { currentBook } = get()
    if (!currentBook) return

    const initialStats: CharacterStats = {
      skill: currentBook.initialStats.skill,
      stamina: currentBook.initialStats.stamina,
      luck: currentBook.initialStats.luck,
      initialSkill: currentBook.initialStats.skill,
      initialStamina: currentBook.initialStats.stamina,
      initialLuck: currentBook.initialStats.luck,
    }

    set({
      isGameStarted: true,
      stats: initialStats,
      inventory: currentBook.startingItems || [],
      currentSection: currentBook.startingSection,
      visitedSections: new Set([currentBook.startingSection]),
    })
  },

  // Reset game
  resetGame: () => {
    const { currentBook } = get()
    set({
      isGameStarted: false,
      currentSection: currentBook?.startingSection || 1,
      stats: null,
      inventory: [],
      visitedSections: new Set(),
      inCombat: false,
      enemyCurrentStamina: 0,
      combatLog: [],
    })
  },

  // Navigate to a section
  goToSection: (sectionId: number) => {
    const { visitedSections } = get()
    const newVisited = new Set(visitedSections)
    newVisited.add(sectionId)

    set({
      currentSection: sectionId,
      visitedSections: newVisited,
    })
  },

  // Update stats
  updateStats: (newStats: Partial<CharacterStats>) => {
    const { stats } = get()
    if (!stats) return

    set({
      stats: { ...stats, ...newStats },
    })
  },

  // Modify stats (add/subtract)
  modifyStats: (changes: { skill?: number; stamina?: number; luck?: number }) => {
    const { stats } = get()
    if (!stats) return

    const newStats = { ...stats }
    if (changes.skill) newStats.skill = Math.max(0, newStats.skill + changes.skill)
    if (changes.stamina) newStats.stamina = Math.max(0, newStats.stamina + changes.stamina)
    if (changes.luck) newStats.luck = Math.max(0, newStats.luck + changes.luck)

    set({ stats: newStats })
  },

  // Add item to inventory
  addItem: (item: Item) => {
    const { inventory } = get()
    set({ inventory: [...inventory, item] })
  },

  // Remove item from inventory
  removeItem: (itemId: string) => {
    const { inventory } = get()
    set({ inventory: inventory.filter(item => item.id !== itemId) })
  },

  // Check if player has item
  hasItem: (itemId: string) => {
    const { inventory } = get()
    return inventory.some(item => item.id === itemId)
  },

  // Combat actions
  startCombat: (enemyStamina: number) => {
    set({
      inCombat: true,
      enemyCurrentStamina: enemyStamina,
      combatLog: [],
    })
  },

  endCombat: () => {
    set({
      inCombat: false,
      enemyCurrentStamina: 0,
      combatLog: [],
    })
  },

  updateEnemyStamina: (stamina: number) => {
    set({ enemyCurrentStamina: Math.max(0, stamina) })
  },

  addCombatLog: (message: string) => {
    const { combatLog } = get()
    set({ combatLog: [...combatLog, message] })
  },

  clearCombatLog: () => {
    set({ combatLog: [] })
  },

  // Dice rolling
  rollDice: () => {
    return Math.floor(Math.random() * 6) + 1
  },

  rollTwoDice: () => {
    const die1 = Math.floor(Math.random() * 6) + 1
    const die2 = Math.floor(Math.random() * 6) + 1
    return die1 + die2
  },

  // Test your luck
  testLuck: () => {
    const { stats, rollTwoDice } = get()
    if (!stats) return { success: false, newLuck: 0 }

    const roll = rollTwoDice()
    const success = roll <= stats.luck
    const newLuck = stats.luck - 1

    set({
      stats: { ...stats, luck: newLuck },
    })

    return { success, newLuck }
  },

  // Save game
  saveGame: () => {
    const { currentBook, currentSection, stats, inventory, visitedSections } = get()
    if (!currentBook || !stats) return

    const saveData = {
      id: `save_${Date.now()}`,
      timestamp: Date.now(),
      bookTitle: currentBook.title,
      bookId: currentBook.id,
      currentSection,
      stats,
      inventory,
      visitedSections: Array.from(visitedSections),
    }

    const saves = JSON.parse(localStorage.getItem('ff_saves') || '[]')
    saves.push(saveData)
    localStorage.setItem('ff_saves', JSON.stringify(saves))
  },

  // Load game
  loadGame: (saveId: string) => {
    const saves = JSON.parse(localStorage.getItem('ff_saves') || '[]')
    const save = saves.find((s: any) => s.id === saveId)
    if (!save) return

    set({
      currentSection: save.currentSection,
      stats: save.stats,
      inventory: save.inventory,
      visitedSections: new Set(save.visitedSections),
      isGameStarted: true,
    })
  },

  // Get saved games
  getSavedGames: () => {
    return JSON.parse(localStorage.getItem('ff_saves') || '[]')
  },
}))
