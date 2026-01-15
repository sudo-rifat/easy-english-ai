import { NextRequest, NextResponse } from 'next/server';

const TRANSLATION_PROMPT = `You are an English-to-Bengali translation expert.

TASK:
1. Translate each line of the given English text into natural Bengali.
2. Provide Bengali meanings for all unique meaningful words in the text.

OUTPUT FORMAT (STRICT):
[LINES]
English Line 1 ||| Bengali Translation 1
English Line 2 ||| Bengali Translation 2

[VOCAB]
word1 ||| Bengali meaning
word2 ||| Bengali meaning

RULES:
- Use "|||" as separator
- Keep Bengali natural and student-friendly
- Include all unique words (nouns, verbs, adjectives, adverbs)
- For context-dependent words, give meaning matching THIS text
- No extra commentary, just the translations`;

export async function POST(request: NextRequest) {
  try {
    const { text, provider, apiKey } = await request.json();

    if (!text || !provider || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let responseText = '';

    if (provider === 'huggingface') {
      // Hugging Face Inference API - Using Zephyr 7B (reliable on free tier)
      // The previous Mixtral endpoint was deprecated/moved
      const response = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `<|system|>\n${TRANSLATION_PROMPT}\n</s>\n<|user|>\nTranslate this text:\n\n${text}\n</s>\n<|assistant|>\n`,
          parameters: {
            max_new_tokens: 2048,
            temperature: 0.3,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.error || `HuggingFace API Error: ${response.status}` }, { status: response.status });
      }

      const data = await response.json();
      responseText = data[0]?.generated_text || '';
    } else if (provider === 'gemini') {
      // Gemini API
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: `${TRANSLATION_PROMPT}\n\nTranslate this text:\n\n${text}` }]
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.error?.message || `Gemini API Error` }, { status: response.status });
      }

      const data = await response.json();
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      // Groq and other OpenAI-compatible APIs
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: TRANSLATION_PROMPT },
            { role: 'user', content: `Translate this text:\n\n${text}` }
          ],
          temperature: 0.3,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.error?.message || `API Error` }, { status: response.status });
      }

      const data = await response.json();
      responseText = data.choices?.[0]?.message?.content || '';
    }

    // Parse the AI response
    const lines: Record<string, string> = {};
    const vocab: Record<string, string> = {};

    const sections = responseText.split(/\[LINES\]|\[VOCAB\]/i);
    const linesContent = sections[1] || '';
    const vocabContent = sections[2] || '';

    // Parse lines
    linesContent.split('\n').filter((l: string) => l.includes('|||')).forEach((line: string) => {
      const parts = line.split('|||');
      if (parts.length >= 2) {
        lines[parts[0].trim()] = parts[1].trim();
      }
    });

    // Parse vocab
    vocabContent.split('\n').filter((l: string) => l.includes('|||')).forEach((item: string) => {
      const parts = item.split('|||');
      if (parts.length >= 2) {
        const word = parts[0].trim().toLowerCase().replace(/[''`]/g, "'").replace(/[.,?!]$/g, "");
        vocab[word] = parts[1].trim();
      }
    });

    return NextResponse.json({ lines, vocab, raw: responseText });
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
