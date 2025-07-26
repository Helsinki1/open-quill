'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, ChevronDown, ChevronUp } from 'lucide-react'

const shortcuts = [
  {
    category: 'Autocomplete',
    items: [
      { keys: ['Tab'], description: 'Accept AI suggestion' },
      { keys: ['Escape'], description: 'Dismiss suggestion' },
    ]
  },
  {
    category: 'Tone Switching',
    items: [
      { keys: ['Ctrl', '↑'], description: 'Switch to previous tone', mac: ['Cmd', '↑'] },
      { keys: ['Ctrl', '↓'], description: 'Switch to next tone', mac: ['Cmd', '↓'] },
    ]
  },
  {
    category: 'Editor',
    items: [
      { keys: ['Ctrl', 'Z'], description: 'Undo', mac: ['Cmd', 'Z'] },
      { keys: ['Ctrl', 'Y'], description: 'Redo', mac: ['Cmd', 'Shift', 'Z'] },
      { keys: ['Ctrl', 'A'], description: 'Select all', mac: ['Cmd', 'A'] },
    ]
  },
  {
    category: 'Theme',
    items: [
      { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle theme', mac: ['Cmd', 'Shift', 'T'] },
    ]
  }
]

function KeyboardKey({ keyName }) {
  return (
    <span className="keyboard-shortcut">
      {keyName}
    </span>
  )
}

function ShortcutItem({ shortcut }) {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const keys = isMac && shortcut.mac ? shortcut.mac : shortcut.keys

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">
        {shortcut.description}
      </span>
      <div className="flex items-center space-x-1">
        {keys.map((key, index) => (
          <div key={index} className="flex items-center space-x-1">
            <KeyboardKey keyName={key} />
            {index < keys.length - 1 && (
              <span className="text-xs text-gray-400">+</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function KeyboardShortcuts() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div 
      className="analytics-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center space-x-2">
          <Keyboard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {shortcuts.map((category, categoryIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                >
                  <h4 className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-2 px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded">
                    {category.category}
                  </h4>
                  <div className="space-y-1">
                    {category.items.map((shortcut, shortcutIndex) => (
                      <motion.div
                        key={shortcutIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: categoryIndex * 0.1 + shortcutIndex * 0.05 
                        }}
                      >
                        <ShortcutItem shortcut={shortcut} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Help Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="pt-3 border-t border-gray-200 dark:border-gray-700"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Most shortcuts work globally while the editor is active
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 