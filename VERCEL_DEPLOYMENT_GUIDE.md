# 🚀 Vercel Deployment Guide - Step by Step

## ✅ Requirements

- GitHub account (free: github.com)
- Vercel account (free: vercel.com)
- Your completed Easy English AI project

---

## 📝 Step 1: Prepare Your Project

### 1.1 Open Terminal/PowerShell

Windows তে:
- Right click on folder → "Open in Terminal"
- অথবা VS Code এ: `Ctrl + ~`

### 1.2 Initialize Git

```bash
cd "d:\Easy English\EasyEnglish-AI"
git init
```

### 1.3 Add All Files

```bash
git add .
```

### 1.4 Create First Commit

```bash
git commit -m "Initial commit: Easy English AI Analyzer"
```

---

## 🐙 Step 2: Create GitHub Repository

### 2.1 Go to GitHub

1. Visit https://github.com
2. Sign in (অথবা sign up if নতুন)

### 2.2 Create New Repository

1. Top right corner এ ➕ ক্লিক
2. **"New repository"** select করুন
3. Repository name দিন: `easy-english-ai`
4. Description (optional): "Multi-AI English Sentence Analyzer"
5. **Public** select করুন (students access করতে পারবে)
6. **Create repository** ক্লিক করুন

### 2.3 Copy Repository URL

Green **Code** button এ ক্লিক করুন
Copy করুন এই URL (দেখবে এমন):
```
https://github.com/YOUR_USERNAME/easy-english-ai.git
```

---

## 📤 Step 3: Push to GitHub

Terminal এ এই commands চালান:

```bash
cd "d:\Easy English\EasyEnglish-AI"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/easy-english-ai.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Done!** Your code এখন GitHub এ আছে।

---

## 🌐 Step 4: Deploy on Vercel

### 4.1 Go to Vercel

1. Visit https://vercel.com
2. **Sign in with GitHub** (সবচেয়ে সহজ)
3. Authorize Vercel to access your GitHub

### 4.2 Import Project

1. You'll see dashboard
2. Click **"Add New..."** → **"Project"**
3. আপনার `easy-english-ai` repository select করুন
4. Click **Import**

### 4.3 Configure Project

ডিফল্ট settings ঠিক আছে:
- Framework Preset: **Next.js** ✓
- Root Directory: `.` ✓
- Build Command: `npm run build` ✓
- Output Directory: `.next` ✓

### 4.4 Deploy!

1. **Deploy** button এ ক্লিক করুন
2. Waiting for deployment... (2-3 মিনিট)
3. "Congratulations! Your project has been deployed" দেখবেন

---

## 🎉 Step 5: Your Live App!

Deployment complete হলে আপনি পাবেন:

**Live URL:** (এমন দেখবে)
```
https://easy-english-ai.vercel.app
```

এই URL share করুন students দের সাথে!

---

## 🔄 Update করার সময়

Code changes করলে:

```bash
git add .
git commit -m "Your changes description"
git push origin main
```

Vercel automatically redeploy করবে! 🔃

---

## ⚙️ Environment Variables (Optional)

যদি custom settings চান:

### 5.1 Vercel Dashboard এ যান

1. Your project খুলুন
2. **Settings** tab
3. **Environment Variables**
4. Add করুন (যদি প্রয়োজন):

```
OPENAI_API_URL = https://api.openai.com/v1/chat/completions
OPENAI_MODEL = gpt-3.5-turbo
```

### 5.2 Redeploy

Settings save করলে automatically redeploy হবে।

---

## 🧪 Test Your Live App

1. https://easy-english-ai.vercel.app খুলুন
2. একটি free API key নিন (Gemini)
3. একটি passage paste করুন
4. Test করুন!

---

## 🆘 Troubleshooting

### "Build failed" Error?

Check করুন:
- সব files push হয়েছে কী? (`git push`)
- `package.json` আছে কী?
- Dependencies ঠিক আছে কী?

Solution:
```bash
git push -u origin main
# Then redeploy from Vercel dashboard
```

### "Cannot find module" Error?

```bash
# Local এ:
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push origin main
```

---

## 🎯 Final Checklist

✅ GitHub account তৈরি  
✅ Repository create করেছি  
✅ Local code push করেছি  
✅ Vercel account তৈরি  
✅ Project import করেছি  
✅ Deployed হয়েছে  
✅ Live URL work করছে  
✅ Test করেছি একটি API key দিয়ে  

---

## 📊 Your Deployed App

**URL:** `https://easy-english-ai.vercel.app` (your URL)

Share করুন:
- Classmates
- Friends
- Social media
- অথবা যেকোনো জায়গায়!

Students বিনা cost এ analyze করতে পারবে (শুধু free API key লাগবে)।

---

## 💡 Pro Tips

1. **Custom Domain** যোগ করতে পারেন ($12/year)
2. **Analytics** দেখতে পারেন Vercel dashboard এ
3. **Auto-deploy** GitHub commit থেকে
4. **Free SSL** automatically include থাকে

---

**Congratulations! 🎉 You've successfully deployed your app!**
