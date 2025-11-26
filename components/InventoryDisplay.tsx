'use client'

import { useGameStore } from '@/store/gameStore'
import { Item } from '@/types/game'

export default function InventoryDisplay() {
  const { inventory, removeItem } = useGameStore()

  const getItemIcon = (type?: string) => {
    switch (type) {
      case 'weapon':
        return '⚔️'
      case 'armor':
        return '🛡️'
      case 'potion':
        return '🧪'
      case 'treasure':
        return '💎'
      case 'key':
        return '🔑'
      default:
        return '📦'
    }
  }

  const getItemColor = (type?: string) => {
    switch (type) {
      case 'weapon':
        return 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900'
      case 'armor':
        return 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900'
      case 'potion':
        return 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900'
      case 'treasure':
        return 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900'
      case 'key':
        return 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900'
      default:
        return 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b-2 border-amber-500 pb-2">
        Inventory
      </h3>

      {inventory.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Your inventory is empty
        </p>
      ) : (
        <div className="space-y-3">
          {inventory.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`p-3 rounded-lg border-2 ${getItemColor(item.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-2xl">{getItemIcon(item.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      {item.name}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.type && (
                      <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 inline-block">
                        {item.type}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Items: {inventory.length}
        </p>
      </div>
    </div>
  )
}
