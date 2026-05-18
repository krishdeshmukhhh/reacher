'use client';

import { useState } from 'react';
import type { Creator } from '@/lib/types';
import { formatFollowers } from '@/lib/creatorSearch';
import Badge from '@/components/ui/Badge';

interface CreatorTableProps {
  creators: Creator[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
}

type SortKey = 'followers' | 'engagementRate' | 'gmvScore' | 'sampleAcceptanceRate';

export default function CreatorTable({
  creators,
  selectable,
  selectedIds = new Set(),
  onToggleSelect,
  onSelectAll,
}: CreatorTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('gmvScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...creators].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortDir === 'desc' ? -diff : diff;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const allSelected = creators.length > 0 && creators.every((c) => selectedIds.has(c.id));

  function SortHeader({ col, label }: { col: SortKey; label: string }) {
    const active = sortKey === col;
    return (
      <th
        className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3 cursor-pointer hover:text-zinc-700 transition-colors"
        onClick={() => toggleSort(col)}
      >
        <span className="flex items-center gap-1">
          {label}
          {active && <span className="text-zinc-500">{sortDir === 'desc' ? '↓' : '↑'}</span>}
        </span>
      </th>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200">
            {selectable && (
              <th className="pb-3 pr-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onSelectAll?.(sorted.map((c) => c.id))}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                />
              </th>
            )}
            <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3">Creator</th>
            <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3">Niche</th>
            <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3">Region</th>
            <SortHeader col="followers" label="Followers" />
            <SortHeader col="engagementRate" label="Eng. Rate" />
            <SortHeader col="sampleAcceptanceRate" label="Sample Acc." />
            <SortHeader col="gmvScore" label="GMV Score" />
            <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider pb-3">Email</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {sorted.map((creator) => (
            <CreatorRow
              key={creator.id}
              creator={creator}
              selectable={selectable}
              selected={selectedIds.has(creator.id)}
              onToggle={() => onToggleSelect?.(creator.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreatorRow({
  creator,
  selectable,
  selected,
  onToggle,
}: {
  creator: Creator;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const gmvColor =
    creator.gmvScore >= 85 ? 'success' : creator.gmvScore >= 75 ? 'blue' : creator.gmvScore >= 65 ? 'warning' : 'default';

  return (
    <tr className={`hover:bg-zinc-50 transition-colors ${selected ? 'bg-zinc-50' : ''}`}>
      {selectable && (
        <td className="py-3 pr-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
          />
        </td>
      )}
      <td className="py-3 pr-6">
        <div>
          <p className="font-medium text-zinc-900">{creator.displayName}</p>
          <p className="text-xs text-zinc-400">{creator.handle}</p>
        </div>
      </td>
      <td className="py-3 pr-6">
        <Badge variant="default">{creator.niche}</Badge>
      </td>
      <td className="py-3 pr-6 text-zinc-500 text-xs">{creator.region}</td>
      <td className="py-3 pr-6 text-zinc-700 tabular-nums">{formatFollowers(creator.followers)}</td>
      <td className="py-3 pr-6 text-zinc-700 tabular-nums">{creator.engagementRate}%</td>
      <td className="py-3 pr-6 text-zinc-700 tabular-nums">{Math.round(creator.sampleAcceptanceRate * 100)}%</td>
      <td className="py-3 pr-6">
        <Badge variant={gmvColor}>{creator.gmvScore}</Badge>
      </td>
      <td className="py-3">
        {creator.emailAvailable ? (
          <span className="text-emerald-500 text-xs font-medium">✓ Yes</span>
        ) : (
          <span className="text-zinc-300 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}
