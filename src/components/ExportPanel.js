'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, Share2, Check, FileText, Hash } from 'lucide-react'

export function ExportPanel({ content }) {
  const [copied, setCopied] = useState(false)
  const [exportFormat, setExportFormat] = useState('plain')

  const copyToClipboard = async () => {
    try {
      let textToCopy = content

      // Format based on selected export format
      switch (exportFormat) {
        case 'plain':
          textToCopy = content
          break
        case 'markdown':
          // Simple markdown formatting - could be enhanced
          textToCopy = content.split('\n\n').map(paragraph => 
            paragraph.trim() ? paragraph : ''
          ).join('\n\n')
          break
        case 'hash':
          // Add hashtags for social media
          textToCopy = `${content}\n\n#Writing #AI #TabWriter`
          break
        default:
          textToCopy = content
      }

      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadAsFile = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tab-writer-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareContent = async () => {
    if (navigator.share && content.trim()) {
      try {
        await navigator.share({
          title: 'Tab Writer Content',
          text: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
        })
      } catch (error) {
        console.error('Error sharing:', error)
        // Fallback to clipboard
        copyToClipboard()
      }
    } else {
      // Fallback to clipboard
      copyToClipboard()
    }
  }

  const exportFormats = [
    { id: 'plain', name: 'Plain Text', icon: FileText },
    { id: 'markdown', name: 'Markdown', icon: Hash },
    { id: 'hash', name: 'With Hashtags', icon: Hash }
  ]

  return (
    <motion.div 
      className="analytics-card space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Export
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {content.length > 0 ? 'Ready' : 'No content'}
        </div>
      </div>

      {/* Export Format Selection */}
      <div>
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
          Format
        </label>
        <div className="grid grid-cols-1 gap-1">
          {exportFormats.map((format) => {
            const Icon = format.icon
            const isActive = exportFormat === format.id
            
            return (
              <button
                key={format.id}
                onClick={() => setExportFormat(format.id)}
                className={`
                  flex items-center space-x-2 p-2 rounded-md text-left transition-all duration-200 text-xs
                  ${isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700' 
                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                  }
                `}
              >
                <Icon className="w-3 h-3" />
                <span>{format.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Export Actions */}
      <div className="space-y-2">
        {/* Copy Button */}
        <motion.button
          onClick={copyToClipboard}
          disabled={!content.trim()}
          className={`
            w-full flex items-center justify-center space-x-2 p-3 rounded-lg font-medium transition-all duration-200
            ${content.trim() 
              ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
          whileHover={content.trim() ? { scale: 1.02 } : {}}
          whileTap={content.trim() ? { scale: 0.98 } : {}}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy to Clipboard</span>
            </>
          )}
        </motion.button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={downloadAsFile}
            disabled={!content.trim()}
            className={`
              flex items-center justify-center space-x-1 p-2 rounded-lg text-sm font-medium transition-all duration-200
              ${content.trim() 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
            whileHover={content.trim() ? { scale: 1.02 } : {}}
            whileTap={content.trim() ? { scale: 0.98 } : {}}
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </motion.button>

          <motion.button
            onClick={shareContent}
            disabled={!content.trim()}
            className={`
              flex items-center justify-center space-x-1 p-2 rounded-lg text-sm font-medium transition-all duration-200
              ${content.trim() 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
            whileHover={content.trim() ? { scale: 1.02 } : {}}
            whileTap={content.trim() ? { scale: 0.98 } : {}}
          >
            <Share2 className="w-3 h-3" />
            <span>Share</span>
          </motion.button>
        </div>
      </div>

      {/* Usage Tip */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Content is automatically saved to your browser's local storage
        </p>
      </div>
    </motion.div>
  )
} 