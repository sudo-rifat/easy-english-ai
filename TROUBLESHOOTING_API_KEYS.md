# 🔧 API Key Troubleshooting Guide

## ❌ Gemini Error: "models/gemini-pro is not found"

### কেন এই error হচ্ছে?

1. **Wrong API Key Format** - API key সঠিক format এ না থাকা
2. **API Key Invalid** - Key expire হয়েছে বা revoke হয়েছে
3. **Account Issue** - Gemini API enable না থাকা
4. **Model Not Available** - আপনার account এ সেই model available না থাকা

---

## ✅ Solution Steps

### Step 1: Verify Your API Key

সঠিক key পেতে:

1. **Visit:** https://makersuite.google.com/app/apikey
2. **Click:** "Get API Key" 
3. **Select:** "Create API Key in new project"
4. Copy করুন সম্পূর্ণ key

Key দেখবে এভাবে: `AIza...` (40+ characters)

### Step 2: Check Key Format

```
❌ WRONG: 
- AIza...xxx (truncated)
- abc123 (too short)
- "AIza..." (with quotes)

✅ RIGHT:
- AIza...xxxxxxxxxx (complete, ~40 chars)
- Without quotes
- No spaces
```

### Step 3: Test Your Key

Paste করুন app এ এবং simple test করুন:

```
Test Passage: "Hello world"
AI Provider: Google Gemini
API Key: (your full key)
Click: Analyze
```

### Step 4: If Still Error

Try **Groq API** instead:

1. **Visit:** https://console.groq.com
2. **Sign Up:** Email দিয়ে
3. **Get API Key:** Dashboard থেকে
4. Copy করুন পুরো key
5. App এ **Groq** select করুন
6. Key paste করুন

---

## 🚀 Best Option: Use Groq (More Reliable)

### Why Groq?
- ✅ Faster than Gemini
- ✅ More reliable
- ✅ Same quality results
- ✅ Free tier very generous
- ✅ Easy to set up

### Get Groq API Key (2 minutes)

1. Go to: https://console.groq.com
2. Click: "Sign Up"
3. Email: Enter your email
4. Verify: Check your email
5. Login: Confirm password
6. API Keys: Go to API Keys section
7. Create: Click "Create API Key"
8. Copy: Full key (gsk_...)
9. Use: Paste in app → Select Groq → Analyze!

---

## 📋 API Key Sources

### Google Gemini (Free)
```
Website: https://makersuite.google.com/app/apikey
Format: AIza...
Speed: Medium
Quality: Excellent
Limit: 60 req/min
Issue: Model availability problems sometimes
```

### Groq (Free) ⭐ RECOMMENDED
```
Website: https://console.groq.com
Format: gsk_...
Speed: Super Fast ⚡⚡⚡
Quality: Excellent
Limit: 30 req/min
Issue: Very reliable, rarely problems
```

### Together AI (Free)
```
Website: https://www.together.ai
Format: Long token
Speed: Fast
Quality: Good
Limit: 25 req/min
Issue: Sometimes slow
```

---

## 🔍 Detailed Troubleshooting

### Issue: "API Key Invalid"

**Cause:** Key সঠিক নেই

**Solution:**
```
1. Visit: https://makersuite.google.com/app/apikey
2. Delete old key (if exists)
3. Create NEW API Key
4. Copy ENTIRE key (don't truncate)
5. Paste in app (no extra spaces)
6. Try again
```

### Issue: "Model Not Found"

**Cause:** API version incompatibility

**Solution:**
```
1. Try different AI provider
   └─> Groq is most reliable
2. Check your API key is valid
3. Ensure you're using latest endpoint
```

### Issue: "Authentication Failed"

**Cause:** API Key কাজ করছে না

**Solution:**
```
1. Verify key copied completely
2. Check for extra spaces
3. Confirm key is active (not revoked)
4. Try new key from provider
5. Check internet connection
```

---

## 🛠️ Quick Fix Checklist

```
API Key issues? Follow this:

□ Copy FULL API key (don't truncate)
□ No extra spaces before/after
□ No quotes around key
□ Paste directly in app
□ Select correct AI provider
□ Click Analyze
□ Wait 2-5 seconds
□ If still error → try Groq
□ If Groq works → use Groq
□ If all fail → check internet
```

---

## 💡 Pro Tips

1. **Groq is faster and more reliable**
   - Use if you have choice
   - Less errors, better support

2. **Keep multiple keys**
   - One Gemini key
   - One Groq key
   - Switch if one fails

3. **Test with short passage**
   - Easier to debug
   - Faster response
   - Test: "Hello world"

4. **Check internet connection**
   - Good WiFi or data
   - No VPN/proxy issues
   - Stable connection

5. **Monitor API usage**
   - Each provider has limits
   - Free tier usually enough
   - Check provider's console

---

## 🔐 Security Notes

```
✅ DO:
- Keep API key private
- Use only on your device
- Delete key if compromised
- Use fresh keys when possible

❌ DON'T:
- Share API key publicly
- Post in forums/chat
- Add to GitHub/version control
- Use on untrusted devices
```

---

## 📞 Still Having Issues?

### Check These:

1. **Internet Connection**
   - Is WiFi working?
   - Is data enabled?
   - Any VPN/proxy?

2. **API Key**
   - Fully copied?
   - No typos?
   - Not revoked?

3. **Provider Status**
   - API provider down?
   - Check: status.groq.com
   - Check: Google status

4. **Browser**
   - Refresh page (Ctrl+F5)
   - Hard refresh (Ctrl+Shift+R)
   - Try different browser
   - Clear cache

5. **Device**
   - Restart browser
   - Restart computer
   - Check firewall
   - Disable VPN

---

## 🎯 Recommended Setup

### For Best Results:

```
Primary: Groq API
├─ Fastest
├─ Most reliable
└─ Best for batch processing

Secondary: Google Gemini
├─ Excellent quality
├─ Good backup
└─ When Groq is down

Fallback: Together AI
├─ Another free option
└─ If others fail
```

---

## 📊 Comparison

| Feature | Gemini | Groq | Together |
|---------|--------|------|----------|
| Speed | ⚡⚡ | ⚡⚡⚡⚡ | ⚡⚡⚡ |
| Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Reliability | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Setup Time | 30 sec | 2 min | 3 min |
| Free Limit | 60 req/min | 30 req/min | 25 req/min |
| **Recommend** | ⚠️ Issues | ✅ BEST | ✓ Good |

---

## ✨ Next Steps

1. **Try Groq** (most reliable)
   - Visit: https://console.groq.com
   - Get key
   - Use in app

2. **If Groq works** → Keep using it

3. **If Groq fails** → Contact support

---

**Problem solved? Happy analyzing! 🚀**

Still stuck? Try switching to Groq API - it's more reliable! 💪
