import React from 'react';
import PeopleSearch from './PeopleSearch';

interface PeoplePanelProps {
  onClose: () => void;
}

export default function PeoplePanel({ onClose }: PeoplePanelProps) {
  return (
    <div className="w-full h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">People Search</h2>
          <p className="text-sm text-gray-600 mt-1">Summarize a person's background using AI</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
          title="Close"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <PeopleSearch />
      </div>
    </div>
  );
}
