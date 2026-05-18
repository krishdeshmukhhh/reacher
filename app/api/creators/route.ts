import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';
import type { Creator, SearchFilters } from '@/lib/types';
import { searchCreators, applyFilters } from '@/lib/creatorSearch';

function loadCreators(): Creator[] {
  const filePath = path.join(process.cwd(), 'data', 'creators.json');
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q') || '';
  const filters: Partial<SearchFilters> = {};

  if (searchParams.get('niche')) filters.niche = searchParams.get('niche')!;
  if (searchParams.get('region')) filters.region = searchParams.get('region')!;
  if (searchParams.get('minFollowers')) filters.minFollowers = parseInt(searchParams.get('minFollowers')!);
  if (searchParams.get('maxFollowers')) filters.maxFollowers = parseInt(searchParams.get('maxFollowers')!);
  if (searchParams.get('minGmvScore')) filters.minGmvScore = parseInt(searchParams.get('minGmvScore')!);
  if (searchParams.get('maxGmvScore')) filters.maxGmvScore = parseInt(searchParams.get('maxGmvScore')!);
  if (searchParams.get('minEngagement')) filters.minEngagement = parseFloat(searchParams.get('minEngagement')!);
  if (searchParams.get('emailOnly') === 'true') filters.emailOnly = true;

  const creators = loadCreators();
  const results = searchCreators(creators, query, Object.keys(filters).length ? filters : undefined);

  return NextResponse.json({ creators: results, total: results.length });
}
