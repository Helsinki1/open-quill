'use client';

import React from 'react';

interface EvidenceItem {
  text: string;
  context: string;
  source: string;
  position: string;
  relevanceScore: number;
  relevanceReason: string;
  type: 'statistic' | 'quote';
}

interface EvidenceCardProps {
  evidence: EvidenceItem;
}

export default function EvidenceCard({ evidence }: EvidenceCardProps) {
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(evidence.text);
  };

  const isStatistic = evidence.type === 'statistic';

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
      <div className="mb-2">
        {/* Type Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isStatistic 
              ? 'bg-green-100 text-green-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {isStatistic ? '📊 Statistic' : '💬 Quote'}
          </span>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded p-2 mb-2 border-l-3 border-l-blue-400">
          <p className="text-sm text-gray-900 font-medium">
            "{evidence.text}"
          </p>
        </div>

        {/* Context */}
        <div className="text-xs text-gray-600 mb-2">
          <span className="font-medium">Context:</span>
          <p className="mt-1 line-clamp-2">
            {evidence.context}
          </p>
        </div>

        {/* Source and Position */}
        <div className="text-xs text-gray-500 mb-2">
          {evidence.source && (
            <>
              <span className="font-medium">Source:</span>
              <span className="ml-1">{evidence.source}</span>
              {evidence.position && (
                <>
                  <span className="mx-1">•</span>
                  <span>{evidence.position}</span>
                </>
              )}
            </>
          )}
        </div>



        {/* Action Button */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleCopyToClipboard}
            className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            title="Copy evidence to clipboard"
          >
            Copy Text
          </button>
        </div>
      </div>
    </div>
  );
} 