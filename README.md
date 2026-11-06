# Instagram Automation Agency

A lightweight, self-hostable control centre for managing an Instagram creator workflow.

## Connected account
- Instagram handle: @aryan_.insights
- Display name: Aryan Decodes
- Connection: OAuth verified in the connected vidIQ integration
- Publishing permission: confirmed by the integration

> OAuth tokens and secrets are never stored in this repository. Keep credentials in a private server-side secret store or local `.env` file, never commit them.

## What this project is
This repository is currently a React + Vite application shell. The Instagram integration is authorized through the connected integration provider; this repo does not itself contain a Meta OAuth backend, token store, scheduler, or deployment configuration yet.

## Intended workflow
1. Draft captions, hashtags and content calendars.
2. Prepare and review Reels.
3. Publish only after explicit approval of the exact video and caption.
4. Read account and Reel insights to track reach and engagement.
5. Keep an audit trail of approved publishing actions.

## Safe setup
- Store any future Meta app credentials only in server-side environment variables.
- Use least-privilege permissions.
- Never expose access tokens in frontend code, commits, logs, screenshots or chat.
- Do not automate likes, follows, comments, DMs, scraping or other spam-like activity.

## Current status
- [x] Instagram account connected to vidIQ: @aryan_.insights
- [x] Owner insights permission available
- [x] Reel publishing permission available
- [ ] Standalone Meta Graph API backend in this repository
- [ ] Secure secret store and deployment
- [ ] Scheduler and content approval UI

## Development
```bash
npm install
npm run dev
```
