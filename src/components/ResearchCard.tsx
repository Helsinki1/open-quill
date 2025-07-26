'use client';

import React from 'react';

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

interface ResearchCardProps {
  article: ResearchArticle;
}

export default function ResearchCard({ article }: ResearchCardProps) {
  const handleOpenUrl = () => {
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenPdf = () => {
    if (article.pdfUrl) {
      window.open(article.pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer" onClick={handleOpenUrl}>
      {/* Header with relevance score */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
            {article.title}
          </h3>
        </div>
        {article.relevanceScore && (
          <div className="ml-2 flex-shrink-0">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {article.relevanceScore}/10
            </span>
          </div>
        )}
      </div>

      {/* Authors and metadata */}
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        <p className="line-clamp-1">{article.authors}</p>
        <p className="flex items-center gap-2 mt-1">
          <span>{article.published}</span>
          <span>•</span>
          <span>{article.source}</span>
        </p>
      </div>

      {/* Abstract - Show first 150 characters */}
      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
        {article.abstract.length > 150 
          ? `${article.abstract.substring(0, 150)}...` 
          : article.abstract
        }
      </p>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenUrl();
          }}
          className="flex-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          View Article
        </button>
        {article.pdfUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPdf();
            }}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            PDF
          </button>
        )}
      </div>
    </div>
  );
} 