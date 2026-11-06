# Instagram Automation Agency

This repository adds an Instagram publishing and insights integration to My Automation Studio.

## What is connected
- Instagram account: @aryan_.insights (Aryan Decodes)
- OAuth connection is managed by vidIQ.
- Current connection has owner insights and Reel publishing permissions.

## Secure configuration
Never commit access tokens or client secrets. Configure these as server-side environment variables in your deployment:
- INSTAGRAM_ACCESS_TOKEN (only if you implement Meta Graph API directly)
- INSTAGRAM_USER_ID
- META_APP_ID
- META_APP_SECRET
- META_REDIRECT_URI

Do not paste secrets into frontend code, GitHub files, screenshots, or public issues.

## Included workflows
- Read account and Reel insights through the authorized integration.
- Prepare Reels, captions and hashtags for review.
- Publish only after explicit approval of the exact video and caption.
- Track publishing status and links.

## Important
This repository does not store the OAuth token. The live vidIQ connection is external to GitHub. A GitHub repository alone cannot securely or directly attach an Instagram account; an application backend / deployment must handle OAuth and API requests.
