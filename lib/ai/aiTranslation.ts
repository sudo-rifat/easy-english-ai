/**
 * AI-based Translation Service
 * Uses Next.js API route to avoid CORS issues
 */

interface TranslationResult {
  lines: Map<string, string>;
  vocab: Map<string, string>;
}

// Main translation function - calls Next.js API route
export async function translateWithAI(
  text: string,
  provider: 'gemini' | 'groq' | 'together' | 'openai' | 'huggingface',
  apiKey: string
): Promise<TranslationResult> {
  if (!apiKey) {
    throw new Error('API key is required for AI translation');
  }

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, provider, apiKey })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Translation failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Convert object to Map
  const lines = new Map<string, string>(Object.entries(data.lines || {}));
  const vocab = new Map<string, string>(Object.entries(data.vocab || {}));

  return { lines, vocab };
}
