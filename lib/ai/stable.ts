/**
 * Specialized logic for the Stable Interactive Reader.
 * It focuses on structured data (Line-by-line + Vocab map) 
 * instead of generating raw HTML.
 */

export const STABLE_SYSTEM_PROMPT = `You are an English-to-Bangla translation expert.
Your goal is to provide a structured analysis that is extremely stable and easy to parse.

TASK:
1. Translate the English passage line by line.
2. Provide a dictionary of all unique meaningful words/phrases in the passage with their Bangla meaning relative to this context.

OUTPUT FORMAT:
Your response MUST follow this exact structure:

[LINES]
English Line 1 ||| Bangla Translation 1
English Line 2 ||| Bangla Translation 2
...

[VOCAB]
word1 ||| Bangla meaning with pronunciation hint (if helpful)
word2 ||| Bangla meaning
...

RULES:
- Do NOT provide HTML or CSS.
- Do NOT provide conversational text.
- Use "|||" as the separator.
- Keep the Bangla natural and student-friendly.
- For [VOCAB], provide meanings that match the context of the passage.
- Ensure every line from the original English passage is translated.

Example:
[LINES]
I am learning English. ||| আমি ইংরেজি শিখছি।
It is very easy. ||| এটি খুব সহজ।

[VOCAB]
learning ||| শিখছি
English ||| ইংরেজি (ইংলিশ)
easy ||| সহজ`

export function parseStableResponse(responseContent: string | undefined | null) {
  const lines: { en: string; bn: string }[] = []
  const vocab: Record<string, string> = {}
  
  if (!responseContent || typeof responseContent !== 'string') {
    return { lines, vocab }
  }

  const sections = responseContent.split(/\[LINES\]|\[VOCAB\]/i)
  
  // Identify which section is which based on content if tags are missing
  // But usually split follows the order: [0]=pre-tag, [1]=LINES, [2]=VOCAB
  const linesContent = sections[1] || ''
  const vocabContent = sections[2] || ''

  // Parse lines
  linesContent.split('\n').filter(l => l.includes('|||')).forEach(line => {
    const parts = line.split('|||')
    if (parts.length >= 2) {
      lines.push({
        en: parts[0].trim(),
        bn: parts[1].trim()
      })
    }
  })

  // Parse vocab
  vocabContent.split('\n').filter(l => l.includes('|||')).forEach(item => {
    const parts = item.split('|||')
    if (parts.length >= 2) {
      const word = parts[0].trim().toLowerCase()
      vocab[word] = parts[1].trim()
    }
  })

  return { lines, vocab }
}
