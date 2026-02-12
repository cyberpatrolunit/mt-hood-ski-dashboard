# Google Voice + WhatsApp Separate Contact Setup

**Goal:** Replace selfChatMode with a dedicated WhatsApp contact for CLAWUNiT

---

## Step 1: Get a Google Voice Number

### 1.1 Sign Up
1. Go to **https://voice.google.com**
2. Sign in with a Google account (existing or new)
3. Click **"Get Google Voice"** or **"Search"** to pick a number

### 1.2 Choose Your Number
- **Search by area code:** 415 (SF), 503 (Portland), or your preference
- **Search by keyword:** "CLAW", "TECH", "CODE" (if available)
- **Preview options** and select one

### 1.3 Verify
- Google will ask for a real phone number to verify (one-time)
- Use your main number (+14156974323)
- Enter verification code sent via SMS

✅ **You now have a free Google Voice number!**

---

## Step 2: Register WhatsApp on Google Voice Number

### Option A: Use a Spare Device (Recommended)
**Requirements:** Old iPhone, iPad, Android phone, or tablet

1. **Install WhatsApp** on the spare device
2. **Open WhatsApp** → Begin setup
3. **Enter your Google Voice number** when prompted
4. **Receive verification code:**
   - Go to **https://voice.google.com/messages**
   - Google Voice will show the incoming SMS with the code
   - Enter it in WhatsApp
5. **Set up profile:**
   - Name: **CLAWUNiT** 🎨
   - Photo: (optional, could use an AI-generated avatar)
6. ✅ WhatsApp is now registered on your Google Voice number!

### Option B: Use Android Emulator (No Spare Device)
**Requirements:** Mac with enough RAM (8GB+)

1. **Install Android Studio:**
   ```bash
   brew install --cask android-studio
   ```

2. **Create AVD (Android Virtual Device):**
   - Open Android Studio → Tools → AVD Manager
   - Create Device → Pick a phone (Pixel 5 works well)
   - Download system image (Android 13+)
   - Start emulator

3. **Install WhatsApp in emulator:**
   - Open Play Store in emulator
   - Search "WhatsApp"
   - Install
   - Follow Option A steps above

### Option C: WhatsApp Web/Desktop Only (No Device Needed)
**Note:** This requires an initial device setup but can work afterward

1. Get temporary access to ANY Android/iPhone
2. Register WhatsApp with Google Voice number (Option A)
3. Link WhatsApp Web to that device
4. Keep device powered on and connected

---

## Step 3: Link WhatsApp to OpenClaw

### 3.1 Get QR Code from OpenClaw
```bash
openclaw gateway restart
```
- Go to **http://localhost:18789** (Gateway Control UI)
- Navigate to **Channels → WhatsApp**
- You'll see a QR code

### 3.2 Scan QR Code
1. Open WhatsApp on the device with your Google Voice number
2. **iPhone:** Settings → Linked Devices → Link a Device
3. **Android:** Menu (3 dots) → Linked Devices → Link a Device
4. Scan the QR code from OpenClaw Control UI

✅ **WhatsApp is now linked to OpenClaw!**

---

## Step 4: Update OpenClaw Config

### 4.1 Turn Off selfChatMode
Edit `/Users/cpuai/.openclaw/openclaw.json`:

**Current:**
```json
"whatsapp": {
  "dmPolicy": "allowlist",
  "selfChatMode": true,
  "allowFrom": [
    "+14156974323"
  ],
  ...
}
```

**Change to:**
```json
"whatsapp": {
  "dmPolicy": "allowlist",
  "selfChatMode": false,
  "allowFrom": [
    "+14156974323"
  ],
  ...
}
```

### 4.2 Apply Config
```bash
openclaw gateway restart
```

✅ **selfChatMode disabled!**

---

## Step 5: Save CLAWUNiT as Contact

### On Your iPhone/Android
1. OpenClaw will now message you from the Google Voice number
2. **Add to Contacts:**
   - Name: **CLAWUNiT** 🎨
   - Photo: (optional)
3. You now have a proper contact for your AI assistant!

---

## Troubleshooting

### WhatsApp won't accept Google Voice number
- Google Voice numbers sometimes get blocked by WhatsApp
- **Solution:** Use a real SIM card or Twilio number (~$1/mo)

### QR Code won't scan
- Make sure WhatsApp device has camera permission
- Try refreshing QR code in OpenClaw Control UI
- Ensure device is on same WiFi network

### Messages not coming through
- Check `openclaw status` to verify gateway is running
- Check WhatsApp device is online and linked
- Verify `allowFrom` includes your real number

---

## Cost Summary
- **Google Voice:** FREE
- **WhatsApp:** FREE
- **OpenClaw:** FREE (self-hosted)
- **Total:** $0/month 🎉

---

## Next Steps After Setup
1. Update IDENTITY.md with Google Voice number
2. Test messaging both ways
3. Remove old selfChat conversations (optional)
4. Enjoy cleaner UX!
