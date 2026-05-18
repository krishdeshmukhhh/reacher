'use client';

import { useState, useEffect } from 'react';
import type { CreatorList } from '@/lib/types';
import ListCard from '@/components/lists/ListCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

export default function ListsPage() {
  const [lists, setLists] = useState<CreatorList[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchLists() {
    const res = await fetch('/api/lists');
    const data = await res.json();
    setLists(data.lists);
    setLoading(false);
  }

  useEffect(() => { fetchLists(); }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/lists/${id}`, { method: 'DELETE' });
    setLists((prev) => prev.filter((l) => l.id !== id));
    setToast('List deleted');
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Creator Lists</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage and organize your saved creator lists</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.location.href = '/search'}>
          + Add creators
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400 text-sm">Loading…</div>
      ) : lists.length === 0 ? (
        <EmptyState
          title="No lists yet"
          description="Search for creators and save them to a list to get started"
          action={<Button onClick={() => window.location.href = '/search'}>Search creators</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
