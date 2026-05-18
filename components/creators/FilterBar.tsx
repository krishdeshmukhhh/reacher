'use client';

import type { SearchFilters } from '@/lib/types';

const NICHES = ['fitness', 'beauty', 'food', 'wellness', 'home', 'fashion', 'parenting', 'tech', 'travel', 'outdoors', 'pets', 'finance', 'lifestyle', 'gaming', 'sports', 'auto', 'music'];
const REGIONS = ['Texas', 'California', 'New York', 'Florida', 'Georgia', 'Colorado', 'Oregon', 'Tennessee', 'Arizona', 'Washington', 'Ohio', 'Michigan', 'Illinois', 'North Carolina', 'Virginia'];

interface FilterBarProps {
  filters: Partial<SearchFilters>;
  onChange: (filters: Partial<SearchFilters>) => void;
  resultCount: number;
}

export default function FilterBar({ filters, onChange, resultCount }: FilterBarProps) {
  function update(key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters] | '') {
    if (value === '' || value === undefined) {
      const next = { ...filters };
      delete next[key];
      onChange(next);
    } else {
      onChange({ ...filters, [key]: value });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.niche || ''}
        onChange={(e) => update('niche', e.target.value)}
        className="text-sm border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 bg-white focus:outline-none focus:border-zinc-400"
      >
        <option value="">All niches</option>
        {NICHES.map((n) => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
      </select>

      <select
        value={filters.region || ''}
        onChange={(e) => update('region', e.target.value)}
        className="text-sm border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 bg-white focus:outline-none focus:border-zinc-400"
      >
        <option value="">All regions</option>
        {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <select
        value={filters.minFollowers ? String(filters.minFollowers) : ''}
        onChange={(e) => update('minFollowers', e.target.value ? parseInt(e.target.value) : '')}
        className="text-sm border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 bg-white focus:outline-none focus:border-zinc-400"
      >
        <option value="">Any followers</option>
        <option value="50000">50K+</option>
        <option value="100000">100K+</option>
        <option value="250000">250K+</option>
        <option value="500000">500K+</option>
        <option value="1000000">1M+</option>
      </select>

      <select
        value={filters.maxFollowers ? String(filters.maxFollowers) : ''}
        onChange={(e) => update('maxFollowers', e.target.value ? parseInt(e.target.value) : '')}
        className="text-sm border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 bg-white focus:outline-none focus:border-zinc-400"
      >
        <option value="">No max</option>
        <option value="50000">Under 50K</option>
        <option value="100000">Under 100K</option>
        <option value="250000">Under 250K</option>
        <option value="500000">Under 500K</option>
      </select>

      <select
        value={filters.minGmvScore ? String(filters.minGmvScore) : ''}
        onChange={(e) => update('minGmvScore', e.target.value ? parseInt(e.target.value) : '')}
        className="text-sm border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 bg-white focus:outline-none focus:border-zinc-400"
      >
        <option value="">Any GMV</option>
        <option value="70">GMV 70+</option>
        <option value="75">GMV 75+</option>
        <option value="80">GMV 80+</option>
        <option value="85">GMV 85+</option>
      </select>

      <label className="flex items-center gap-1.5 text-sm text-zinc-600 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.emailOnly || false}
          onChange={(e) => update('emailOnly', e.target.checked || '')}
          className="rounded border-zinc-300"
        />
        Email only
      </label>

      <span className="ml-auto text-xs text-zinc-400 tabular-nums">{resultCount} results</span>
    </div>
  );
}
