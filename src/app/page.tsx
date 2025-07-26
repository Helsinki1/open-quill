'use client';

import React, { useState, useEffect } from 'react';
import WritingEditor from '../components/WritingEditor';
import Header from '../components/Header';
import ResearchPanel from '../components/ResearchPanel';
import EvidencePanel from '../components/EvidencePanel';
import ToneAnalysisCard from '../components/ToneAnalysisCard';

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

interface EvidenceItem {
  text: string;
  context: string;
  source: string;
  position: string;
  relevanceScore: number;
  relevanceReason: string;
  type: 'statistic' | 'quote';
}

interface EvidenceData {
  statistics: EvidenceItem[];
  quotes: EvidenceItem[];
  sourceInfo: {
    file: string;
    totalStatsFound?: number;
    totalQuotesFound?: number;
    relevantStatsCount?: number;
    relevantQuotesCount?: number;
  };
  recommendations: string;
}

export default function Home() {
  const [showResearch, setShowResearch] = useState(false);
  const [researchArticles, setResearchArticles] = useState<ResearchArticle[]>([]);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  
  // Evidence panel state
  const [showEvidence, setShowEvidence] = useState(false);
  const [evidenceData, setEvidenceData] = useState<EvidenceData | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  
  // Tone analysis state
  const [showToneAnalysis, setShowToneAnalysis] = useState(false);
  const [editorText, setEditorText] = useState('');

  const fetchResearchArticles = async (text: string) => {
    if (!text.trim()) return;
    
    setResearchLoading(true);
    setResearchError(null);
    
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch research articles');
      }
      
      setResearchArticles(data.articles || []);
    } catch (error: any) {
      console.error('Error fetching research articles:', error);
      setResearchError(error.message || 'Failed to fetch research articles');
    } finally {
      setResearchLoading(false);
    }
  };

  const handleToggleResearch = (text: string) => {
    if (showResearch) {
      setShowResearch(false);
      setResearchArticles([]);
      setResearchError(null);
    } else {
      setShowResearch(true);
      if (text.trim()) {
        fetchResearchArticles(text);
      }
    }
  };

  const handleEvidenceUpload = async (file: File, userText: string) => {
    setEvidenceLoading(true);
    setEvidenceError(null);
    setShowEvidence(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userText', userText);
      
      const response = await fetch('/api/evidence', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract evidence');
      }
      
      setEvidenceData(data.evidence);
    } catch (error) {
      console.error('Evidence upload error:', error);
      setEvidenceError(error instanceof Error ? error.message : 'Failed to extract evidence');
    } finally {
      setEvidenceLoading(false);
    }
  };

  const handleCloseEvidence = () => {
    setShowEvidence(false);
    setEvidenceData(null);
    setEvidenceError(null);
  };

  // Keyboard handler for tone analysis toggle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd && event.key === ']') {
        event.preventDefault();
        setShowToneAnalysis(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEditorTextChange = (text: string) => {
    setEditorText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[1075px] mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Open Quill
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              AI-assisted writing that retains your voice and style by autocompleting thoughts.
            </p>
          </div>

          {/* Writing Interface */}
          <div className="bg-white rounded-lg shadow-xl border border-gray-200">
            <WritingEditor 
              onToggleResearch={handleToggleResearch}
              showResearch={showResearch}
              onEvidenceUpload={handleEvidenceUpload}
              showEvidence={showEvidence}
              onEditorTextChange={handleEditorTextChange}
            />
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="mt-32 bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Accept suggestion:</span>
                <div className="flex space-x-1">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">Ctrl</kbd>
                  <span className="text-gray-600">+</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">Enter</kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dismiss suggestion:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">Escape</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Switch toggle up:</span>
                <div className="flex space-x-1">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">Ctrl</kbd>
                  <span className="text-gray-600">+</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">↑</kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Switch toggle down:</span>
                <div className="flex space-x-1">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">Ctrl</kbd>
                  <span className="text-gray-600">+</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">↓</kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Toggle research panel:</span>
                <div className="flex space-x-1">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">Ctrl</kbd>
                  <span className="text-gray-600">+</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">\</kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Close research panel:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">Escape</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Toggle tone analysis:</span>
                <div className="flex space-x-1">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">Ctrl</kbd>
                  <span className="text-gray-600">+</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-900">]</kbd>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              * Use Cmd instead of Ctrl on macOS
            </div>
          </div>
        </div>
      </main>

      {/* Research Panel - Fixed Right Sidebar */}
      {showResearch && (
        <div className="fixed top-0 right-0 h-full w-96 z-50 transform transition-transform duration-300 ease-in-out">
          <ResearchPanel
            articles={researchArticles}
            isLoading={researchLoading}
            error={researchError}
            onClose={() => handleToggleResearch('')}
          />
        </div>
      )}

      {/* Evidence Panel - Fixed Right Sidebar */}
      {showEvidence && (
        <div className="fixed top-0 right-0 h-full w-96 z-50 transform transition-transform duration-300 ease-in-out">
          <EvidencePanel
            evidence={evidenceData}
            isLoading={evidenceLoading}
            error={evidenceError}
            onClose={handleCloseEvidence}
          />
        </div>
      )}

      {/* Backdrop when research or evidence panel is open */}
      {(showResearch || showEvidence) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity duration-300"
          onClick={() => {
            if (showResearch) handleToggleResearch('');
            if (showEvidence) handleCloseEvidence();
          }}
        />
      )}

      {/* Tone Analysis Card */}
      <ToneAnalysisCard
        isVisible={showToneAnalysis}
        editorText={editorText}
        onClose={() => setShowToneAnalysis(false)}
      />
    </div>
  );
} 