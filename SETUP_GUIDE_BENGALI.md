# 📖 Complete Setup & Usage Guide

## 🎯 App Overview

এই app টি students দের জন্য তৈরি যারা English sentences analyze করতে চায়।

**কী করে:**
1. Student একটি English passage দেয়
2. একটি AI provider select করে (সব free!)
3. তাদের API key দেয়
4. App beautifully formatted Bangla analysis দেখায়

**কোন HTML জ্ঞান লাগে না!** 🎉

---

## 🚀 Installation Steps

### Step 1: আপনার computer এ প্রস্তুত

```bash
# Folder এ যান
cd "d:\Easy English\EasyEnglish-AI"

# Dependencies install করুন (ইতিমধ্যে চলছে)
npm install
```

### Step 2: Development mode চালু করুন

```bash
npm run dev
```

আপনার browser এ এটি খোলুন: **http://localhost:3000**

---

## 🔑 Free API Keys - কীভাবে পাবেন?

### Option 1: Google Gemini (⭐ সবচেয়ে সহজ)

1. এই link এ যান: https://makersuite.google.com/app/apikey
2. **"Get API Key"** বাটনে ক্লিক করুন
3. **"Create API Key in new project"** select করুন
4. Key copy করুন (এটি দেখবে: `AIza...`)
5. App এ paste করুন

**Speed:** ⚡⚡⚡  
**Quality:** ⭐⭐⭐⭐⭐  
**Limit:** 60 queries per minute (free)

---

### Option 2: Groq (⚡ সবচেয়ে দ্রুত)

1. এই link এ যান: https://console.groq.com
2. Sign up করুন (email দিয়ে)
3. API Keys section এ যান
4. "Create API Key" ক্লিক করুন
5. Key copy করুন (এটি দেখবে: `gsk_...`)
6. App এ paste করুন

**Speed:** ⚡⚡⚡⚡  
**Quality:** ⭐⭐⭐⭐  
**Limit:** 30 queries per minute (free)

---

### Option 3: Together AI

1. এই link এ যান: https://www.together.ai/
2. Sign up করুন
3. Dashboard এ API key পান
4. App এ paste করুন

**Speed:** ⚡⚡⚡  
**Quality:** ⭐⭐⭐⭐  
**Limit:** 25 queries per minute (free)

---

### Option 4: OpenAI / Claude API

নিজের OpenAI বা Anthropic Claude API key থাকলে:

1. https://platform.openai.com/api-keys থেকে
2. বা https://console.anthropic.com থেকে key নিন
3. App এ **"OpenAI / Claude API"** select করুন
4. Key paste করুন

---

## 💡 How to Use the App

### Step 1: Passage দিন

```
Example passage:
"The weather is beautiful today. I enjoy walking in the park."
```

এটি text area তে paste করুন।

### Step 2: AI Provider বেছে নিন

Dropdown থেকে যেকোনো একটি AI select করুন:
- Google Gemini ✅ (সবচেয়ে সহজ)
- Groq ✅ (সবচেয়ে দ্রুত)
- Together AI
- OpenAI / Claude

### Step 3: API Key দিন

আপনার API key paste করুন password field এ।

**Note:** Key শুধুমাত্র এই analysis এর জন্য ব্যবহার হয়। এটি save হয় না।

### Step 4: Analyze বাটন দিন

**"Analyze Passage"** বাটনে ক্লিক করুন।

### Step 5: Result দেখুন

Right side এ beautifully formatted analysis দেখবেন:
- Word meanings in Bangla
- Phrase synthesis
- Translations

---

## 🌐 Vercel Deploy করার জন্য

### Step 1: GitHub এ Push করুন

```bash
# Project folder এ
cd "d:\Easy English\EasyEnglish-AI"

# Git initialize করুন
git init

# সব files add করুন
git add .

# Initial commit
git commit -m "Initial commit: Easy English AI Analyzer"

# GitHub repo তৈরি করুন (github.com এ)
# তারপর এই commands চালান:
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Vercel এ Deploy করুন

1. https://vercel.com এ যান
2. GitHub দিয়ে sign up/login করুন
3. **"Import Project"** ক্লিক করুন
4. আপনার repository select করুন
5. **Deploy** ক্লিক করুন

**বস!** আপনার app এখন live! 🎉

URL দেখবেন এমন: `https://easy-english-ai.vercel.app`

---

## 🔒 Security Notes

✅ API keys **কখনো save হয় না**  
✅ Keys directly AI providers এর কাছে যায়  
✅ কোন logs বা storage নেই  
✅ প্রতিটি analysis independent  

---

## ❓ Troubleshooting

### "API key invalid" error?
- সঠিক provider select করেছেন কী?
- Key correctly copy করেছেন কী?
- Key এ extra spaces আছে কী?

### "Analysis failed" error?
- Internet connection check করুন
- API key সঠিক কী?
- Passage খুব বড় কী? (কম করে দেখুন)

### "Port already in use" error?
```bash
# অন্য terminal এ:
npm run dev -- -p 3001
```

---

## 📊 Example Workflow

```
Student আসে → Opens app (Vercel link)
     ↓
Passage paste করে (বাংলা passage ও হতে পারে!)
     ↓
Gemini বা Groq select করে
     ↓
Free API key paste করে
     ↓
"Analyze" ক্লিক করে
     ↓
2-3 সেকেন্ড পর
     ↓
Beautiful Bangla analysis দেখে! ✨
     ↓
অন্যটা select করে আবার test করে (সব free!)
```

---

## 📞 Support

কোনো problem হলে:
1. README.md পড়ুন
2. API key সঠিক কী check করুন
3. Browser console (F12) এ errors দেখুন

---

## 🎯 Next Steps

1. **npm install complete** হওয়ার অপেক্ষা করুন
2. **`npm run dev`** চালান
3. একটি **free API key** নিন (Gemini সবচেয়ে সহজ)
4. Test করুন!
5. **GitHub push** করুন
6. **Vercel deploy** করুন

---

## 💻 File Structure Explained

```
EasyEnglish-AI/
├── app/
│   ├── page.tsx           ← Main UI (what students see)
│   ├── layout.tsx         ← Layout
│   ├── globals.css        ← Styling
│   └── api/analyze/       ← Backend (processes requests)
├── components/
│   ├── AnalyzerForm.tsx   ← Input form
│   └── ResultDisplay.tsx  ← Results viewer
├── lib/ai/
│   ├── gemini.ts          ← Google integration
│   ├── groq.ts            ← Groq integration
│   ├── together.ts        ← Together AI integration
│   └── openai.ts          ← OpenAI/Claude integration
└── package.json           ← Dependencies
```

---

**Ready? শুরু করুন! 🚀**
