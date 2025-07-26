'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $getSelection, $isRangeSelection } from 'lexical'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Lightbulb } from 'lucide-react'

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Autocomplete Plugin
function AutocompletePlugin({ currentTone, onSuggestionChange, isLoading, suggestion }) {
  const [editor] = useLexicalComposerContext()
  const [currentText, setCurrentText] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const debouncedText = useDebounce(currentText, 500)
  const suggestionTimeoutRef = useRef(null)

  const fetchSuggestion = async (text) => {
    if (!text.trim() || text.length < 10) {
      onSuggestionChange('', false)
      return
    }

    try {
      onSuggestionChange('', true)
      
      const response = await fetch('/api/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          tone: currentTone
        })
      })

      const data = await response.json()
      
      if (data.status === 'success' && data.suggestion) {
        onSuggestionChange(data.suggestion, false)
      } else {
        onSuggestionChange('', false)
      }
    } catch (error) {
      console.error('Autocomplete error:', error)
      onSuggestionChange('', false)
    }
  }

  useEffect(() => {
    if (debouncedText && debouncedText.trim().length >= 10) {
      fetchSuggestion(debouncedText)
    } else {
      onSuggestionChange('', false)
    }
  }, [debouncedText, currentTone])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && suggestion) {
        e.preventDefault()
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            selection.insertText(suggestion)
          }
        })
        onSuggestionChange('', false)
      } else if (e.key === 'Escape') {
        onSuggestionChange('', false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor, suggestion, onSuggestionChange])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot()
        const textContent = root.getTextContent()
        setCurrentText(textContent)
      })
    })
  }, [editor])

  return null
}

// Error Boundary
function ErrorBoundary({ children, onError = () => {} }) {
  return children
}

const editorConfig = {
  namespace: 'TabWriterEditor',
  theme: {
    root: 'editor-content',
    paragraph: 'mb-2',
  },
  onError: (error) => {
    console.error('Lexical Editor Error:', error)
  },
}

export function Editor({ 
  content, 
  onContentChange, 
  currentTone, 
  suggestion, 
  onSuggestionChange, 
  isLoading 
}) {
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = useCallback((editorState) => {
    editorState.read(() => {
      const root = $getRoot()
      const text = root.getTextContent()
      onContentChange(text)
    })
  }, [onContentChange])

  return (
    <div className="space-y-2">
      {/* Editor Status */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <span>Writing Assistant</span>
          {isLoading && (
            <div className="flex items-center space-x-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">Thinking...</span>
            </div>
          )}
          {suggestion && !isLoading && (
            <div className="flex items-center space-x-1 text-primary-600 dark:text-primary-400">
              <Lightbulb className="w-3 h-3" />
              <span className="text-xs">Suggestion ready</span>
            </div>
          )}
        </div>
        <div className="text-xs">
          Press <span className="keyboard-shortcut">Tab</span> to accept • <span className="keyboard-shortcut">Esc</span> to dismiss
        </div>
      </div>

      {/* Main Editor */}
      <motion.div 
        className={`editor-container ${isFocused ? 'ring-2 ring-primary-500/20 border-primary-500' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <LexicalComposer initialConfig={editorConfig}>
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-content focus:outline-none"
                  placeholder={
                    <div className="absolute inset-0 pointer-events-none text-gray-400 dark:text-gray-500 text-lg leading-relaxed p-4">
                      Start writing and let AI help you continue...
                    </div>
                  }
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              }
              ErrorBoundary={ErrorBoundary}
            />
            <OnChangePlugin onChange={handleChange} />
            <HistoryPlugin />
            <AutocompletePlugin
              currentTone={currentTone}
              onSuggestionChange={onSuggestionChange}
              isLoading={isLoading}
              suggestion={suggestion}
            />

            {/* Suggestion Overlay */}
            <AnimatePresence>
              {suggestion && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-4 right-4 max-w-md"
                >
                  <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-3 shadow-lg backdrop-blur-sm">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-primary-700 dark:text-primary-300 font-medium mb-1">
                          AI Suggestion ({currentTone})
                        </p>
                        <p className="text-sm text-primary-900 dark:text-primary-100 italic">
                          {suggestion}
                        </p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-primary-600 dark:text-primary-400">
                          <span className="keyboard-shortcut">Tab</span>
                          <span>to accept</span>
                          <span className="keyboard-shortcut">Esc</span>
                          <span>to dismiss</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </LexicalComposer>
      </motion.div>
    </div>
  )
} 