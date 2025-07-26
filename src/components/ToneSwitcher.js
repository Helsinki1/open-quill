'use client'

import { motion } from 'framer-motion'
import { Briefcase, MessageCircle, Sparkles, Zap, Loader2 } from 'lucide-react'
import { useEffect } from 'react'

const tones = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal, business-appropriate',
    icon: Briefcase,
    color: 'blue'
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Friendly, conversational',
    icon: MessageCircle,
    color: 'green'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Engaging, imaginative',
    icon: Sparkles,
    color: 'purple'
  },
  {
    id: 'concise',
    name: 'Concise',
    description: 'Direct, brief',
    icon: Zap,
    color: 'orange'
  }
]

export function ToneSwitcher({ currentTone, onToneChange, isLoading }) {
  // Keyboard shortcuts for tone switching
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        const currentIndex = tones.findIndex(tone => tone.id === currentTone)
        let newIndex
        
        if (e.key === 'ArrowUp') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : tones.length - 1
        } else {
          newIndex = currentIndex < tones.length - 1 ? currentIndex + 1 : 0
        }
        
        onToneChange(tones[newIndex].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTone, onToneChange])

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Writing Tone
          </h3>
          {isLoading && (
            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Use <span className="keyboard-shortcut">⌘↑↓</span> to switch
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {tones.map((tone) => {
          const Icon = tone.icon
          const isActive = currentTone === tone.id
          
          return (
            <motion.button
              key={tone.id}
              onClick={() => onToneChange(tone.id)}
              className={`
                relative p-3 rounded-lg text-left transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 shadow-sm' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                border
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon 
                  className={`w-4 h-4 ${
                    isActive 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                  }`} 
                />
                <span 
                  className={`text-sm font-medium ${
                    isActive 
                      ? 'text-primary-900 dark:text-primary-100' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {tone.name}
                </span>
              </div>
              <p 
                className={`text-xs ${
                  isActive 
                    ? 'text-primary-700 dark:text-primary-300' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {tone.description}
              </p>
              
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-lg ring-2 ring-primary-500/20"
                  layoutId="activeTone"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
} 