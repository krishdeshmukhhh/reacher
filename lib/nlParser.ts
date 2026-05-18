import type { ParsedQuery } from './types';

const NICHE_KEYWORDS: Record<string, string[]> = {
  fitness: ['fitness', 'gym', 'workout', 'exercise', 'training', 'health', 'athletic', 'bodybuilding', 'yoga', 'pilates', 'running', 'powerlifting', 'calisthenics'],
  beauty: ['beauty', 'skincare', 'makeup', 'cosmetic', 'glam', 'glow', 'nails', 'skin'],
  food: ['food', 'cooking', 'recipe', 'chef', 'meal', 'eat', 'kitchen', 'culinary', 'baking', 'bbq', 'vegan', 'keto', 'snack', 'coffee'],
  wellness: ['wellness', 'mental health', 'mindfulness', 'holistic', 'self-care', 'sleep', 'nutrition', 'supplement', 'herb', 'anxiety', 'stress'],
  home: ['home', 'decor', 'interior', 'organize', 'diy', 'craft', 'clean', 'garden', 'plant', 'flower'],
  fashion: ['fashion', 'style', 'outfit', 'clothing', 'streetwear', 'thrift', 'wardrobe', 'ootd', 'athleisure'],
  parenting: ['parenting', 'mom', 'dad', 'baby', 'kids', 'children', 'family', 'newborn', 'toddler', 'parent'],
  tech: ['tech', 'technology', 'gadget', 'setup', 'software', 'programming', 'phone', 'laptop', 'productivity'],
  travel: ['travel', 'trip', 'adventure', 'backpacking', 'vacation', 'explore', 'destination', 'hotel'],
  outdoors: ['outdoors', 'outdoor', 'hiking', 'camping', 'fishing', 'cycling', 'mountain', 'nature', 'adventure'],
  pets: ['pets', 'dog', 'cat', 'animal', 'puppy', 'kitten', 'paw'],
  finance: ['finance', 'budget', 'money', 'saving', 'debt', 'coupon', 'frugal', 'invest', 'wealth'],
  lifestyle: ['lifestyle', 'life', 'daily', 'routine', 'vlog', 'minimalist', 'sustainable', 'homestead'],
  gaming: ['gaming', 'game', 'twitch', 'stream', 'esports', 'console', 'pc gaming'],
  sports: ['sports', 'golf', 'basketball', 'football', 'soccer', 'tennis', 'baseball'],
  auto: ['auto', 'car', 'vehicle', 'detailing', 'mechanic', 'automotive', 'truck'],
  music: ['music', 'musician', 'guitar', 'piano', 'singing', 'producer', 'beat'],
};

const REGION_KEYWORDS: Record<string, string[]> = {
  Texas: ['texas', 'tx', 'houston', 'dallas', 'austin', 'san antonio'],
  California: ['california', 'ca', 'los angeles', 'la', 'san francisco', 'sf', 'san diego'],
  'New York': ['new york', 'ny', 'nyc', 'manhattan', 'brooklyn'],
  Florida: ['florida', 'fl', 'miami', 'orlando', 'tampa'],
  Georgia: ['georgia', 'ga', 'atlanta'],
  Colorado: ['colorado', 'co', 'denver', 'boulder'],
  Oregon: ['oregon', 'or', 'portland'],
  Tennessee: ['tennessee', 'tn', 'nashville'],
  Arizona: ['arizona', 'az', 'phoenix', 'scottsdale'],
  Washington: ['washington', 'wa', 'seattle'],
  Ohio: ['ohio', 'oh', 'columbus', 'cleveland'],
  Michigan: ['michigan', 'mi', 'detroit'],
  Illinois: ['illinois', 'il', 'chicago'],
  'North Carolina': ['north carolina', 'nc', 'charlotte', 'raleigh'],
  Virginia: ['virginia', 'va', 'richmond'],
};

const FOLLOWER_PATTERNS: { pattern: RegExp; parse: (m: RegExpMatchArray) => { min?: number; max?: number } }[] = [
  { pattern: /under\s+(\d+)k/i, parse: (m) => ({ max: parseInt(m[1]) * 1000 }) },
  { pattern: /less than\s+(\d+)k/i, parse: (m) => ({ max: parseInt(m[1]) * 1000 }) },
  { pattern: /over\s+(\d+)k/i, parse: (m) => ({ min: parseInt(m[1]) * 1000 }) },
  { pattern: /more than\s+(\d+)k/i, parse: (m) => ({ min: parseInt(m[1]) * 1000 }) },
  { pattern: /(\d+)k\s*[-–]\s*(\d+)k/i, parse: (m) => ({ min: parseInt(m[1]) * 1000, max: parseInt(m[2]) * 1000 }) },
  { pattern: /(\d+)k\+/i, parse: (m) => ({ min: parseInt(m[1]) * 1000 }) },
  { pattern: /micro(?:\s*influencer)?s?/i, parse: () => ({ max: 200000 }) },
  { pattern: /mid[\s-]?tier/i, parse: () => ({ min: 100000, max: 500000 }) },
  { pattern: /macro/i, parse: () => ({ min: 500000 }) },
  { pattern: /nano/i, parse: () => ({ max: 50000 }) },
];

const PERFORMANCE_TERMS: { pattern: RegExp; result: Partial<ParsedQuery> }[] = [
  { pattern: /strong\s+sample\s+performance|high\s+sample\s+acceptance|great\s+acceptance/i, result: { minGmvScore: 80 } },
  { pattern: /high\s+gmv|top\s+gmv|strong\s+gmv|best\s+gmv/i, result: { minGmvScore: 85 } },
  { pattern: /high\s+engagement|most\s+engaged|best\s+engagement/i, result: { minEngagement: 9 } },
  { pattern: /email\s+available|has\s+email|with\s+email/i, result: { emailOnly: true } },
  { pattern: /top\s+performers?/i, result: { minGmvScore: 82, sortBy: 'gmvScore' } },
];

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, fifteen: 15, twenty: 20, 'twenty-five': 25, 'thirty': 30,
  fifty: 50,
};

export function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase();
  const result: ParsedQuery = { niches: [], regions: [] };

  // Detect niches
  for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      result.niches.push(niche);
    }
  }

  // Detect regions
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      result.regions.push(region);
    }
  }

  // Detect follower ranges
  for (const { pattern, parse } of FOLLOWER_PATTERNS) {
    const match = lower.match(pattern);
    if (match) {
      const { min, max } = parse(match);
      if (min !== undefined) result.minFollowers = min;
      if (max !== undefined) result.maxFollowers = max;
      break;
    }
  }

  // Detect performance qualifiers
  for (const { pattern, result: extra } of PERFORMANCE_TERMS) {
    if (pattern.test(lower)) {
      Object.assign(result, extra);
    }
  }

  // Detect count intent like "find 25 creators" or "top 10"
  const numericCountMatch = lower.match(/(?:find|show|get|top|list)\s+(\d+)/i);
  if (numericCountMatch) result.limit = parseInt(numericCountMatch[1]);

  // Word-based count like "find twenty fitness creators"
  for (const [word, num] of Object.entries(NUMBER_WORDS)) {
    if (lower.includes(word)) {
      result.limit = num;
      break;
    }
  }

  // Default sort
  if (!result.sortBy) {
    if (result.minGmvScore || lower.includes('gmv')) result.sortBy = 'gmvScore';
    else if (result.minEngagement || lower.includes('engagement')) result.sortBy = 'engagementRate';
    else if (lower.includes('follower') || lower.includes('reach') || lower.includes('audience')) result.sortBy = 'followers';
    else result.sortBy = 'gmvScore';
  }

  return result;
}
