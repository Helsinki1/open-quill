import React, { useState, useEffect } from 'react';

interface ToneAnalysisData {
  detectedTone: string;
  detectedPurpose: string;
  suggestions: string[];
}

interface ToneAnalysisCardProps {
  isVisible: boolean;
  editorText: string;
  onClose: () => void;
}

export default function ToneAnalysisCard({ isVisible, editorText, onClose }: ToneAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<ToneAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced text analysis
  useEffect(() => {
    if (!isVisible || !editorText.trim() || editorText.length < 10) {
      setAnalysis(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/tone-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: editorText }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to analyze tone');
        }
        
        setAnalysis({
          detectedTone: data.detectedTone,
          detectedPurpose: data.detectedPurpose,
          suggestions: data.suggestions
        });
      } catch (err) {
        console.error('Tone analysis error:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setIsLoading(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [editorText, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Tone Analysis</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">Analyzing...</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 py-2">
            {error}
          </div>
        )}

        {analysis && !isLoading && (
          <div className="space-y-3">
            {/* Detected Tone and Purpose */}
            <div className="flex space-x-4 text-xs">
              <div>
                <span className="text-gray-500">Tone:</span>
                <span className="ml-1 font-medium text-gray-900 capitalize">
                  {analysis.detectedTone}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Purpose:</span>
                <span className="ml-1 font-medium text-gray-900 capitalize">
                  {analysis.detectedPurpose}
                </span>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Suggestions:</h4>
              <ul className="space-y-1">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-1 mt-0.5">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!analysis && !isLoading && !error && editorText.length < 10 && (
          <div className="text-xs text-gray-500 py-2">
            Add more text for tone analysis
          </div>
        )}
      </div>
    </div>
  );
} 