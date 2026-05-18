'use client';

import type { Automation } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

interface AutomationCardProps {
  automation: Automation;
}

const statusVariants: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  active: 'success',
  draft: 'warning',
  paused: 'default',
  completed: 'blue' as 'default',
};

const channelVariants: Record<string, 'blue' | 'purple' | 'default'> = {
  DM: 'blue',
  Email: 'purple',
  'Sample Request': 'default',
};

export default function AutomationCard({ automation }: AutomationCardProps) {
  const created = new Date(automation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">{automation.name}</p>
          <p className="text-xs text-zinc-400 mt-0.5">→ {automation.listName}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={channelVariants[automation.channel] || 'default'}>{automation.channel}</Badge>
          <Badge variant={statusVariants[automation.status] || 'default'}>{automation.status}</Badge>
        </div>
      </div>

      <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{automation.objective}</p>

      <div className="mt-4 bg-zinc-50 rounded-md p-3">
        <p className="text-xs text-zinc-400 font-medium mb-1.5">Message template</p>
        <p className="text-xs text-zinc-600 leading-relaxed font-mono whitespace-pre-wrap">{automation.messageTemplate}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-zinc-400">Daily limit</p>
          <p className="text-sm font-medium text-zinc-700 mt-0.5">{automation.dailyLimit}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Brand</p>
          <p className="text-sm font-medium text-zinc-700 mt-0.5 truncate">{automation.brandName || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Min GMV</p>
          <p className="text-sm font-medium text-zinc-700 mt-0.5">{automation.filters.minGmvScore}</p>
        </div>
      </div>

      <p className="text-xs text-zinc-400 mt-3">Created {created}</p>
    </Card>
  );
}
