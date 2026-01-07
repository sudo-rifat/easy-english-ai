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

export async function translateWithGoogleSegments(text: string): Promise<{ source: string; target: string }[]> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=bn&dt=t&q=${encodeURIComponent(text)}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data && data[0]) {
      // Map segments to structure
      return data[0].map((segment: any) => ({
        source: segment[1] || '',
        target: segment[0] || ''
      })).filter((s: any) => s.source && s.target)
    }
    return []
  } catch (error) {
    console.error('Google Translate Segments Error:', error)
    return []
  }
}

export async function translateBatch(words: string[]): Promise<Record<string, string>> {
  if (words.length === 0) return {}
  
  // Get unique words, limit to 200 for performance (increased from 50)
  const uniqueWords = [...new Set(words.map(w => w.toLowerCase().trim()))].filter(w => w.length > 0).slice(0, 200)
  
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
