# MEMORY.md — Long-Term Context

Last updated: 2026-02-15 (Weekly distillation)

---

## Projects & Infrastructure

### System Dashboard (Feb 12, 2026)
Built custom monitoring dashboard for Mac mini:
- **URL:** http://localhost:18790
- **Features:** Real-time CPU/memory/disk/network, OpenClaw metrics, model switching, scheduled tasks
- **Tech:** Node.js + Express, LaunchAgent for auto-start
- **Chat interface:** http://localhost:18790/chat

### Autopilot Foundation (Feb 12, 2026)
Established automated memory management + heartbeat monitoring:
- **Heartbeat:** Every ~30min (08:00-23:00 PST) checks email, calendar, system health, workspace
- **Daily Archive:** 3 AM PST cron moves yesterday's logs to `memory/archive/`
- **Weekly Distillation:** Sunday 11 PM PST cron curates MEMORY.md
- **State tracking:** `memory/heartbeat-state.json`

### Gmail API Integration (Feb 12, 2026)
Setup in progress:
- Credentials configured (`gmail_credentials.json`)
- Python env ready (`gmail_env`)
- Next: Authentication script

---

## System Config & Optimization

### Token Optimization (Feb 12, 2026)
- Compressed AGENTS.md, SOUL.md
- Deleted BOOTSTRAP.md
- Achieved ~59% workspace reduction (1380 → 560 tokens)

### Model Config Updates (Feb 12, 2026)
- Added Ollama provider (localhost:11434)
- Added gemini-2.5-flash
- Updated `flash` alias
- **Note:** Qwen model (ollama/qwen3:8b) tested but didn't respond correctly; Haiku works

---

## Upcoming / Queued

- **WhatsApp Separate Contact:** Plan to move from selfChatMode to dedicated Google Voice number
- **Nature-Inspired Color Palette:** Viewer/display for natural color palette (earth tones, flora, sky)

---

## Preferences & Patterns

- **Working hours:** Generally active during PST daytime; heads to bed ~3 AM
- **Automation preference:** Likes silent background work, scheduled maintenance
- **Communication style:** Concise, action-oriented
