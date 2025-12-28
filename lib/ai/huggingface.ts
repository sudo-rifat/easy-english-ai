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

export async function analyzeWithHuggingFace(
  passage: string,
  apiKey: string,
  customSystemPrompt?: string | null,
  hideDefaultModel?: boolean // Added as per the provided code edit snippet
): Promise<string> {
  try {
    const model = 'meta-llama/Llama-3.1-8B-Instruct'
    // The official unified router endpoint for Hugging Face Inference Providers
    const url = `https://router.huggingface.co/v1/chat/completions`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: hideDefaultModel ? undefined : model,
        messages: [
          {
            role: 'system',
            content: customSystemPrompt || SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Analyze this passage:\n\n${passage}`
          }
        ],
        max_tokens: 4096, // Changed from 2048 to 4096 as per the provided code edit snippet
        temperature: 0.7,
      }),
    })

    const responseTextRaw = await response.text()

    if (!response.ok) {
      console.error('Hugging Face Router Error raw:', responseTextRaw)
      
      let errorMessage = `API Error: ${response.status}`
      try {
        const errorJson = JSON.parse(responseTextRaw)
        errorMessage = errorJson.error?.message || errorJson.error || errorMessage
      } catch {
        errorMessage = responseTextRaw || errorMessage
      }
      throw new Error(errorMessage)
    }

    const data = JSON.parse(responseTextRaw)
    const analysis = data.choices?.[0]?.message?.content
    
    if (!analysis) {
      throw new Error('Empty response from Hugging Face Router')
    }

    return analysis
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Hugging Face Router Error:', errorMsg)
    throw new Error(`Hugging Face error: ${errorMsg}`)
  }
}
