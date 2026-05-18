'use client';

import { useState, useEffect } from 'react';
import type { CreatorList } from '@/lib/types';
import Button from '@/components/ui/Button';

interface SaveToListModalProps {
  selectedCount: number;
  selectedIds: string[];
  onClose: () => void;
  onSaved: () => void;
}

export default function SaveToListModal({ selectedCount, selectedIds, onClose, onSaved }: SaveToListModalProps) {
  const [lists, setLists] = useState<CreatorList[]>([]);
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedListId, setSelectedListId] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/lists').then((r) => r.json()).then((d) => setLists(d.lists));
  }, []);

  async function handleSave() {
    if (!newListName && !selectedListId) return;
    setSaving(true);

    try {
      if (mode === 'new') {
        await fetch('/api/lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newListName, description: newListDesc, creatorIds: selectedIds }),
        });
      } else {
        const list = lists.find((l) => l.id === selectedListId);
        if (!list) return;
        const merged = Array.from(new Set([...list.creatorIds, ...selectedIds]));
        await fetch(`/api/lists/${selectedListId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorIds: merged }),
        });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-zinc-900">Save {selectedCount} creators to list</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 py-2 text-sm rounded-md border transition-colors ${mode === 'existing' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
            onClick={() => setMode('existing')}
          >
            Add to existing
          </button>
          <button
            className={`flex-1 py-2 text-sm rounded-md border transition-colors ${mode === 'new' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
            onClick={() => setMode('new')}
          >
            Create new list
          </button>
        </div>

        {mode === 'existing' ? (
          <div className="space-y-2">
            {lists.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-4">No lists yet. Create one first.</p>
            ) : (
              lists.map((l) => (
                <label key={l.id} className="flex items-center gap-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50">
                  <input
                    type="radio"
                    name="list"
                    value={l.id}
                    checked={selectedListId === l.id}
                    onChange={() => setSelectedListId(l.id)}
                    className="text-zinc-900"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{l.name}</p>
                    <p className="text-xs text-zinc-400">{l.creatorIds.length} creators</p>
                  </div>
                </label>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-zinc-600">List name</label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g. Fitness Creators Q3"
                className="mt-1 w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600">Description (optional)</label>
              <input
                type="text"
                value={newListDesc}
                onChange={(e) => setNewListDesc(e.target.value)}
                placeholder="Add context for this list"
                className="mt-1 w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            loading={saving}
            disabled={mode === 'existing' ? !selectedListId : !newListName}
            onClick={handleSave}
          >
            Save to list
          </Button>
        </div>
      </div>
    </div>
  );
}
