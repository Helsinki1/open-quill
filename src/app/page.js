'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Header } from '../components/Header'
import { Editor } from '../components/Editor'
import { ToneSwitcher } from '../components/ToneSwitcher'
import { Analytics } from '../components/Analytics'
import { ExportPanel } from '../components/ExportPanel'
import { KeyboardShortcuts } from '../components/KeyboardShortcuts'

export default function Home() {
  const [content, setContent] = useState('')
  const [currentTone, setCurrentTone] = useState('professional')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent)
  }, [])

  const handleToneChange = useCallback((newTone) => {
    setCurrentTone(newTone)
  }, [])

  const handleSuggestionChange = useCallback((newSuggestion, loading = false) => {
    setSuggestion(newSuggestion)
    setIsLoading(loading)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-8">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Tab Writer
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              AI-powered writing tool with intelligent tone-switching autocomplete
            </motion.p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Editor Section */}
            <motion.div 
              className="lg:col-span-3 space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ToneSwitcher 
                currentTone={currentTone}
                onToneChange={handleToneChange}
                isLoading={isLoading}
              />
              
              <Editor
                content={content}
                onContentChange={handleContentChange}
                currentTone={currentTone}
                suggestion={suggestion}
                onSuggestionChange={handleSuggestionChange}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Sidebar */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Analytics content={content} />
              <ExportPanel content={content} />
              <KeyboardShortcuts />
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 