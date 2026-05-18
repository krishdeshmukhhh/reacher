'use client';

import { useState, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
}

const EXAMPLE_QUERIES = [
  'find 25 fitness creators in Texas with strong sample performance',
  'wellness micro influencers with high engagement',
  'beauty creators in California over 500k followers',
  'top GMV food creators in Georgia',
];

export default function SearchBar({ onSearch, placeholder, value: controlledValue }: SearchBarProps) {
  const [value, setValue] = useState(controlledValue || '');
  const [focused, setFocused] = useState(false);

  const handleSubmit = useCallback(
    (q: string) => {
      onSearch(q);
      setFocused(false);
    },
    [onSearch]
  );

  const showSuggestions = focused && value.length === 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 border border-zinc-300 rounded-lg bg-white focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500 transition-all">
        <div className="pl-3.5 text-zinc-400">
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(value)}
          placeholder={placeholder || 'Search creators by natural language…'}
          className="flex-1 py-2.5 pr-3 text-sm text-zinc-900 placeholder-zinc-400 bg-transparent outline-none"
        />
        {value && (
          <button
            onClick={() => { setValue(''); onSearch(''); }}
            className="pr-2 text-zinc-400 hover:text-zinc-600"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <button
          onClick={() => handleSubmit(value)}
          className="mr-1.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-md hover:bg-zinc-700 transition-colors"
        >
          Search
        </button>
      </div>

      {showSuggestions && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-zinc-200 rounded-lg shadow-md z-10 py-2">
          <p className="px-3 py-1 text-xs text-zinc-400 font-medium">Try asking…</p>
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onMouseDown={() => { setValue(q); handleSubmit(q); }}
              className="w-full text-left px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              "{q}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
