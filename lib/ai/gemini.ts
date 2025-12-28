const SYSTEM_PROMPT = `You are an English sentence analyzer and HTML generator.

TASK:
- Analyze each English sentence in the passage.
- Break each sentence into meaningful CHUNKS (parts).
- For EACH chunk: provide the Meaning in Bangla.
- Provide a full Literal and Fluent translation for the whole sentence.

OUTPUT FORMAT:
Generate ONLY valid HTML. For each sentence:

<div class="sentence-container" style="margin-bottom: 40px; padding: 20px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
  <div class="main-sentence" style="font-size: 22px; font-weight: bold; color: #1e40af; margin-bottom: 20px; line-height: 1.5;">
    [Full English Sentence]
  </div>

  <div class="chunks-container" style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 25px;">
    <!-- For each chunk, use this structure -->
    <div class="chunk-box" style="background: #f1f5f9; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6; min-width: 120px;">
      <div style="font-weight: bold; color: #334155; margin-bottom: 4px;">English Chunk</div>
      <div style="color: #64748b; font-size: 14px;">Bangla Meaning</div>
    </div>
  </div>

  <div class="translation-section" style="background: #eff6ff; padding: 18px; border-radius: 10px; border: 1px dashed #bfdbfe;">
    <div style="margin-bottom: 8px;"><strong style="color: #2563eb;">Literal (আক্ষরিক):</strong> [Word-for-word Bangla]</div>
    <div><strong style="color: #1e40af;">Fluent (সাবলীল):</strong> [Natural spoken Bangla]</div>
  </div>
</div>

RULES:
- Split the sentence into logical phrasal chunks or individual words if necessary.
- "Venge venge" analysis is key.
- Keep Bangla simple and student-friendly.
- Use HTML inline styles only.
- No markdown, no code blocks, just raw HTML.`

export async function analyzeWithGemini(
  passage: string,
  apiKey: string,
  customSystemPrompt?: string | null
): Promise<string> {
  try {
    // Google's official gemini-2.0-flash model
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${customSystemPrompt || SYSTEM_PROMPT}\n\nAnalyze this passage:\n\n${passage}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8096,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Gemini API Response:', error)
      throw new Error(error.error?.message || `API Error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API')
    }

    const responseText = data.candidates[0]?.content?.parts[0]?.text
    
    if (!responseText) {
      throw new Error('Empty response from Gemini API')
    }

    return responseText
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Gemini Error:', errorMsg)
    throw new Error(`Gemini error: ${errorMsg}`)
  }
}
