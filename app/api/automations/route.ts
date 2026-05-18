import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import type { Automation } from '@/lib/types';

const automationsPath = path.join(process.cwd(), 'data', 'automations.json');

function loadAutomations(): Automation[] {
  return JSON.parse(readFileSync(automationsPath, 'utf-8'));
}

function saveAutomations(automations: Automation[]) {
  writeFileSync(automationsPath, JSON.stringify(automations, null, 2));
}

export async function GET() {
  return NextResponse.json({ automations: loadAutomations() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { listId, listName, channel, dailyLimit, objective, brandName, messageTemplate, filters } = body;

  if (!listName || !channel) {
    return NextResponse.json({ error: 'listName and channel are required' }, { status: 400 });
  }

  const automations = loadAutomations();

  const template = messageTemplate || generateTemplate(channel, brandName, objective);

  const newAutomation: Automation = {
    id: `auto_${Date.now()}`,
    name: `${brandName || 'Brand'} ${channel} — ${listName}`,
    listId: listId || '',
    listName,
    channel,
    dailyLimit: dailyLimit || 10,
    objective: objective || 'Creator outreach',
    brandName: brandName || '',
    messageTemplate: template,
    filters: filters || { minGmvScore: 70, emailRequired: channel === 'Email', niches: [] },
    status: 'draft',
    createdAt: new Date().toISOString(),
  };

  automations.push(newAutomation);
  saveAutomations(automations);

  return NextResponse.json({ automation: newAutomation }, { status: 201 });
}

function generateTemplate(channel: string, brandName: string, objective: string): string {
  const brand = brandName || 'our brand';
  const obj = objective || 'creator partnership';

  if (channel === 'Sample Request') {
    return `Hi {{displayName}}, we love your content and think there's a natural fit with ${brand}. We'd love to send you a complimentary sample as part of our ${obj} program. Would you be open to receiving one?`;
  }
  if (channel === 'Email') {
    return `Hi {{displayName}},\n\nI came across your content and immediately thought of ${brand}. We're building our creator program and think you'd be a great fit.\n\nWould you be open to a quick chat about a potential collaboration?\n\nBest,\n${brand} Team`;
  }
  return `Hey {{displayName}}! We've been following your content and love what you create. We're reaching out about a potential collab with ${brand} — would love to connect!`;
}
