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

export async function GET() {
  const lists = loadLists();
  return NextResponse.json({ lists });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, creatorIds, tags } = body;

  if (!name || !creatorIds) {
    return NextResponse.json({ error: 'name and creatorIds are required' }, { status: 400 });
  }

  const lists = loadLists();
  const newList: CreatorList = {
    id: `list_${Date.now()}`,
    name,
    description: description || '',
    creatorIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: tags || [],
  };

  lists.push(newList);
  saveLists(lists);

  return NextResponse.json({ list: newList }, { status: 201 });
}
