# DomestIQ — Project Instructions

## What This Project Is
**DomestIQ** is a South African platform that matches households with verified domestic workers (maids, gardeners, painters, welders, etc.). Matching-only — no employment relationship is created. Workers keep 100% of their rate; clients pay a 12% platform fee on top.
- **Framework**: Next.js 16.1.6 (App Router) + TypeScript, Tailwind CSS v4 (`@theme inline`), shadcn/ui, Zustand
- **Database**: PostgreSQL + PostGIS via Supabase (untyped client — no `<Database>` generic). Live ref `jxbnofaeaghlqexmwybn`; deployed at domestiq-kappa.vercel.app.

## How to work in this repo (operating posture)
- **Act once you have enough to act.** Don't re-derive settled facts, re-litigate decided questions, or lay out options you won't take — recommend, don't survey.
- **Smallest change that fully does the job.** No refactors, helpers, or abstractions beyond what the task needs — and never half-finished either.
- **When Werner is asking or thinking out loud, the deliverable is the assessment.** Report what you found and stop; don't apply a fix until he asks. Confirm before anything hard to reverse.
- **Fan out independent investigations.** Run parallel searches/subagents instead of plodding file-by-file.

## Memory System
Project memory is the auto-loaded index (`MEMORY.md`, injected every session). Two tiers: **CORE** (always-on — how to work + what's live now) and **REFERENCE** (look up by name; latest resume = the newest `project_session*` file). Keep CORE lean — update an existing memory rather than adding a near-duplicate. `archive/` is not loaded.

## Code Standards
- **Senior dev audit standard**: Every line must survive review by a senior engineer doing a pre-acquisition audit. No hacks, no shortcuts.
- **No AI attribution**: NEVER add `Co-Authored-By: Claude` or any AI branding to commits, comments, or UI. Commercial software for sale.
- **App-wide consistency**: Grep the ENTIRE codebase for any string/function being changed. Don't call something done until all instances are updated.
- **Simplicity First**: Make every change as simple as possible. Minimal code impact.
- **No Laziness**: Find root causes. No temporary fixes.
- **No company/partner names or payment/banking language on public surfaces** — DomestIQ is matching-only. No Paystack/bank names, no "income statement for banks." Payment code stays commented out; Partners section stays hidden.

## Work Ethic — Verification Rules
- **Deploy ≠ Done**: "Vercel says READY" is NOT verification. You must hit the production URL and confirm the change actually works.
- **Backend/API changes**: After deploying, call the affected endpoint on production with real payloads — including edge cases (empty strings, nulls, missing fields). Show the response.
- **Frontend changes**: After deploying, confirm the page loads on the deployed URL. Use browser automation or screenshot if needed.
- **Local tests are necessary but NOT sufficient**: Code that passes locally can still break on Vercel due to runtime differences, static generation requirements, env var issues, or build cache. Always verify on the deployed URL.
- **When something works locally but fails on Vercel**: Deploy a temporary diagnostic endpoint or add logging, read the output, fix the actual bug, then clean up. Don't guess.
- **Never claim a task is complete without proving it works on production.** Show the evidence — a curl response, a screenshot, a log entry. No exceptions.
