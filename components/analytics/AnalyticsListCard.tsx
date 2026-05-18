import type { ListAnalytics } from '@/lib/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface AnalyticsListCardProps {
  analytics: ListAnalytics;
}

function MetricBar({ value, max = 100, color = 'bg-zinc-800' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full bg-zinc-100 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AnalyticsListCard({ analytics }: AnalyticsListCardProps) {
  const replyPct = analytics.contacted > 0 ? Math.round(analytics.replyRate * 100) : 0;
  const samplePct = analytics.sampleRequestsSent > 0 ? Math.round(analytics.sampleApprovalRate * 100) : 0;
  const gmvStr = analytics.estimatedGmv > 0
    ? `$${analytics.estimatedGmv.toLocaleString()}`
    : '—';

  const status = analytics.contacted === 0 ? 'pending' : analytics.estimatedGmv > 0 ? 'active' : 'running';

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-zinc-900">{analytics.listName}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{analytics.creatorCount} creators</p>
        </div>
        <Badge variant={status === 'active' ? 'success' : status === 'running' ? 'blue' : 'default'}>
          {status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-zinc-400">Contacted</p>
          <p className="text-lg font-semibold text-zinc-900">{analytics.contacted}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Replied</p>
          <p className="text-lg font-semibold text-zinc-900">{analytics.replied}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Samples approved</p>
          <p className="text-lg font-semibold text-zinc-900">{analytics.samplesApproved}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Est. GMV</p>
          <p className="text-lg font-semibold text-zinc-900">{gmvStr}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>Reply rate</span>
            <span>{replyPct}%</span>
          </div>
          <MetricBar value={replyPct} color="bg-zinc-700" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>Sample approval</span>
            <span>{samplePct}%</span>
          </div>
          <MetricBar value={samplePct} color="bg-emerald-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>Avg GMV score</span>
            <span>{analytics.avgGmvScore.toFixed(1)}</span>
          </div>
          <MetricBar value={analytics.avgGmvScore} color="bg-blue-500" />
        </div>
      </div>
    </Card>
  );
}
