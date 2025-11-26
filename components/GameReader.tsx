'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import CharacterSheet from './CharacterSheet'
import CombatManager from './CombatManager'
import MapTracker from './MapTracker'
import InventoryDisplay from './InventoryDisplay'
import { Section } from '@/types/game'

export default function GameReader() {
  const {
    currentBook,
    currentSection,
    stats,
    goToSection,
    modifyStats,
    addItem,
    removeItem,
    hasItem,
    inCombat,
    resetGame,
    saveGame,
  } = useGameStore()

  if (!currentBook || !stats) return null

  const section = currentBook.sections.find(s => s.id === currentSection)
  if (!section) {
    return (
      <div className="text-center text-red-600">
        Error: Section {currentSection} not found
      </div>
    )
  }

  // Apply section effects when entering a section
  useEffect(() => {
    if (section.modifyStats) {
      modifyStats(section.modifyStats)
    }
    if (section.addItems) {
      section.addItems.forEach(item => addItem(item))
    }
    if (section.removeItems) {
      section.removeItems.forEach(itemId => removeItem(itemId))
    }
  }, [currentSection])

  const handleChoice = (targetSection: number, choice: any) => {
    // Check conditions
    if (choice.conditions) {
      if (choice.conditions.requiresItem && !hasItem(choice.conditions.requiresItem)) {
        alert('You do not have the required item for this choice.')
        return
      }
      if (choice.conditions.requiresMinSkill && stats.skill < choice.conditions.requiresMinSkill) {
        alert('Your SKILL is too low for this choice.')
        return
      }
      if (choice.conditions.requiresMinStamina && stats.stamina < choice.conditions.requiresMinStamina) {
        alert('Your STAMINA is too low for this choice.')
        return
      }
      if (choice.conditions.requiresMinLuck && stats.luck < choice.conditions.requiresMinLuck) {
        alert('Your LUCK is too low for this choice.')
        return
      }
    }

    goToSection(targetSection)
  }

  return (
    <div className="space-y-6">
      {/* Top bar with stats and controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {currentBook.title}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={saveGame}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
            >
              Save Game
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
            >
              Restart
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section display */}
          {!inCombat ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  Section {section.id}
                </h3>
                {section.title && (
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    {section.title}
                  </span>
                )}
              </div>

              <div className="prose dark:prose-invert max-w-none mb-6">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {section.text}
                </p>
              </div>

              {/* Ending display */}
              {section.isEnding && (
                <div className={`p-4 rounded-lg mb-6 ${
                  section.endingType === 'victory'
                    ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500'
                    : section.endingType === 'defeat'
                    ? 'bg-red-100 dark:bg-red-900 border-2 border-red-500'
                    : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-500'
                }`}>
                  <p className="font-bold text-lg text-center">
                    {section.endingType === 'victory' && '🎉 Victory!'}
                    {section.endingType === 'defeat' && '💀 The End'}
                    {section.endingType === 'neutral' && 'The End'}
                  </p>
                </div>
              )}

              {/* Combat initiation */}
              {section.combat && !inCombat && (
                <CombatManager combat={section.combat} />
              )}

              {/* Choices */}
              {section.choices && section.choices.length > 0 && !section.combat && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    What do you do?
                  </h4>
                  {section.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleChoice(choice.targetSection, choice)}
                      className="w-full text-left p-4 bg-amber-100 dark:bg-gray-700 hover:bg-amber-200 dark:hover:bg-gray-600 rounded-lg transition-colors border-2 border-amber-300 dark:border-gray-600"
                    >
                      <span className="text-gray-800 dark:text-gray-200">
                        {choice.text}
                      </span>
                      {choice.conditions && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          (requires: {JSON.stringify(choice.conditions)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Test your luck */}
              {section.testLuck && (
                <TestLuckComponent testLuck={section.testLuck} />
              )}
            </div>
          ) : (
            <CombatManager combat={section.combat!} />
          )}

          {/* Map tracker */}
          <MapTracker />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CharacterSheet />
          <InventoryDisplay />
        </div>
      </div>
    </div>
  )
}

// Test Your Luck Component
function TestLuckComponent({ testLuck }: { testLuck: any }) {
  const { testLuck: performLuckTest, goToSection, rollTwoDice } = useGameStore()
  const [result, setResult] = useState<string | null>(null)

  const handleTestLuck = () => {
    const { success } = performLuckTest()
    if (success) {
      setResult('Lucky!')
      if (testLuck.successSection) {
        setTimeout(() => goToSection(testLuck.successSection), 2000)
      }
    } else {
      setResult('Unlucky!')
      if (testLuck.failureSection) {
        setTimeout(() => goToSection(testLuck.failureSection), 2000)
      }
    }
  }

  return (
    <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
      <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
        Test Your Luck!
      </h4>
      {!result ? (
        <button
          onClick={handleTestLuck}
          className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          Roll the Dice
        </button>
      ) : (
        <p className="text-lg font-semibold">{result}</p>
      )}
    </div>
  )
}

