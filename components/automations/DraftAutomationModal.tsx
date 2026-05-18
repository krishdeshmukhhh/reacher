'use client';

import { useState, useEffect } from 'react';
import type { CreatorList, Automation } from '@/lib/types';
import Button from '@/components/ui/Button';

interface DraftAutomationModalProps {
  preselectedList?: { id: string; name: string };
  onClose: () => void;
  onCreated: (automation: Automation) => void;
}

const CHANNELS = ['DM', 'Email', 'Sample Request'] as const;

export default function DraftAutomationModal({ preselectedList, onClose, onCreated }: DraftAutomationModalProps) {
  const [lists, setLists] = useState<CreatorList[]>([]);
  const [listId, setListId] = useState(preselectedList?.id || '');
  const [listName, setListName] = useState(preselectedList?.name || '');
  const [channel, setChannel] = useState<typeof CHANNELS[number]>('Sample Request');
  const [dailyLimit, setDailyLimit] = useState(10);
  const [brandName, setBrandName] = useState('');
  const [objective, setObjective] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!preselectedList) {
      fetch('/api/lists').then((r) => r.json()).then((d) => setLists(d.lists));
    }
  }, [preselectedList]);

  function handleListChange(id: string) {
    setListId(id);
    const found = lists.find((l) => l.id === id);
    if (found) setListName(found.name);
  }

  async function handleSubmit() {
    if (!listName || !channel) return;
    setSaving(true);
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, listName, channel, dailyLimit, brandName, objective }),
      });
      const data = await res.json();
      onCreated(data.automation);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-zinc-900">Draft automation</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {!preselectedList && (
            <div>
              <label className="text-xs font-medium text-zinc-600">Target list</label>
              <select
                value={listId}
                onChange={(e) => handleListChange(e.target.value)}
                className="mt-1 w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
              >
                <option value="">Select a list…</option>
                {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          )}
          {preselectedList && (
            <div>
              <label className="text-xs font-medium text-zinc-600">Target list</label>
              <p className="mt-1 text-sm text-zinc-800 font-medium">{preselectedList.name}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-600">Channel</label>
            <div className="mt-1 flex gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`flex-1 py-2 text-sm rounded-md border transition-colors ${channel === ch ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-600">Brand name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Acme Co"
                className="mt-1 w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600">Daily outreach limit</label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value) || 10)}
                min={1}
                max={50}
                className="mt-1 w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600">Objective</label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Drive sample requests for new product launch"
              className="mt-1 w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            loading={saving}
            disabled={!listName || !channel}
            onClick={handleSubmit}
          >
            Generate draft
          </Button>
        </div>
      </div>
    </div>
  );
}
