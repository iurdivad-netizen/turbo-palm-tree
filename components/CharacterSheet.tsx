'use client'

import { useGameStore } from '@/store/gameStore'

export default function CharacterSheet() {
  const { stats, undoCount } = useGameStore()

  if (!stats) return null

  const getStatColor = (current: number, initial: number) => {
    const percentage = (current / initial) * 100
    if (percentage > 66) return 'text-green-600 dark:text-green-400'
    if (percentage > 33) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const StatBar = ({ current, initial, label }: { current: number; initial: number; label: string }) => {
    const percentage = Math.min(100, Math.max(0, (current / initial) * 100))
    const colorClass = getStatColor(current, initial)

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
          <span className={`font-bold text-lg ${colorClass}`}>
            {current} / {initial}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              percentage > 66
                ? 'bg-green-500'
                : percentage > 33
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b-2 border-amber-500 pb-2">
        Character Stats
      </h3>

      <StatBar
        current={stats.skill}
        initial={stats.initialSkill}
        label="SKILL"
      />

      <StatBar
        current={stats.stamina}
        initial={stats.initialStamina}
        label="STAMINA"
      />

      <StatBar
        current={stats.luck}
        initial={stats.initialLuck}
        label="LUCK"
      />

      {/* Undo count and penalty */}
      {undoCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-300 dark:border-amber-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Undos Used:
              </span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {undoCount}
              </span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Score Penalty: -{undoCount} points
            </p>
          </div>
        </div>
      )}

      {/* Quick stat adjustment buttons (for testing/debugging) */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick Actions:</p>
        <div className="flex gap-2">
          <StatAdjustButton stat="stamina" amount={-1} label="-1 STA" />
          <StatAdjustButton stat="stamina" amount={1} label="+1 STA" />
          <StatAdjustButton stat="luck" amount={-1} label="-1 LCK" />
        </div>
      </div>
    </div>
  )
}

function StatAdjustButton({ stat, amount, label }: { stat: string; amount: number; label: string }) {
  const { modifyStats } = useGameStore()

  return (
    <button
      onClick={() => modifyStats({ [stat]: amount })}
      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
    >
      {label}
    </button>
  )
}
