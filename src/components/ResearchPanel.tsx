'use client';

import React from 'react';
import ResearchCard from './ResearchCard';

interface ResearchArticle {
  title: string;
  authors: string;
  abstract: string;
  published: string;
  url: string;
  doi?: string;
  source: string;
  relevanceScore?: number;
  relevanceAnalysis?: string;
  pdfUrl?: string;
}

interface ResearchPanelProps {
  articles: ResearchArticle[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function ResearchPanel({ articles, isLoading, error, onClose }: ResearchPanelProps) {
  return (
    <div className="w-full h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Research Articles
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-curated articles relevant to your writing
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close research panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                {/* Skeleton loading animation */}
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded mt-3"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="flex-shrink-0 w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Research Error
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && articles.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              No articles found
            </h3>
            <p className="text-xs text-gray-500 px-4">
              Type some content in the editor and press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+\</kbd> to find relevant research articles
            </p>
          </div>
        )}

        {!isLoading && !error && articles.length > 0 && (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <ResearchCard key={index} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 