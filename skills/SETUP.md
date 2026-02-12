# Skills Setup Guide

## 1. Gmail & Calendar Authentication

**Run this command to authenticate:**

```bash
source gmail_env/bin/activate
python3 skills/gmail-auth.py
```

This will:
- Open a browser window
- Ask you to sign in to your Google account
- Request permission for Gmail + Calendar access
- Save a token for future use

**You only need to do this once!**

---

## 2. Test the Skills

### Check Gmail (urgent emails):
```bash
source gmail_env/bin/activate
python3 skills/check-gmail.py
```

### Check Calendar (upcoming events):
```bash
source gmail_env/bin/activate
python3 skills/check-calendar.py 48
```
(48 = hours ahead to check)

### Git Auto-Commit:
```bash
bash skills/git-auto-commit.sh
```

---

## 3. Usage in Heartbeat

Once authenticated, I can automatically:
- ✅ Check for urgent emails every 30 min
- ✅ Alert about upcoming calendar events
- ✅ Auto-commit workspace changes

The heartbeat will use these skills to keep you informed!

---

## Troubleshooting

**"Not authenticated" error?**
- Run `python3 skills/gmail-auth.py` again

**Permission denied?**
- Run `chmod +x skills/*.py skills/*.sh`

**Module not found?**
- Activate the virtual environment: `source gmail_env/bin/activate`
