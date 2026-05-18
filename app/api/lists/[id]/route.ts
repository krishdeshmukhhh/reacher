import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import type { CreatorList } from '@/lib/types';

const listsPath = path.join(process.cwd(), 'data', 'lists.json');

function loadLists(): CreatorList[] {
  return JSON.parse(readFileSync(listsPath, 'utf-8'));
}

function saveLists(lists: CreatorList[]) {
  writeFileSync(listsPath, JSON.stringify(lists, null, 2));
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lists = loadLists();
  const list = lists.find((l) => l.id === id);
  if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 });
  return NextResponse.json({ list });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const lists = loadLists();
  const idx = lists.findIndex((l) => l.id === id);
  if (idx === -1) return NextResponse.json({ error: 'List not found' }, { status: 404 });

  lists[idx] = { ...lists[idx], ...body, updatedAt: new Date().toISOString() };
  saveLists(lists);

  return NextResponse.json({ list: lists[idx] });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lists = loadLists();
  const filtered = lists.filter((l) => l.id !== id);
  if (filtered.length === lists.length) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }
  saveLists(filtered);
  return NextResponse.json({ success: true });
}
