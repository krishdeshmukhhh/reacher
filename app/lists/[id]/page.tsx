'use client';

import { useState, useEffect, use } from 'react';
import type { Creator, CreatorList } from '@/lib/types';
import { formatFollowers } from '@/lib/creatorSearch';
import CreatorTable from '@/components/creators/CreatorTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/Card';
import DraftAutomationModal from '@/components/automations/DraftAutomationModal';
import Link from 'next/link';

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [list, setList] = useState<CreatorList | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [listRes, creatorsRes] = await Promise.all([
        fetch(`/api/lists/${id}`),
        fetch('/api/creators'),
      ]);
      const listData = await listRes.json();
      const creatorsData = await creatorsRes.json();

      const l: CreatorList = listData.list;
      setList(l);
      setCreators(creatorsData.creators.filter((c: Creator) => l.creatorIds.includes(c.id)));
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleRemoveCreator(creatorId: string) {
    if (!list) return;
    const updated = list.creatorIds.filter((cid) => cid !== creatorId);
    await fetch(`/api/lists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorIds: updated }),
    });
    setList({ ...list, creatorIds: updated });
    setCreators((prev) => prev.filter((c) => c.id !== creatorId));
    setToast('Creator removed from list');
    setTimeout(() => setToast(null), 3000);
  }

  if (loading) return <div className="p-8 text-sm text-zinc-400">Loading…</div>;
  if (!list) return <div className="p-8 text-sm text-zinc-400">List not found</div>;

  const avgGmv = creators.length ? (creators.reduce((s, c) => s + c.gmvScore, 0) / creators.length).toFixed(1) : '—';
  const avgEng = creators.length ? (creators.reduce((s, c) => s + c.engagementRate, 0) / creators.length).toFixed(1) : '—';
  const totalFollowers = creators.reduce((s, c) => s + c.followers, 0);

  return (
    <div className="p-8">
      <div className="mb-2">
        <Link href="/lists" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">← Lists</Link>
      </div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{list.name}</h1>
          {list.description && <p className="text-sm text-zinc-400 mt-1">{list.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            {list.tags.map((t) => <Badge key={t} variant="default">{t}</Badge>)}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => setShowAutoModal(true)}>
            Draft automation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Creators" value={creators.length} />
        <StatCard label="Total reach" value={formatFollowers(totalFollowers)} />
        <StatCard label="Avg engagement" value={`${avgEng}%`} />
        <StatCard label="Avg GMV score" value={avgGmv} />
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Creators in list</h2>
          <span className="text-xs text-zinc-400">{creators.length} total</span>
        </div>
        <div className="p-5">
          {creators.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">No creators in this list</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3">Creator</th>
                    <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3">Niche</th>
                    <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3">Followers</th>
                    <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3">Eng. Rate</th>
                    <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3">GMV Score</th>
                    <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {creators.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 pr-6">
                        <p className="font-medium text-zinc-900">{c.displayName}</p>
                        <p className="text-xs text-zinc-400">{c.handle}</p>
                      </td>
                      <td className="py-3 pr-6">
                        <Badge variant="default">{c.niche}</Badge>
                      </td>
                      <td className="py-3 pr-6 text-zinc-700 tabular-nums">{formatFollowers(c.followers)}</td>
                      <td className="py-3 pr-6 text-zinc-700 tabular-nums">{c.engagementRate}%</td>
                      <td className="py-3 pr-6">
                        <Badge variant={c.gmvScore >= 85 ? 'success' : c.gmvScore >= 75 ? 'blue' : 'default'}>
                          {c.gmvScore}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleRemoveCreator(c.id)}
                          className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAutoModal && (
        <DraftAutomationModal
          preselectedList={{ id: list.id, name: list.name }}
          onClose={() => setShowAutoModal(false)}
          onCreated={() => {
            setShowAutoModal(false);
            setToast('Automation draft created');
            setTimeout(() => setToast(null), 3000);
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
