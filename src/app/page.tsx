'use client';

import React, { useState } from 'react';
import WritingEditor from '../components/WritingEditor';
import ThemeToggle from '../components/ThemeToggle';
import Header from '../components/Header';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Open Quill
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                AI-assisted writing that retains your voice and style by autocompleting thoughts.
              </p>
              
              {/* Theme Toggle */}
              <div className="flex justify-center items-center gap-4 mb-8">
                <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
              </div>
            </div>

            {/* Writing Interface */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              <WritingEditor />
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4">
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Accept suggestion:</span>
                  <div className="flex space-x-1">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-300">Ctrl</kbd>
                    <span className="text-gray-600 dark:text-gray-400">+</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-300">Enter</kbd>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dismiss suggestion:</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-300">Escape</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Switch tone up:</span>
                  <div className="flex space-x-1">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-300">Ctrl</kbd>
                    <span className="text-gray-600 dark:text-gray-400">+</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-300">↑</kbd>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Switch tone down:</span>
                  <div className="flex space-x-1">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-300">Ctrl</kbd>
                    <span className="text-gray-600 dark:text-gray-400">+</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-300">↓</kbd>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                * Use Cmd instead of Ctrl on macOS
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 