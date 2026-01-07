export async function translateWithGoogle(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=bn&dt=t&q=${encodeURIComponent(text)}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    
    // Google Translate returns an array of arrays. The first element contains the translated segments.
    // data[0] is array of [translated_text, source_text, ...]
    if (data && data[0]) {
      return data[0].map((segment: any) => segment[0]).join('')
    }
    throw new Error('Invalid response from Google Translate')
  } catch (error) {
    console.error('Google Translate Error:', error)
    throw new Error('Failed to translate with Google')
  }
}

// Helper to split text into sentences respecting quotes and abbreviations
function splitIntoSentences(text: string): string[] {
  // Regex preserves delimiters, handles quotes, and avoids splitting on common abbreviations
  // 1. Matches sentence endings (.?!) followed by space/end 
  // 2. Ignores abbreviations (Mr., Mrs., Dr., i.e., e.g., etc.) - simplified check
  // 3. Keeps quotes together
  
  // Clean text first - normalized spaces
  const cleanText = text.replace(/\s+/g, ' ').trim()
  
  // This regex matches sentence boundaries while respecting quotes
  // It looks for [.!?] followed by space or end of string, but NOT if preceded by known abbreviations
  // For simplicity and robustness with quotes, we'll use a slightly different approach:
  // We'll split by common delimiters, then rejoin if it looks like an abbreviation or inside quotes.
  
  // Simple robust splitting for now:
  // Split by [.!?] that are followed by a space or end of line, OR by newlines
  // But capture the delimiter to re-attach
  
  /* 
     Better approach: Use a localized segmenter if available, or a good regex.
     For this specific issue, the problem is Google Translate API returning bad segments. 
     So we define our own segments.
  */

  const sentences: string[] = []
  let currentSentence = ""
  let inQuote = false
  
  // Scan character by character for maximum control
  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i]
    currentSentence += char
    
    if (char === '"' || char === '"' || char === '"') {
      inQuote = !inQuote
    }
    
    // Check for sentence end
    if (!inQuote && (char === '.' || char === '?' || char === '!') && (i === cleanText.length - 1 || cleanText[i+1] === ' ' || cleanText[i+1] === '"')) {
      // Check for common abbreviations to avoid splitting (limited list)
      const abbrevs = ['Mr.', 'Mrs.', 'Dr.', 'i.e.', 'e.g.', 'vs.', 'St.']
      const isAbbrev = abbrevs.some(abbr => currentSentence.endsWith(abbr))
      
      if (!isAbbrev) {
        sentences.push(currentSentence.trim())
        currentSentence = ""
      }
    }
  }
  
  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim())
  }
  
  return sentences.filter(s => s.length > 0)
}

export async function translateWithGoogleSegments(text: string): Promise<{ source: string; target: string }[]> {
  // 1. Split text into logical sentences manually
  const sentences = splitIntoSentences(text)
  
  // 2. Translate sentences in parallel (using translateWithGoogle for each)
  // We limit concurrency to avoid hitting rate limits too hard
  const results: { source: string; target: string }[] = []
  const batchSize = 5
  
  for (let i = 0; i < sentences.length; i += batchSize) {
    const batch = sentences.slice(i, i + batchSize)
    const promises = batch.map(async (sentence) => {
      try {
        const translated = await translateWithGoogle(sentence)
        return { source: sentence, target: translated }
      } catch (e) {
        return { source: sentence, target: "" } // Fallback to empty translation
      }
    })
    
    const batchResults = await Promise.all(promises)
    results.push(...batchResults)
  }
  
  return results
}

export async function translateBatch(words: string[]): Promise<Record<string, string>> {
  if (words.length === 0) return {}
  
  // Get unique words, limit to 1000 for performance (increased from 200)
  const uniqueWords = [...new Set(words.map(w => w.toLowerCase().trim()))].filter(w => w.length > 0).slice(0, 1000)
  
  if (uniqueWords.length === 0) return {}

  const resultMap: Record<string, string> = {}
  
  // Translate words in parallel (in small batches to avoid rate limits)
  const translateWord = async (word: string): Promise<[string, string]> => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(word)}`
      const response = await fetch(url)
      const data = await response.json()
      
      // Extract translation from response
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return [word, data[0][0][0]]
      }
      return [word, '']
    } catch {
      return [word, '']
    }
  }
  
  // Process in batches of 10 to avoid overwhelming the API
  const batchSize = 10
  for (let i = 0; i < uniqueWords.length; i += batchSize) {
    const batch = uniqueWords.slice(i, i + batchSize)
    const results = await Promise.all(batch.map(translateWord))
    
    results.forEach(([word, translation]) => {
      if (translation) {
        resultMap[word] = translation
      }
    })
  }
  
  return resultMap
}
