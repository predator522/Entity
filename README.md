# 🐕 Entity 4.5

**The dog without limits.**

A Telegram AI assistant based on the Nex GPT codebase, rebuilt with the Entity 4.5 identity, UI, owners, force-join access gate and cleaner callback/error handling.

## Included

- Entity 4.5 branding and response style
- Escanor and Lucifer owner identity
- Owner/admin separation
- Force-join support for multiple channels
- Working inline navigation
- Chat, memory/context, usage, settings, developer tools and status
- AI endpoint selection and admin endpoint controls
- Broadcast confirmation
- Maintenance mode
- Rate limiting
- No API request timeout configured in the HTTP client
- HTML-safe AI responses so normal Markdown characters do not break Telegram messages
- Node.js 18+

## Owners

- Escanor — `@Lion_sin_aboveall`
- Lucifer — `@W0rm_h0le`

Owner IDs must still be placed in `OWNER_IDS`; usernames are display information only.

## Setup

```bash
npm install
cp .env.example .env
nano .env
npm start
```

The bot requires the Telegram bot to be an administrator in each force-join channel so membership checks can work reliably.

## AI API

The default API remains the working endpoint architecture from the supplied project. Change `API_BASE_URL` and `DEFAULT_ENDPOINT` in `.env` if needed.

## Important

Never put a real Telegram token or API credential into GitHub or share it in chat. The distributed `.env` file is intentionally removed from this package and replaced with `.env.example`.
