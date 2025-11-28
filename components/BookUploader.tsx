'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Book } from '@/types/game'
import { convertTextToBook } from '@/utils/adventureParser'

export default function BookUploader() {
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const { loadBook, currentBook, startGame } = useGameStore()

  const validateBook = (book: any): book is Book => {
    if (!book.id || !book.title || !book.sections || !book.initialStats) {
      return false
    }
    if (!Array.isArray(book.sections) || book.sections.length === 0) {
      return false
    }
    return true
  }

  const handleFile = async (file: File) => {
    setError(null)
    setLoading(true)

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase()

      if (fileExt === 'json') {
        // Handle JSON files
        const text = await file.text()
        const data = JSON.parse(text)

        if (!validateBook(data)) {
          setError('Invalid book format. Please check the JSON structure.')
          return
        }

        loadBook(data)
      } else if (fileExt === 'txt' || fileExt === 'md') {
        // Handle TXT and Markdown files
        const text = await file.text()

        try {
          const book = convertTextToBook(text)

          if (!validateBook(book)) {
            setError('Could not parse adventure file. Please check the format.')
            return
          }

          loadBook(book)
        } catch (parseError: any) {
          setError(`Error parsing adventure: ${parseError.message}`)
          return
        }
      } else if (fileExt === 'pdf') {
        // Handle PDF files - use dynamic import to avoid SSR issues
        try {
          const arrayBuffer = await file.arrayBuffer()

          // Dynamically import PDF parser only when needed (client-side only)
          const { extractTextFromPDF } = await import('@/utils/pdfParser')
          const text = await extractTextFromPDF(arrayBuffer)

          const book = convertTextToBook(text)

          if (!validateBook(book)) {
            setError('Could not parse adventure from PDF. Please check the format.')
            return
          }

          loadBook(book)
        } catch (pdfError: any) {
          setError(`Error parsing PDF: ${pdfError.message}`)
          return
        }
      } else {
        setError('Please upload a JSON, TXT, MD, or PDF file')
        return
      }
    } catch (err) {
      setError('Error reading file: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const loadExampleBook = () => {
    // Load the example book from public/example-adventure.json
    fetch('/example-adventure.json')
      .then(res => res.json())
      .then(data => {
        if (validateBook(data)) {
          loadBook(data)
        } else {
          setError('Example book has invalid format')
        }
      })
      .catch(err => {
        setError('Could not load example book: ' + err.message)
      })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
        Load Adventure Book
      </h2>

      {!currentBook ? (
        <>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-amber-500 bg-amber-50 dark:bg-gray-700'
                : 'border-gray-300 dark:border-gray-600 hover:border-amber-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              accept=".json,.txt,.md,.pdf"
              onChange={handleChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg
                className="w-16 h-16 mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                Drop your adventure file here
              </span>
              <span className="text-sm text-gray-500">
                Supports JSON, TXT, Markdown (.md), and PDF files
              </span>
              <span className="text-xs text-gray-400 mt-1">or click to browse</span>
            </label>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={loadExampleBook}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Load Example Adventure
            </button>
          </div>

          {loading && (
            <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-100 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 dark:border-blue-100"></div>
                <span>Converting adventure...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-100">
              {error}
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="mb-6 p-6 bg-amber-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">
              {currentBook.title}
            </h3>
            {currentBook.author && (
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                By {currentBook.author}
              </p>
            )}
            {currentBook.description && (
              <p className="text-gray-700 dark:text-gray-200 mb-4">
                {currentBook.description}
              </p>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Starting Stats:</p>
              <ul className="list-disc list-inside mt-2">
                <li>SKILL: {currentBook.initialStats.skill}</li>
                <li>STAMINA: {currentBook.initialStats.stamina}</li>
                <li>LUCK: {currentBook.initialStats.luck}</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={startGame}
              className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              Start Adventure
            </button>
            <button
              onClick={() => loadBook(null as any)}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Choose Different Book
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
