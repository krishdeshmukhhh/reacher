export interface Creator {
  id: string;
  handle: string;
  displayName: string;
  niche: string;
  region: string;
  platform: string;
  followers: number;
  avgViews: number;
  engagementRate: number;
  sampleAcceptanceRate: number;
  gmvScore: number;
  emailAvailable: boolean;
  recentVideos: string[];
  notes: string;
  tags: string[];
}

export interface CreatorList {
  id: string;
  name: string;
  description: string;
  creatorIds: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Automation {
  id: string;
  name: string;
  listId: string;
  listName: string;
  channel: 'DM' | 'Email' | 'Sample Request';
  dailyLimit: number;
  objective: string;
  brandName: string;
  messageTemplate: string;
  filters: {
    minGmvScore: number;
    emailRequired: boolean;
    niches: string[];
  };
  status: 'active' | 'draft' | 'paused' | 'completed';
  createdAt: string;
}

export interface ListAnalytics {
  listId: string;
  listName: string;
  creatorCount: number;
  contacted: number;
  replied: number;
  replyRate: number;
  sampleRequestsSent: number;
  samplesApproved: number;
  sampleApprovalRate: number;
  estimatedGmv: number;
  avgEngagementRate: number;
  avgGmvScore: number;
  topCreators: string[];
  timeline: { date: string; contacted: number; replied: number }[];
}

export interface GlobalAnalytics {
  totalCreators: number;
  totalLists: number;
  totalAutomations: number;
  activeAutomations: number;
  totalContacted: number;
  totalReplied: number;
  overallReplyRate: number;
  totalEstimatedGmv: number;
  avgGmvScore: number;
}

export interface ActivityEvent {
  timestamp: string;
  type: string;
  description: string;
  listName: string;
}

export interface SearchFilters {
  query?: string;
  niche?: string;
  region?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minGmvScore?: number;
  maxGmvScore?: number;
  minEngagement?: number;
  emailOnly?: boolean;
  platform?: string;
}

export interface ParsedQuery {
  niches: string[];
  regions: string[];
  minFollowers?: number;
  maxFollowers?: number;
  minGmvScore?: number;
  minEngagement?: number;
  emailOnly?: boolean;
  limit?: number;
  sortBy?: 'gmvScore' | 'followers' | 'engagementRate' | 'sampleAcceptanceRate';
}
