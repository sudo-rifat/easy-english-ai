# Easy English - Multi-AI Analyzer

A web application that helps students analyze English passages using multiple AI providers.

## Features

✨ **Multi-AI Support:**
- Google Gemini (FREE)
- Groq Llama 3.1 (Fast & FREE)
- Together AI
- OpenAI / Claude Compatible APIs

🎨 **Student-Friendly Interface:**
- Paste English passage
- Select AI provider
- Add your API key (kept private)
- Get beautifully formatted analysis

📚 **Analysis Includes:**
- Word meanings in Bangla
- Phrase synthesis
- Literal translation
- Fluent Bangla translation

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Getting API Keys (All FREE)

### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create new API key
4. Copy and paste in the app

### Groq
1. Visit [Groq Console](https://console.groq.com)
2. Sign up for free
3. Go to API Keys section
4. Create new API key
5. Copy and paste in the app

### Together AI
1. Visit [Together AI](https://www.together.ai/)
2. Sign up
3. Get your API key from dashboard
4. Copy and paste in the app

### OpenAI / Claude
1. Use your existing OpenAI API key from [OpenAI](https://platform.openai.com/api-keys)
2. Or Anthropic Claude API key from [Anthropic](https://console.anthropic.com)
3. Copy and paste in the app

## Deployment on Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select your repository
5. Deploy!

## Environment Variables (Optional)

Create `.env.local` for default settings:

```
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-3.5-turbo
```

## How It Works

1. **Frontend**: Built with Next.js + React + Tailwind CSS
2. **Backend**: Next.js API routes
3. **AI Processing**: Sends passages to selected AI provider
4. **Formatting**: Returns beautifully formatted HTML analysis
5. **Display**: Shows rich analysis in browser (no HTML knowledge needed!)

## Security Notes

- API keys are sent directly to AI providers (not stored)
- Each analysis is independent
- No keys are logged or saved
- Users enter their own API keys (no shared keys)

## File Structure

```
├── app/
│   ├── layout.tsx          # Main layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── api/
│       └── analyze/
│           └── route.ts    # API endpoint
├── components/
│   ├── AnalyzerForm.tsx    # Input form
│   └── ResultDisplay.tsx   # Result viewer
├── lib/
│   ├── ai/
│   │   ├── gemini.ts       # Gemini integration
│   │   ├── groq.ts         # Groq integration
│   │   ├── together.ts     # Together AI integration
│   │   └── openai.ts       # OpenAI/Claude integration
│   └── formatter.ts        # HTML formatting
└── package.json
```

## Support

For issues or questions, please create an issue in the repository.

## License

MIT
