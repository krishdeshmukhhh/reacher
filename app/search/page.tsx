'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Creator, SearchFilters } from '@/lib/types';
import SearchBar from '@/components/creators/SearchBar';
import FilterBar from '@/components/creators/FilterBar';
import CreatorTable from '@/components/creators/CreatorTable';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import SaveToListModal from '@/components/creators/SaveToListModal';
import DraftAutomationModal from '@/components/automations/DraftAutomationModal';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Partial<SearchFilters>>({});
  const [creators, setCreators] = useState<Creator[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchCreators = useCallback(async (q: string, f: Partial<SearchFilters>) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (f.niche) params.set('niche', f.niche);
    if (f.region) params.set('region', f.region);
    if (f.minFollowers) params.set('minFollowers', String(f.minFollowers));
    if (f.maxFollowers) params.set('maxFollowers', String(f.maxFollowers));
    if (f.minGmvScore) params.set('minGmvScore', String(f.minGmvScore));
    if (f.emailOnly) params.set('emailOnly', 'true');

    try {
      const res = await fetch(`/api/creators?${params}`);
      const data = await res.json();
      setCreators(data.creators);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreators(query, filters);
  }, [query, filters, fetchCreators]);

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSelectAll(ids: string[]) {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set([...prev, ...ids]);
    });
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Creator Search</h1>
        <p className="text-sm text-zinc-400 mt-1">Search by natural language or use filters to find the right creators</p>
      </div>

      <div className="space-y-3 mb-6">
        <SearchBar onSearch={setQuery} />
        <FilterBar filters={filters} onChange={setFilters} resultCount={total} />
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-zinc-900 text-white rounded-lg">
          <span className="text-sm font-medium">{selectedIds.size} creator{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setShowAutoModal(true)}
              className="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
            >
              Draft automation
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="text-xs px-3 py-1.5 rounded-md bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
            >
              Save to list
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-zinc-400">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm">Searching…</span>
            </div>
          </div>
        ) : creators.length === 0 ? (
          <EmptyState
            title="No creators found"
            description="Try adjusting your search query or filters"
          />
        ) : (
          <div className="p-5">
            <CreatorTable
              creators={creators}
              selectable
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
            />
          </div>
        )}
      </div>

      {showSaveModal && (
        <SaveToListModal
          selectedCount={selectedIds.size}
          selectedIds={Array.from(selectedIds)}
          onClose={() => setShowSaveModal(false)}
          onSaved={() => {
            setShowSaveModal(false);
            setSelectedIds(new Set());
            showToast(`${selectedIds.size} creators saved to list`);
          }}
        />
      )}

      {showAutoModal && (
        <DraftAutomationModal
          onClose={() => setShowAutoModal(false)}
          onCreated={() => {
            setShowAutoModal(false);
            showToast('Automation draft created');
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
