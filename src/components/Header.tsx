'use client';

import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OQ</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              Open Quill
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="https://github.com/Helsinki1/tab-writer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
            
          </nav>
        </div>
      </div>
    </header>
  );
} 