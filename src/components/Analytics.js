'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, Clock, Target, TrendingUp } from 'lucide-react'

export function Analytics({ content }) {
  const stats = useMemo(() => {
    const text = content.trim()
    const words = text ? text.split(/\s+/).filter(word => word.length > 0) : []
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const sentences = text ? text.split(/[.!?]+/).filter(s => s.trim().length > 0) : []
    const paragraphs = text ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0) : []
    
    // Average reading speed is 200-250 words per minute
    const readingTimeMinutes = Math.max(1, Math.ceil(words.length / 225))
    
    // Average words per sentence
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(words.length / sentences.length) : 0
    
    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      readingTimeMinutes,
      avgWordsPerSentence
    }
  }, [content])

  const getReadabilityScore = () => {
    if (stats.words === 0) return { score: 0, label: 'No content', color: 'gray' }
    
    // Simple readability based on average sentence length
    if (stats.avgWordsPerSentence <= 15) {
      return { score: 85, label: 'Easy', color: 'green' }
    } else if (stats.avgWordsPerSentence <= 20) {
      return { score: 70, label: 'Moderate', color: 'yellow' }
    } else {
      return { score: 55, label: 'Complex', color: 'red' }
    }
  }

  const readability = getReadabilityScore()

  const analyticsItems = [
    {
      label: 'Words',
      value: stats.words.toLocaleString(),
      icon: FileText,
      color: 'blue',
      subtitle: `${stats.paragraphs} paragraphs`
    },
    {
      label: 'Characters',
      value: stats.characters.toLocaleString(),
      icon: Target,
      color: 'green',
      subtitle: `${stats.charactersNoSpaces} without spaces`
    },
    {
      label: 'Reading Time',
      value: `${stats.readingTimeMinutes}m`,
      icon: Clock,
      color: 'purple',
      subtitle: `~${Math.round(stats.readingTimeMinutes * 225)} words/read`
    },
    {
      label: 'Readability',
      value: readability.label,
      icon: TrendingUp,
      color: readability.color,
      subtitle: `${stats.avgWordsPerSentence} avg words/sentence`
    }
  ]

  return (
    <motion.div 
      className="analytics-card space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Analytics
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Real-time
        </div>
      </div>

      <div className="space-y-3">
        {analyticsItems.map((item, index) => {
          const Icon = item.icon
          const colorClasses = {
            blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
            green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
            purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
            yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
            red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
            gray: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
          }

          return (
            <motion.div
              key={item.label}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            >
              <div className={`p-2 rounded-lg ${colorClasses[item.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Progress Indicators */}
      {stats.words > 0 && (
        <motion.div 
          className="pt-3 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <div className="space-y-2">
            {/* Word Count Progress (toward common milestones) */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress to 500 words</span>
                <span>{Math.min(100, Math.round((stats.words / 500) * 100))}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-primary-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.words / 500) * 100)}%` }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
} 