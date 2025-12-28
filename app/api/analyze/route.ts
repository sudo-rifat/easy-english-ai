import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithGemini } from '@/lib/ai/gemini'
import { analyzeWithGroq } from '@/lib/ai/groq'
import { analyzeWithTogether } from '@/lib/ai/together'
import { analyzeWithOpenAI } from '@/lib/ai/openai'
import { analyzeWithHuggingFace } from '@/lib/ai/huggingface'
import { translateWithGoogle, translateWithGoogleSegments, translateBatch } from '@/lib/ai/google-translate'
import { STABLE_SYSTEM_PROMPT } from '@/lib/ai/stable'

const JSON_ANALYSIS_PROMPT = `
You are an expert English teacher.
Analyze the following English text and provide a structured JSON response.
Do NOT use Markdown formatting. Return ONLY raw JSON.

Output format:
{
  "sentences": [
    {
      "english": "Sentence in English",
      "vocab": [
        { "word": "difficult word", "meaning": "Bangla meaning" }
      ],
      "literal_translation": "Bangla literal translation",
      "fluent_translation": "Natural Bangla translation"
    }
  ]
}

Ensure the Bangla translations are natural and accurate.
`

export async function POST(request: NextRequest) {
  try {
    const { passage, aiProvider, apiKey, mode } = await request.json()

    if (!passage || !aiProvider || (!apiKey && aiProvider !== 'google-translate')) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let analysis = ''
    // Use JSON prompt for default analyzer, Stable prompt for stable mode
    const systemPrompt = mode === 'stable' ? STABLE_SYSTEM_PROMPT : JSON_ANALYSIS_PROMPT

    switch (aiProvider) {
      case 'gemini':
        analysis = await analyzeWithGemini(passage, apiKey, systemPrompt)
        break
      case 'groq':
        analysis = await analyzeWithGroq(passage, apiKey, systemPrompt)
        break
      case 'google-translate':
        // 1. Get Vocabulary (Common for both modes)
        // Extract words (3+ letters)
        const words = passage.match(/\b[a-zA-Z]{3,}\b/g) || []
        // Fetch translations for these words
        const vocabMap = await translateBatch(words)
        
        if (mode === 'stable') {
          // Stable Reader Mode (Lines + Vocab)
          const segments = await translateWithGoogleSegments(passage)
          const linesBlock = segments.map(s => `${s.source} ||| ${s.target}`).join('\n')
          
          // Generate Vocab Block
          const vocabLines = Object.entries(vocabMap).map(([word, meaning]) => `${word} ||| ${meaning}`)
          const vocabBlock = vocabLines.length > 0 
            ? vocabLines.join('\n')
            : "note ||| No vocabulary found via Google Translate."
            
          analysis = `[LINES]\n${linesBlock}\n\n[VOCAB]\n${vocabBlock}`
        } else {
          // Analyzer/JSON Mode
          
          // Get sentence-level segments
          const segments = await translateWithGoogleSegments(passage)
          
          // Map to Analysis JSON structure
          const sentences = segments.map(segment => {
            // Filter vocab relevant to this specific sentence
            const segmentVocab = Object.entries(vocabMap)
              .filter(([word]) => segment.source.toLowerCase().includes(word.toLowerCase()))
              .map(([word, meaning]) => ({ word, meaning }))

            return {
              english: segment.source,
              vocab: segmentVocab.length > 0 ? segmentVocab : [{ word: "Note", meaning: "No key vocabulary found in this sentence" }],
              literal_translation: "Literal translation not available via Google Translate.",
              fluent_translation: segment.target
            }
          })

          const fakeAnalysis = { sentences }
          analysis = JSON.stringify(fakeAnalysis)
        }
        break
      case 'together':
        analysis = await analyzeWithTogether(passage, apiKey, systemPrompt)
        break
      case 'openai':
        analysis = await analyzeWithOpenAI(passage, apiKey, systemPrompt)
        break
      case 'huggingface':
        analysis = await analyzeWithHuggingFace(passage, apiKey, systemPrompt)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid AI provider' },
          { status: 400 }
        )
    }

    // For stable mode, we might want some formatting, but usually it's handled by client.
    // For default JSON mode, we pass the raw JSON string as 'html' because ResultDisplay now parses JSON.
    const html = analysis

    return NextResponse.json({ analysis, html })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
