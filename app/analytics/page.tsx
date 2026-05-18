'use client';

import { useState, useEffect } from 'react';
import type { ListAnalytics, GlobalAnalytics, ActivityEvent } from '@/lib/types';
import { StatCard } from '@/components/ui/Card';
import AnalyticsListCard from '@/components/analytics/AnalyticsListCard';

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    lists: Record<string, ListAnalytics>;
    global: GlobalAnalytics;
    activity: ActivityEvent[];
  } | null>(null);

  useEffect(() => {
    fetch('/api/analytics').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-sm text-zinc-400">Loading…</div>;

  const { global: g, lists, activity } = data;
  const listAnalytics = Object.values(lists);

  const totalGmv = listAnalytics.reduce((s, l) => s + l.estimatedGmv, 0);
  const totalSamples = listAnalytics.reduce((s, l) => s + l.samplesApproved, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900">Analytics</h1>
        <p className="text-sm text-zinc-400 mt-1">Campaign performance across all creator lists</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Creators contacted" value={g.totalContacted} />
        <StatCard
          label="Overall reply rate"
          value={`${Math.round(g.overallReplyRate * 100)}%`}
          sub={`${g.totalReplied} replied`}
        />
        <StatCard label="Samples approved" value={totalSamples} />
        <StatCard label="Est. GMV pipeline" value={`$${totalGmv.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {listAnalytics.map((la) => (
          <AnalyticsListCard key={la.listId} analytics={la} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-lg">
          <div className="px-5 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900">Performance breakdown</h2>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left text-xs text-zinc-400 font-medium pb-3">List</th>
                  <th className="text-left text-xs text-zinc-400 font-medium pb-3">Contacted</th>
                  <th className="text-left text-xs text-zinc-400 font-medium pb-3">Reply rate</th>
                  <th className="text-left text-xs text-zinc-400 font-medium pb-3">GMV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {listAnalytics.map((la) => (
                  <tr key={la.listId} className="hover:bg-zinc-50">
                    <td className="py-3 pr-4 font-medium text-zinc-800">{la.listName}</td>
                    <td className="py-3 pr-4 text-zinc-600 tabular-nums">{la.contacted}</td>
                    <td className="py-3 pr-4 text-zinc-600 tabular-nums">
                      {la.contacted > 0 ? `${Math.round(la.replyRate * 100)}%` : '—'}
                    </td>
                    <td className="py-3 text-zinc-600 tabular-nums">
                      {la.estimatedGmv > 0 ? `$${la.estimatedGmv.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg">
          <div className="px-5 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900">Activity timeline</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {activity.map((event, i) => {
              const date = new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const dotColors: Record<string, string> = {
                list_created: 'bg-blue-400',
                list_updated: 'bg-zinc-400',
                automation_created: 'bg-purple-400',
                automation_launched: 'bg-emerald-400',
                reply_received: 'bg-amber-400',
              };
              return (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${dotColors[event.type] || 'bg-zinc-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-700">{event.description}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{event.listName}</p>
                  </div>
                  <span className="text-xs text-zinc-400 shrink-0">{date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
