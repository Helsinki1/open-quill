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
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer" onClick={handleOpenUrl}>
      <div className="mb-2">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
          {article.title}
        </h3>

        {/* Source Badge */}
        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {article.source}
          </span>
          {article.relevanceScore && (
            <span className="text-xs text-gray-500">
              Relevance: {Math.round(article.relevanceScore * 100)}%
            </span>
          )}
        </div>

        {/* Authors and Date */}
        <div className="text-xs text-gray-600 mb-2">
          <span>{article.authors}</span>
          {article.published && (
            <>
              <span className="mx-1">•</span>
              <span>{article.published}</span>
            </>
          )}
        </div>

        {/* Abstract */}
        <p className="text-xs text-gray-700 line-clamp-2 mb-3">
          {article.abstract}
        </p>

        {/* Relevance Analysis */}
        {article.relevanceAnalysis && (
          <div className="bg-blue-50 border-l-2 border-blue-200 pl-2 py-1 mb-3">
            <p className="text-xs text-blue-800 italic">
              {article.relevanceAnalysis}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleOpenUrl}
            className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            View Article
          </button>
          {article.pdfUrl && (
            <button
              onClick={handleOpenPdf}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 