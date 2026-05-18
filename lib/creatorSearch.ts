import type { Creator, SearchFilters, ParsedQuery } from './types';
import { parseNaturalLanguageQuery } from './nlParser';

export function applyFilters(creators: Creator[], filters: SearchFilters): Creator[] {
  return creators.filter((c) => {
    if (filters.niche && c.niche !== filters.niche) return false;
    if (filters.region && c.region !== filters.region) return false;
    if (filters.minFollowers !== undefined && c.followers < filters.minFollowers) return false;
    if (filters.maxFollowers !== undefined && c.followers > filters.maxFollowers) return false;
    if (filters.minGmvScore !== undefined && c.gmvScore < filters.minGmvScore) return false;
    if (filters.maxGmvScore !== undefined && c.gmvScore > filters.maxGmvScore) return false;
    if (filters.minEngagement !== undefined && c.engagementRate < filters.minEngagement) return false;
    if (filters.emailOnly && !c.emailAvailable) return false;
    if (filters.platform && c.platform !== filters.platform) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = `${c.handle} ${c.displayName} ${c.niche} ${c.region} ${c.tags.join(' ')} ${c.notes}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

export function applyParsedQuery(creators: Creator[], parsed: ParsedQuery): Creator[] {
  let results = [...creators];

  if (parsed.niches.length > 0) {
    results = results.filter((c) => parsed.niches.includes(c.niche));
  }
  if (parsed.regions.length > 0) {
    results = results.filter((c) => parsed.regions.includes(c.region));
  }
  if (parsed.minFollowers !== undefined) {
    results = results.filter((c) => c.followers >= parsed.minFollowers!);
  }
  if (parsed.maxFollowers !== undefined) {
    results = results.filter((c) => c.followers <= parsed.maxFollowers!);
  }
  if (parsed.minGmvScore !== undefined) {
    results = results.filter((c) => c.gmvScore >= parsed.minGmvScore!);
  }
  if (parsed.minEngagement !== undefined) {
    results = results.filter((c) => c.engagementRate >= parsed.minEngagement!);
  }
  if (parsed.emailOnly) {
    results = results.filter((c) => c.emailAvailable);
  }

  // Sort
  const sortKey = parsed.sortBy || 'gmvScore';
  results.sort((a, b) => b[sortKey] - a[sortKey]);

  if (parsed.limit) {
    results = results.slice(0, parsed.limit);
  }

  return results;
}

export function searchCreators(
  creators: Creator[],
  naturalQuery: string,
  structuredFilters?: Partial<SearchFilters>
): Creator[] {
  let results = [...creators];

  if (naturalQuery.trim()) {
    const parsed = parseNaturalLanguageQuery(naturalQuery);
    results = applyParsedQuery(results, parsed);
  }

  if (structuredFilters) {
    results = applyFilters(results, structuredFilters);
  }

  if (!naturalQuery.trim() && !structuredFilters) {
    results.sort((a, b) => b.gmvScore - a.gmvScore);
  }

  return results;
}

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function getCreatorSummary(creator: Creator): string {
  const followerStr = formatFollowers(creator.followers);
  return `${creator.displayName} (${creator.handle}) is a ${creator.niche} creator from ${creator.region} with ${followerStr} followers. ` +
    `Engagement rate: ${creator.engagementRate}%, GMV score: ${creator.gmvScore}/100, ` +
    `sample acceptance rate: ${Math.round(creator.sampleAcceptanceRate * 100)}%. ` +
    `${creator.notes}`;
}
