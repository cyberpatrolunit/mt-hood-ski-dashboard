# HEARTBEAT.md

## Tasks (checked every ~30min during active hours)

### 1. Email Check (Urgent Only)
- Look for emails with "urgent", "asap", "time-sensitive" in subject
- Flag anything from key people (you'll learn these over time)
- Track: `memory/heartbeat-state.json` → lastChecks.email

### 2. Calendar (<48h window)
- Upcoming events in next 48 hours
- Flag anything <2h away that needs prep
- Track: `memory/heartbeat-state.json` → lastChecks.calendar

### 3. System Health
- Disk space if <10GB free
- Any stuck/zombie processes consuming resources
- Track: `memory/heartbeat-state.json` → lastChecks.system

### 4. Workspace Hygiene
- Uncommitted changes in workspace (suggest commit)
- Memory files older than 7 days (suggest archive)
- Track: `memory/heartbeat-state.json` → lastChecks.workspace

---

**Quiet hours:** 23:00-08:00 PST (only urgent items)
**Reach out when:** urgent email, event <2h away, or >8h silence from Bryant
