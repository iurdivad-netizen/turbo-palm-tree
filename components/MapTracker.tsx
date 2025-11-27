'use client'

import { useGameStore } from '@/store/gameStore'
import { useState } from 'react'

export default function MapTracker() {
  const { visitedSections, currentSection, goToSection, currentBook } = useGameStore()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!currentBook) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b-2 border-amber-500 pb-2">
          Journey Map
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sections visited: {visitedSections.length}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Current: Section {currentSection}
        </p>
      </div>

      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-5 gap-2">
            {visitedSections.map((sectionId, index) => (
              <button
                key={`${sectionId}-${index}`}
                onClick={() => goToSection(sectionId)}
                className={`p-2 rounded-lg text-sm font-semibold transition-colors ${
                  sectionId === currentSection
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-300 dark:hover:bg-amber-600'
                }`}
                title={`Go to section ${sectionId}`}
              >
                {sectionId}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isExpanded && visitedSections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visitedSections.slice(-10).map((sectionId, index) => (
            <span
              key={`${sectionId}-${index}`}
              className={`px-2 py-1 rounded text-xs font-semibold ${
                sectionId === currentSection
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {sectionId}
            </span>
          ))}
          {visitedSections.length > 10 && (
            <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
              +{visitedSections.length - 10} more
            </span>
          )}
        </div>
      )}

      {/* Path visualization */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Recent Path:
        </h4>
        <div className="flex items-center gap-1 flex-wrap">
          {visitedSections.slice(-5).map((sectionId, index) => (
            <div key={`path-${sectionId}-${index}`} className="flex items-center">
              <span
                className={`px-2 py-1 rounded text-xs font-mono ${
                  sectionId === currentSection
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {sectionId}
              </span>
              {index < visitedSections.slice(-5).length - 1 && (
                <span className="mx-1 text-gray-400">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
