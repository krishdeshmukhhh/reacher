'use client';

import type { CreatorList } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface ListCardProps {
  list: CreatorList;
  onDelete?: (id: string) => void;
}

export default function ListCard({ list, onDelete }: ListCardProps) {
  const created = new Date(list.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 hover:border-zinc-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/lists/${list.id}`} className="text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors">
            {list.name}
          </Link>
          {list.description && (
            <p className="text-xs text-zinc-400 mt-1 truncate">{list.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-zinc-500 tabular-nums">{list.creatorIds.length} creators</span>
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(list.id)}>
              <svg width="13" height="13" fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3.5h9M5 3.5V2h3v1.5M3.5 3.5l.5 7h5l.5-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {list.tags.map((tag) => (
          <Badge key={tag} variant="default">{tag}</Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-zinc-400">Created {created}</span>
        <Link href={`/lists/${list.id}`}>
          <Button variant="secondary" size="sm">View list →</Button>
        </Link>
      </div>
    </div>
  );
}
