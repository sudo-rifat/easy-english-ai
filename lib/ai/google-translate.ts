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
  
  // Limit to avoid URL overflow and keep it fast. Max 50 words.
  const uniqueWords = [...new Set(words.map(w => w.toLowerCase().trim()))].filter(w => w.length > 2).slice(0, 50)
  
  if (uniqueWords.length === 0) return {}

  // Join with newlines to treat them as separate lines/segments
  const q = uniqueWords.join('\n')
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=bn&dt=t&q=${encodeURIComponent(q)}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    
    const resultMap: Record<string, string> = {}
    
    // data[0] contains the segments: [[translated, source, ...], ...]
    if (data && data[0]) {
      data[0].forEach((segment: any) => {
        // segment[1] is the source word/phrase, segment[0] is translated
        const source = segment[1]?.trim().toLowerCase()
        const target = segment[0]?.trim()
        
        if (source && target) {
          resultMap[source] = target
        }
      })
    }
    
    return resultMap
  } catch (error) {
    console.error('Batch Translation Error:', error)
    return {}
  }
}
