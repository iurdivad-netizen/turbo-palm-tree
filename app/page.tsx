'use client'

import { useState } from 'react'
import BookUploader from '@/components/BookUploader'
import GameReader from '@/components/GameReader'
import { useGameStore } from '@/store/gameStore'

export default function Home() {
  const { currentBook, isGameStarted } = useGameStore()

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-900 dark:text-amber-100">
          Fighting Fantasy
        </h1>

        {!isGameStarted ? (
          <BookUploader />
        ) : (
          <GameReader />
        )}
      </div>
    </main>
  )
}
