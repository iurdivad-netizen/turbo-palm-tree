'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { CombatEncounter } from '@/types/game'

interface CombatManagerProps {
  combat: CombatEncounter
}

export default function CombatManager({ combat }: CombatManagerProps) {
  const {
    stats,
    inCombat,
    enemyCurrentStamina,
    combatLog,
    startCombat,
    endCombat,
    updateEnemyStamina,
    addCombatLog,
    modifyStats,
    rollDice,
    rollTwoDice,
    goToSection,
  } = useGameStore()

  const [playerRoll, setPlayerRoll] = useState<number | null>(null)
  const [enemyRoll, setEnemyRoll] = useState<number | null>(null)
  const [roundResult, setRoundResult] = useState<string | null>(null)
  const [combatEnded, setCombatEnded] = useState(false)

  useEffect(() => {
    if (!inCombat) {
      startCombat(combat.enemyStamina)
      addCombatLog(`⚔️ Combat begins with ${combat.enemyName}!`)
      addCombatLog(`${combat.enemyName}: SKILL ${combat.enemySkill}, STAMINA ${combat.enemyStamina}`)
    }
  }, [])

  const fightRound = () => {
    if (!stats || combatEnded) return

    // Reset round state
    setRoundResult(null)

    // Roll for player
    const playerDice = rollTwoDice()
    const playerAttackStrength = playerDice + stats.skill
    setPlayerRoll(playerDice)

    // Roll for enemy
    const enemyDice = rollTwoDice()
    const enemyAttackStrength = enemyDice + combat.enemySkill
    setEnemyRoll(enemyDice)

    addCombatLog(`\nRound ${combatLog.filter(l => l.includes('Round')).length + 1}:`)
    addCombatLog(`You rolled ${playerDice} + ${stats.skill} SKILL = ${playerAttackStrength}`)
    addCombatLog(`${combat.enemyName} rolled ${enemyDice} + ${combat.enemySkill} SKILL = ${enemyAttackStrength}`)

    // Determine winner
    if (playerAttackStrength > enemyAttackStrength) {
      // Player wins
      const newEnemyStamina = enemyCurrentStamina - 2
      updateEnemyStamina(newEnemyStamina)
      setRoundResult('victory')
      addCombatLog(`💥 You hit ${combat.enemyName} for 2 damage! (${newEnemyStamina} STAMINA remaining)`)

      if (newEnemyStamina <= 0) {
        addCombatLog(`\n🎉 You defeated ${combat.enemyName}!`)
        setCombatEnded(true)
        setTimeout(() => {
          endCombat()
          if (combat.onVictorySection) {
            goToSection(combat.onVictorySection)
          }
        }, 2000)
      }
    } else if (enemyAttackStrength > playerAttackStrength) {
      // Enemy wins
      modifyStats({ stamina: -2 })
      setRoundResult('defeat')
      addCombatLog(`💔 ${combat.enemyName} hits you for 2 damage!`)

      if (stats.stamina - 2 <= 0) {
        addCombatLog(`\n💀 You have been defeated...`)
        setCombatEnded(true)
        setTimeout(() => {
          endCombat()
          if (combat.onDefeatSection) {
            goToSection(combat.onDefeatSection)
          }
        }, 2000)
      }
    } else {
      // Tie
      setRoundResult('tie')
      addCombatLog(`⚡ Your blows meet! No damage dealt.`)
    }

    // Reset dice display after a moment
    setTimeout(() => {
      setPlayerRoll(null)
      setEnemyRoll(null)
      setRoundResult(null)
    }, 2000)
  }

  const flee = () => {
    if (combat.canFlee && combat.fleeSection) {
      addCombatLog(`\n🏃 You flee from ${combat.enemyName}!`)
      endCombat()
      goToSection(combat.fleeSection)
    }
  }

  if (!stats) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
          ⚔️ Combat!
        </h3>
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {combat.enemyName}
        </p>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">SKILL</p>
            <p className="text-2xl font-bold">{combat.enemySkill}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">STAMINA</p>
            <p className={`text-2xl font-bold ${enemyCurrentStamina <= combat.enemyStamina / 3 ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
              {enemyCurrentStamina}
            </p>
          </div>
        </div>
      </div>

      {/* Dice display */}
      {(playerRoll || enemyRoll) && (
        <div className="flex justify-around mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Roll</p>
            <div className="text-4xl">🎲</div>
            <p className="text-2xl font-bold mt-2">{playerRoll}</p>
            <p className="text-sm text-gray-500">+ {stats.skill} = {playerRoll! + stats.skill}</p>
          </div>
          <div className="text-center flex items-center">
            <span className="text-2xl">
              {roundResult === 'victory' && '💥'}
              {roundResult === 'defeat' && '💔'}
              {roundResult === 'tie' && '⚡'}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Enemy Roll</p>
            <div className="text-4xl">🎲</div>
            <p className="text-2xl font-bold mt-2">{enemyRoll}</p>
            <p className="text-sm text-gray-500">+ {combat.enemySkill} = {enemyRoll! + combat.enemySkill}</p>
          </div>
        </div>
      )}

      {/* Combat log */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto">
        <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">Combat Log:</h4>
        <div className="space-y-1 text-sm font-mono">
          {combatLog.map((log, index) => (
            <div key={index} className="text-gray-700 dark:text-gray-300">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Combat actions */}
      {!combatEnded && (
        <div className="flex gap-4">
          <button
            onClick={fightRound}
            disabled={playerRoll !== null}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            Fight Round
          </button>
          {combat.canFlee && (
            <button
              onClick={flee}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
            >
              Flee
            </button>
          )}
        </div>
      )}

      {combatEnded && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          Continuing...
        </div>
      )}
    </div>
  )
}
