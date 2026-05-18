# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
# Frontend (Next.js)
npm run dev          # start dev server on localhost:3000
npm run build        # production build (also type-checks)
npm run lint         # ESLint

# MCP server
npm run mcp          # run already-compiled server (node mcp-server/dist/index.js)
npm run mcp:build    # compile TypeScript in mcp-server/
npm run mcp:dev      # compile + run in one step

# MCP server standalone (inside mcp-server/)
npx tsc              # compile
node dist/index.js   # run (stdio transport — not interactive)
```

There are no automated tests. The build (`npm run build`) is the closest thing to a type-check gate.

## Architecture

Two independent sub-projects share a single `data/` directory:

```
creator-ops-mcp/
  app/              # Next.js 14 App Router (frontend + API routes)
  components/       # React components (layout/, ui/, creators/, lists/, automations/, analytics/)
  lib/              # Shared TypeScript utilities (types, NL parser, search)
  data/             # Single source of truth — JSON files mutated by both sub-projects
  mcp-server/       # Standalone Node.js MCP server (separate package.json + tsconfig)
```

### Data layer

All persistence is flat JSON files in `data/`. Both the Next.js API routes and the MCP server read/write them directly with `fs.readFileSync` / `fs.writeFileSync`. There is no database and no caching layer — every request reads from disk.

- `creators.json` — 100 creator records (read-only in practice)
- `lists.json` — named creator lists (CRUD via API + MCP)
- `automations.json` — automation drafts (append-only in practice)
- `analytics.json` — mock metrics (static seed data, not recalculated)

### Search pipeline

`lib/nlParser.ts` → `lib/creatorSearch.ts` → `app/api/creators/route.ts`

A natural-language query string is parsed into a `ParsedQuery` by `parseNaturalLanguageQuery()` (keyword tables for niche/region, regex patterns for follower ranges and performance terms). The parsed struct is then applied as filters + sort by `applyParsedQuery()`. Structured filters from the URL can be layered on top via `applyFilters()`.

### MCP server

`mcp-server/src/index.ts` is a single-file server using `@modelcontextprotocol/sdk` over stdio. It re-implements its own type interfaces (not importing from `lib/`) and resolves `DATA_DIR` relative to the compiled `dist/index.js` location (`../../data`). It must be compiled with `npx tsc` inside `mcp-server/` before running.

Tools exposed: `search_creators`, `create_creator_list`, `get_creator_list`, `draft_automation`, `get_list_analytics`, `summarize_creator`.

### Next.js API routes

Thin wrappers over the JSON files. `app/api/lists/[id]/route.ts` uses `async params` (Next.js 15 style — `params` is a `Promise`). All routes use `readFileSync`/`writeFileSync` directly; no ORM or validation library.

### Frontend conventions

- All pages under `app/` are client components (`'use client'`) except `app/page.tsx` (dashboard), which is a server component that reads data files at render time.
- `@/*` path alias maps to the repo root.
- Tailwind v4 (`@import "tailwindcss"` in globals.css, no `tailwind.config.ts`).
- UI primitives live in `components/ui/` (Badge, Button, Card/StatCard, EmptyState). Modals are co-located with the feature they belong to.

## Key invariants

- The MCP server's `DATA_DIR` path (`../../data` from `dist/`) breaks if the compiled output is moved. Keep `mcp-server/dist/` in place.
- `lists.json` IDs use the format `list_${Date.now()}` and `automations.json` uses `auto_${Date.now()}` — they are not UUIDs.
- `.md` files are in `.gitignore` and will not be committed.
