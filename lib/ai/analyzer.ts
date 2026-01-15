/**
 * AI Analyzer Service
 * Calls the /api/analyze route to get structured sentence breakdown
 */

export interface Chunk {
  text: string;
  meaning: string;
  grammar?: string; // Hint: Subject, Verb, etc.
  color?: string;   // blue, red, green, gray
}

export interface AnalyzedSentence {
  original: string;
  translation: string;
  chunks: Chunk[];
}

export interface AnalysisResult {
  sentences: AnalyzedSentence[];
}

export async function analyzeTextWithAI(
  text: string,
  provider: string,
  apiKey: string
): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, provider, apiKey })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Analysis failed');
  }

  return response.json();
}
