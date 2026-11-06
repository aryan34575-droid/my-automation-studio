# Instagram Automation Studio

A React + Vite dashboard with an Express backend for publishing Instagram Reels and feed photos through the official Instagram API.

## Features
- Instagram OAuth connection flow (Instagram Business/Creator accounts)
- Publish Reels from a publicly accessible MP4 URL
- Publish feed photos from a publicly accessible JPEG URL
- Caption and hashtag editor
- Recent media list and permalink links
- Server-side token handling; no token in frontend bundle or Git history

## Deploy on Vercel
This repository includes `vercel.json` and `api/index.js`. Import this GitHub repository into Vercel with:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 20.x or newer

## Required Meta configuration
Create an app at Meta for Developers and add the Instagram API with Instagram Login product. Configure the OAuth redirect URI to exactly:
`https://YOUR-DEPLOYMENT-DOMAIN/api/instagram/callback`

Add these as private Vercel environment variables (Production and Preview as appropriate):
- `META_APP_ID`
- `META_APP_SECRET`
- `APP_URL` = your deployment origin, e.g. `https://your-app.vercel.app`
- `META_REDIRECT_URI` = `https://your-app.vercel.app/api/instagram/callback`
- `IG_ACCESS_TOKEN`
- `IG_USER_ID`
- `META_API_VERSION` = `v22.0`

Then redeploy. Open the dashboard and choose Connect Instagram. The OAuth callback displays the long-lived token and user ID once so you can save them directly into Vercel Environment Variables. Treat the token as a password. Do not put it in GitHub, chat, frontend variables, or screenshots. Rotate it if exposed.

## Publishing
- Reel: public HTTPS MP4 URL
- Feed photo: public HTTPS JPEG URL
- Instagram must be able to fetch the URL without authentication.
- Publishing is immediate when you press Publish. Review the selected media and caption first.

## Local development
```bash
npm install
npm run dev
```
Run the API separately with `npm start` (requires the environment variables above). Vite defaults to port 5173 and the API defaults to 3001; set `VITE_API_URL=http://localhost:3001` for local frontend development.

## Important
The Instagram account connected to a separate analytics/publishing provider is not automatically transferable to this app. This app requires its own Meta Developer app and OAuth authorization. Instagram API access is subject to Meta app permissions, account eligibility, review and rate limits.
