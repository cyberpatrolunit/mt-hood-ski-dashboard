# Model Strategy - Cost/Performance Optimization

## Tier System

### Haiku (Lightest/Cheapest)
- Quick questions
- Status checks (`/status`, system info)
- Simple commands (single-step)
- Confirmations
- File reads
- **Cost:** ~$0.25/1M input tokens

### Sonnet (Default)
- Complex automation
- Multi-step tasks
- Browser automation
- File editing/organization
- Most day-to-day work
- **Cost:** ~$3/1M input tokens

### Opus (Heavy/Expensive)
- Very complex reasoning
- Code building/architecture
- Deep problem-solving
- Novel situations requiring creativity
- High-stakes decisions
- **Cost:** ~$15/1M input tokens

## Implementation

**Current session model:** Check with `📊 session_status`

**Manual switching:**
```
/model haiku   → switch to lightweight
/model sonnet  → switch to default
/model opus    → switch to heavy reasoning
```

**For sub-tasks:** Use `sessions_spawn` with specific model:
```
sessions_spawn(task="complex code task", model="opus")
```

**Default:** Sonnet (already configured)
