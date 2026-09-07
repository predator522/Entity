# Entity 4.5 — Phase 3

# Phase 3 — Full Account & Intelligence Upgrade

Phase 3 adds:

- MongoDB-backed user accounts
- Name, email, phone and password registration
- Login from another Telegram account using email/phone + password
- Persistent AI memory tied to the Entity account, not only Telegram ID
- Account linking across Telegram accounts
- Four-hour inactivity reminders
- Owner-only AI reasoning upgrade controls
- Phase 3 owner panel
- Groq as the primary chat/coding engine
- OpenRouter as fallback
- MagicStudio/OmegaTech as the dedicated image engine
- Image requests never intentionally route to Groq/OpenRouter
- Existing force-join flow
- Telegram-safe message splitting/retries

## Install

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your real values.

## Start

```bash
npm start
```

## MongoDB

Use either local MongoDB:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=entity45
```

or a MongoDB Atlas connection string.

Never put real API keys or the bot token in source code.

## Important account behavior

A user's AI memory belongs to their Entity 4.5 account.

Example:

1. Telegram account A registers as `John`.
2. John chats with Entity 4.5 and memory is stored under John's account.
3. John logs out or uses Telegram account B.
4. John chooses Login and enters the same email/phone + password.
5. Telegram account B is linked to John's Entity account.
6. John's existing memory is available again.

The bot does not expose passwords or password hashes to the AI.

## Identity

Entity 4.5 is the dog without limits.

Creators/Owners:

- Escanor
- Metro

This identity is included in the AI system prompt so Entity 4.5 answers ownership questions consistently.

## Owner controls

Set:

```env
OWNER_TELEGRAM_IDS=123456789,987654321
```

Only those Telegram IDs receive the owner controls.

The owner panel currently includes:

- Upgrade AI reasoning
- Phase 3 control panel
- Toggle reasoning mode

The owner upgrade is stored on the owner's Entity account as `reasoningLevel`.

## Reminder behavior

A background worker checks users periodically.

If a user has not interacted for at least `REMINDER_INTERVAL_HOURS`, Entity 4.5 sends:

> 🐕 I'm still here. Entity 4.5 is waiting for you.

The reminder timestamp is updated so it does not repeatedly spam the same user every scan.

Users can disable reminders from Settings.
