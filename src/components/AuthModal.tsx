'use client'

import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  darkMode?: boolean
}

export default function AuthModal({ isOpen, onClose, darkMode = false }: AuthModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign in to Chameleon
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Create an account or sign in to unlock copy features.
          </p>
        </div>

        {!isSupabaseConfigured() ? (
          <div className="text-center py-8">
            <div className="text-yellow-600 dark:text-yellow-400 mb-4">
              ⚠️ Authentication not configured
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please set up your Supabase credentials to enable authentication.
              See SUPABASE_SETUP.md for instructions.
            </p>
          </div>
        ) : (
          <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: darkMode ? '#4f46e5' : '#6366f1',
                  brandAccent: darkMode ? '#4338ca' : '#5b21b6',
                  defaultButtonBackground: darkMode ? '#374151' : '#f3f4f6',
                  defaultButtonBackgroundHover: darkMode ? '#4b5563' : '#e5e7eb',
                  defaultButtonBorder: darkMode ? '#4b5563' : '#d1d5db',
                  defaultButtonText: darkMode ? '#f9fafb' : '#374151',
                  dividerBackground: darkMode ? '#4b5563' : '#e5e7eb',
                  inputBackground: darkMode ? '#374151' : '#ffffff',
                  inputBorder: darkMode ? '#4b5563' : '#d1d5db',
                  inputBorderHover: darkMode ? '#6b7280' : '#9ca3af',
                  inputBorderFocus: darkMode ? '#4f46e5' : '#6366f1',
                  inputText: darkMode ? '#f9fafb' : '#111827',
                  inputPlaceholder: darkMode ? '#9ca3af' : '#6b7280',
                }
              }
            },
            className: {
              container: darkMode ? 'dark' : '',
              label: darkMode ? 'text-gray-200' : 'text-gray-700',
              button: 'transition-colors duration-200',
            }
          }}
          providers={['google', 'github']}
          redirectTo={`${window.location.origin}/`}
        />
        )}
      </div>
    </div>
  )
} 