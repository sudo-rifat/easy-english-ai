// Robust Google Translate integration with manual batching
const TRANSLATE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';

// Split text into sentences using regex (handles abbreviations)
export function splitIntoSentences(text: string): string[] {
  // Regex to split by sentence-ending punctuation, but not abbreviations
  const abbreviations = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Sr', 'Jr', 'vs', 'etc', 'e.g', 'i.e'];
  
  // Replace abbreviations temporarily
  let processedText = text;
  const placeholders: { placeholder: string; original: string }[] = [];
  
  abbreviations.forEach((abbr, index) => {
    const regex = new RegExp(`\\b${abbr}\\.`, 'gi');
    const placeholder = `__ABBR${index}__`;
    processedText = processedText.replace(regex, (match) => {
      placeholders.push({ placeholder, original: match });
      return placeholder;
    });
  });
  
  // Split by sentence-ending punctuation
  const sentences = processedText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Restore abbreviations
  return sentences.map(sentence => {
    let restored = sentence;
    placeholders.forEach(({ placeholder, original }) => {
      restored = restored.replace(new RegExp(placeholder, 'g'), original);
    });
    return restored;
  });
}

// Translate a single text to Bengali
async function translateText(text: string, targetLang: string = 'bn'): Promise<string> {
  try {
    const url = `${TRANSLATE_ENDPOINT}?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT');
      }
      throw new Error(`Translation failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // The response structure: [[["translated text","original text",null,null,10],...],null,"en",...]
    if (data && data[0] && Array.isArray(data[0])) {
      return data[0].map((item: any[]) => item[0]).join('');
    }
    
    return '';
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// Delay helper for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Translate sentences in parallel batches
export async function translateSentences(
  sentences: string[],
  batchSize: number = 5,
  delayMs: number = 100
): Promise<Map<string, string>> {
  const translations = new Map<string, string>();
  
  for (let i = 0; i < sentences.length; i += batchSize) {
    const batch = sentences.slice(i, i + batchSize);
    
    try {
      const results = await Promise.all(
        batch.map(async (sentence) => {
          try {
            const translation = await translateText(sentence);
            return { sentence, translation };
          } catch (error) {
            console.error(`Failed to translate: "${sentence}"`, error);
            return { sentence, translation: '' };
          }
        })
      );
      
      results.forEach(({ sentence, translation }) => {
        translations.set(sentence, translation);
      });
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < sentences.length) {
        await delay(delayMs);
      }
    } catch (error) {
      console.error('Batch translation error:', error);
    }
  }
  
  return translations;
}

// Extract unique words from text
export function extractUniqueWords(text: string): string[] {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/[.,!?;:'"()[\]{}]/g, '').trim())
    .filter(word => word.length > 1); // Filter out single characters
  
  return [...new Set(words)];
}

// Fetch word meanings in batches
export async function fetchWordMeanings(
  words: string[],
  batchSize: number = 10,
  delayMs: number = 150
): Promise<Map<string, string>> {
  const meanings = new Map<string, string>();
  
  // Filter duplicates and clean words
  const uniqueWords = [...new Set(words.map(w => w.toLowerCase().trim()).filter(w => w.length > 1))];
  
  for (let i = 0; i < uniqueWords.length; i += batchSize) {
    const batch = uniqueWords.slice(i, i + batchSize);
    
    try {
      const results = await Promise.all(
        batch.map(async (word) => {
          try {
            const meaning = await translateText(word);
            return { word, meaning };
          } catch (error) {
            if ((error as Error).message === 'RATE_LIMIT') {
              // On rate limit, wait longer and retry
              await delay(1000);
              try {
                const meaning = await translateText(word);
                return { word, meaning };
              } catch {
                return { word, meaning: '' };
              }
            }
            return { word, meaning: '' };
          }
        })
      );
      
      results.forEach(({ word, meaning }) => {
        if (meaning) {
          meanings.set(word, meaning);
        }
      });
      
      // Add delay between batches
      if (i + batchSize < uniqueWords.length) {
        await delay(delayMs);
      }
    } catch (error) {
      console.error('Batch word meaning error:', error);
    }
  }
  
  return meanings;
}

// Single word translation with caching
const wordCache = new Map<string, string>();

export async function getWordMeaning(word: string): Promise<string | null> {
  const cleanedWord = word.toLowerCase().replace(/[.,!?;:'"()[\]{}]/g, '').trim();
  
  if (cleanedWord.length <= 1) return null;
  
  // Check cache first
  if (wordCache.has(cleanedWord)) {
    return wordCache.get(cleanedWord) || null;
  }
  
  try {
    const meaning = await translateText(cleanedWord);
    if (meaning) {
      wordCache.set(cleanedWord, meaning);
    }
    return meaning || null;
  } catch (error) {
    console.error('Word meaning error:', error);
    return null;
  }
}

// Get cached word meaning (synchronous)
export function getCachedWordMeaning(word: string): string | null {
  const cleanedWord = word.toLowerCase().replace(/[.,!?;:'"()[\]{}]/g, '').trim();
  return wordCache.get(cleanedWord) || null;
}

// Pre-populate cache with words
export function populateWordCache(meanings: Map<string, string>) {
  meanings.forEach((meaning, word) => {
    wordCache.set(word.toLowerCase(), meaning);
  });
}
