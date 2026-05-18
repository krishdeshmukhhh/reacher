import { StatCard } from '@/components/ui/Card';
import Link from 'next/link';
import { readFileSync } from 'fs';
import path from 'path';
import type { ActivityEvent } from '@/lib/types';

function loadAnalytics() {
  const p = path.join(process.cwd(), 'data', 'analytics.json');
  return JSON.parse(readFileSync(p, 'utf-8'));
}

export default function Dashboard() {
  const data = loadAnalytics();
  const { global: g, activity } = data;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Overview of your creator outreach workspace</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total creators" value={g.totalCreators.toLocaleString()} sub="in database" />
        <StatCard label="Saved lists" value={g.totalLists} sub={`${g.activeAutomations} active automations`} />
        <StatCard label="Reply rate" value={`${Math.round(g.overallReplyRate * 100)}%`} sub={`${g.totalReplied} / ${g.totalContacted} replied`} />
        <StatCard label="Avg GMV score" value={g.avgGmvScore.toFixed(1)} sub="across all creators" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-lg">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Recent activity</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {(activity as ActivityEvent[]).map((event, i) => {
              const date = new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const typeColors: Record<string, string> = {
                list_created: 'bg-blue-400',
                list_updated: 'bg-zinc-400',
                automation_created: 'bg-purple-400',
                automation_launched: 'bg-emerald-400',
                reply_received: 'bg-amber-400',
              };
              return (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${typeColors[event.type] || 'bg-zinc-300'}`} />
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

        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Quick actions</h2>
            <div className="space-y-2">
              <Link href="/search" className="flex items-center gap-3 p-3 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors group">
                <div className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                    <circle cx="6" cy="6" r="4" />
                    <path d="M9.5 9.5L13 13" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700">Search creators</p>
                  <p className="text-xs text-zinc-400">Find by niche, region, GMV</p>
                </div>
              </Link>
              <Link href="/lists" className="flex items-center gap-3 p-3 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors group">
                <div className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                    <path d="M2 3.5h10M2 7h6M2 10.5h8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700">View lists</p>
                  <p className="text-xs text-zinc-400">Manage saved creator lists</p>
                </div>
              </Link>
              <Link href="/automations" className="flex items-center gap-3 p-3 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors group">
                <div className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                    <path d="M7.5 1.5L3 7.5h4.5l-1 5L12 5.5H7.5L9 1.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700">Draft automation</p>
                  <p className="text-xs text-zinc-400">Configure outreach campaigns</p>
                </div>
              </Link>
              <Link href="/analytics" className="flex items-center gap-3 p-3 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors group">
                <div className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                    <path d="M2 12V9M5 12V5M8 12V7M11 12V2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700">View analytics</p>
                  <p className="text-xs text-zinc-400">Track campaign performance</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-zinc-900 mb-3">Performance summary</h2>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Total contacted</span>
                <span className="font-medium text-zinc-800">{g.totalContacted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Total replied</span>
                <span className="font-medium text-zinc-800">{g.totalReplied}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Est. GMV pipeline</span>
                <span className="font-medium text-zinc-800">${g.totalEstimatedGmv.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Active automations</span>
                <span className="font-medium text-zinc-800">{g.activeAutomations}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
