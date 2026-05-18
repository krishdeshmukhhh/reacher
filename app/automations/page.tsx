'use client';

import { useState, useEffect } from 'react';
import type { Automation } from '@/lib/types';
import AutomationCard from '@/components/automations/AutomationCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import DraftAutomationModal from '@/components/automations/DraftAutomationModal';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function fetchAutomations() {
    const res = await fetch('/api/automations');
    const data = await res.json();
    setAutomations(data.automations);
    setLoading(false);
  }

  useEffect(() => { fetchAutomations(); }, []);

  const active = automations.filter((a) => a.status === 'active');
  const drafts = automations.filter((a) => a.status === 'draft');
  const other = automations.filter((a) => !['active', 'draft'].includes(a.status));

  function Section({ title, items }: { title: string; items: Automation[] }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">{title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((a) => <AutomationCard key={a.id} automation={a} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Automation Drafts</h1>
          <p className="text-sm text-zinc-400 mt-1">Configure and manage creator outreach automations</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ New automation</Button>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400 py-16 text-center">Loading…</div>
      ) : automations.length === 0 ? (
        <EmptyState
          title="No automations yet"
          description="Create a list of creators first, then draft an automation to reach out to them"
          action={<Button onClick={() => setShowModal(true)}>Draft automation</Button>}
        />
      ) : (
        <>
          <Section title="Active" items={active} />
          <Section title="Drafts" items={drafts} />
          <Section title="Other" items={other} />
        </>
      )}

      {showModal && (
        <DraftAutomationModal
          onClose={() => setShowModal(false)}
          onCreated={(auto) => {
            setAutomations((prev) => [...prev, auto]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
