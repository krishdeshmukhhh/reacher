import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
// ─── Data helpers ──────────────────────────────────────────────────────────
function readJSON(file) {
    return JSON.parse(readFileSync(path.join(DATA_DIR, file), 'utf-8'));
}
function writeJSON(file, data) {
    writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}
// ─── Tool implementations ──────────────────────────────────────────────────
function search_creators(args) {
    let creators = readJSON('creators.json');
    if (args.niche)
        creators = creators.filter((c) => c.niche === args.niche);
    if (args.region)
        creators = creators.filter((c) => c.region === args.region);
    if (args.minFollowers !== undefined)
        creators = creators.filter((c) => c.followers >= args.minFollowers);
    if (args.maxFollowers !== undefined)
        creators = creators.filter((c) => c.followers <= args.maxFollowers);
    if (args.minGmvScore !== undefined)
        creators = creators.filter((c) => c.gmvScore >= args.minGmvScore);
    if (args.query) {
        const q = args.query.toLowerCase();
        creators = creators.filter((c) => {
            const text = `${c.niche} ${c.region} ${c.tags.join(' ')} ${c.displayName} ${c.notes}`.toLowerCase();
            return text.includes(q);
        });
    }
    return creators.sort((a, b) => b.gmvScore - a.gmvScore);
}
function create_creator_list(args) {
    const lists = readJSON('lists.json');
    const newList = {
        id: `list_${Date.now()}`,
        name: args.listName,
        description: '',
        creatorIds: args.creatorIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
    };
    lists.push(newList);
    writeJSON('lists.json', lists);
    return newList;
}
function get_creator_list(args) {
    const lists = readJSON('lists.json');
    const list = lists.find((l) => l.name.toLowerCase() === args.listName.toLowerCase());
    if (!list)
        return { error: `No list found named "${args.listName}"` };
    const allCreators = readJSON('creators.json');
    const creators = allCreators.filter((c) => list.creatorIds.includes(c.id));
    return { list, creators };
}
function draft_automation(args) {
    const lists = readJSON('lists.json');
    const list = lists.find((l) => l.name.toLowerCase() === args.listName.toLowerCase());
    const template = generateTemplate(args.channel, args.brandName || 'the brand', args.objective || '');
    const automation = {
        id: `auto_${Date.now()}`,
        name: `${args.brandName || 'Brand'} ${args.channel} — ${args.listName}`,
        listId: list?.id || '',
        listName: args.listName,
        channel: args.channel,
        dailyLimit: args.dailyLimit || 10,
        objective: args.objective || 'Creator outreach',
        brandName: args.brandName || '',
        messageTemplate: template,
        filters: { minGmvScore: 70, emailRequired: args.channel === 'Email', niches: [] },
        status: 'draft',
        createdAt: new Date().toISOString(),
    };
    const automations = readJSON('automations.json');
    automations.push(automation);
    writeJSON('automations.json', automations);
    return automation;
}
function get_list_analytics(args) {
    const analytics = readJSON('analytics.json');
    const lists = readJSON('lists.json');
    const list = lists.find((l) => l.name.toLowerCase() === args.listName.toLowerCase());
    if (!list)
        return { error: `No list found named "${args.listName}"` };
    const listAnalytics = analytics.lists[list.id];
    if (!listAnalytics) {
        return {
            listId: list.id,
            listName: list.name,
            creatorCount: list.creatorIds.length,
            contacted: 0,
            replied: 0,
            replyRate: 0,
            sampleRequestsSent: 0,
            samplesApproved: 0,
            estimatedGmv: 0,
            message: 'No outreach data yet for this list',
        };
    }
    return listAnalytics;
}
function summarize_creator(args) {
    const creators = readJSON('creators.json');
    const creator = creators.find((c) => c.id === args.creatorId);
    if (!creator)
        return { error: `Creator ${args.creatorId} not found` };
    const followerStr = creator.followers >= 1_000_000
        ? `${(creator.followers / 1_000_000).toFixed(1)}M`
        : `${(creator.followers / 1_000).toFixed(0)}K`;
    const fitSignals = [];
    if (creator.gmvScore >= 85)
        fitSignals.push('top-tier GMV performance');
    if (creator.sampleAcceptanceRate >= 0.8)
        fitSignals.push('high sample acceptance rate');
    if (creator.engagementRate >= 9)
        fitSignals.push('exceptional engagement rate');
    if (creator.emailAvailable)
        fitSignals.push('email available for direct outreach');
    return {
        id: creator.id,
        handle: creator.handle,
        displayName: creator.displayName,
        summary: `${creator.displayName} (${creator.handle}) is a ${creator.niche} creator from ${creator.region} with ${followerStr} followers. ${creator.notes}`,
        fitScore: creator.gmvScore,
        fitSignals,
        keyMetrics: {
            followers: creator.followers,
            avgViews: creator.avgViews,
            engagementRate: creator.engagementRate,
            sampleAcceptanceRate: creator.sampleAcceptanceRate,
            gmvScore: creator.gmvScore,
        },
        recentContent: creator.recentVideos,
        tags: creator.tags,
    };
}
function generateTemplate(channel, brandName, objective) {
    if (channel === 'Sample Request') {
        return `Hi {{displayName}}, we love your content and think there's a natural fit with ${brandName}. We'd love to send you a complimentary sample as part of our ${objective || 'creator program'}. Would you be open to receiving one?`;
    }
    if (channel === 'Email') {
        return `Hi {{displayName}},\n\nI came across your content and immediately thought of ${brandName}. We're building our creator program and think you'd be a great fit.\n\nWould you be open to a quick chat about a potential collaboration?\n\nBest,\n${brandName} Team`;
    }
    return `Hey {{displayName}}! We've been following your content and love what you create. We're reaching out about a potential collab with ${brandName} — would love to connect!`;
}
// ─── Server setup ──────────────────────────────────────────────────────────
const server = new Server({ name: 'creator-ops-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'search_creators',
            description: 'Search the creator database by niche, region, follower count, GMV score, or a natural language query.',
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Natural language search query (e.g. "fitness creators in Texas")' },
                    niche: { type: 'string', description: 'Creator niche (fitness, beauty, food, wellness, etc.)' },
                    region: { type: 'string', description: 'US state or region (Texas, California, New York, etc.)' },
                    minFollowers: { type: 'number', description: 'Minimum follower count' },
                    maxFollowers: { type: 'number', description: 'Maximum follower count' },
                    minGmvScore: { type: 'number', description: 'Minimum GMV score (0-100)' },
                },
            },
        },
        {
            name: 'create_creator_list',
            description: 'Save a list of creator IDs under a named list for later outreach.',
            inputSchema: {
                type: 'object',
                required: ['listName', 'creatorIds'],
                properties: {
                    listName: { type: 'string', description: 'Name for the creator list' },
                    creatorIds: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of creator IDs to include in the list',
                    },
                },
            },
        },
        {
            name: 'get_creator_list',
            description: 'Retrieve a named creator list along with full creator details.',
            inputSchema: {
                type: 'object',
                required: ['listName'],
                properties: {
                    listName: { type: 'string', description: 'Name of the list to retrieve' },
                },
            },
        },
        {
            name: 'draft_automation',
            description: 'Generate an outreach automation draft for a named creator list.',
            inputSchema: {
                type: 'object',
                required: ['listName', 'channel'],
                properties: {
                    listName: { type: 'string', description: 'Name of the target creator list' },
                    channel: {
                        type: 'string',
                        enum: ['DM', 'Email', 'Sample Request'],
                        description: 'Outreach channel to use',
                    },
                    dailyLimit: { type: 'number', description: 'Max outreach contacts per day (default 10)' },
                    objective: { type: 'string', description: 'Goal of the campaign (e.g. "drive sample requests")' },
                    brandName: { type: 'string', description: 'Brand name to use in message template' },
                },
            },
        },
        {
            name: 'get_list_analytics',
            description: 'Return mock performance analytics for a named creator list.',
            inputSchema: {
                type: 'object',
                required: ['listName'],
                properties: {
                    listName: { type: 'string', description: 'Name of the list to get analytics for' },
                },
            },
        },
        {
            name: 'summarize_creator',
            description: 'Return a natural language summary of why a creator is a good fit, along with key metrics.',
            inputSchema: {
                type: 'object',
                required: ['creatorId'],
                properties: {
                    creatorId: { type: 'string', description: 'Creator ID (e.g. c001)' },
                },
            },
        },
    ],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    try {
        let result;
        switch (name) {
            case 'search_creators':
                result = search_creators(args);
                break;
            case 'create_creator_list':
                result = create_creator_list(args);
                break;
            case 'get_creator_list':
                result = get_creator_list(args);
                break;
            case 'draft_automation':
                result = draft_automation(args);
                break;
            case 'get_list_analytics':
                result = get_list_analytics(args);
                break;
            case 'summarize_creator':
                result = summarize_creator(args);
                break;
            default:
                return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
        }
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
