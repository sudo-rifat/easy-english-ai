// Clean word by removing punctuation and common suffixes
export function cleanWord(word: string): string {
  // Remove leading/trailing whitespace
  let cleaned = word.trim();
  
  // Remove common punctuation
  cleaned = cleaned.replace(/[.,!?;:'"()[\]{}]/g, '');
  
  // Handle possessive 's (robustly)
  cleaned = cleaned.replace(/'s$/i, '');
  
  // Handle contractions
  const contractions: Record<string, string> = {
    "won't": "will",
    "can't": "can",
    "don't": "do",
    "doesn't": "do",
    "didn't": "do",
    "isn't": "is",
    "aren't": "are",
    "wasn't": "was",
    "weren't": "were",
    "haven't": "have",
    "hasn't": "have",
    "hadn't": "have",
    "wouldn't": "would",
    "couldn't": "could",
    "shouldn't": "should",
    "mightn't": "might",
    "mustn't": "must",
    "it's": "it",
    "he's": "he",
    "she's": "she",
    "that's": "that",
    "what's": "what",
    "who's": "who",
    "there's": "there",
    "here's": "here",
    "where's": "where",
    "let's": "let",
    "i'm": "i",
    "you're": "you",
    "we're": "we",
    "they're": "they",
    "i've": "i",
    "you've": "you",
    "we've": "we",
    "they've": "they",
    "i'd": "i",
    "you'd": "you",
    "he'd": "he",
    "she'd": "she",
    "we'd": "we",
    "they'd": "they",
    "i'll": "i",
    "you'll": "you",
    "he'll": "he",
    "she'll": "she",
    "we'll": "we",
    "they'll": "they",
  };

  const lowerCleaned = cleaned.toLowerCase();
  if (contractions[lowerCleaned]) {
    return contractions[lowerCleaned];
  }

  // Handle general n't contractions
  if (cleaned.endsWith("n't")) {
    return cleaned.slice(0, -3);
  }

  return cleaned;
}

// Split text into lines
export function splitIntoLines(text: string): string[] {
  return text
    .split(/[.!?\n]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// Split line into words
export function splitIntoWords(line: string): string[] {
  return line.split(/\s+/).filter(word => word.length > 0);
}

// Clean OCR text
export function cleanOCRText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

// Apply adaptive thresholding (for image processing)
export function applyAdaptiveThreshold(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale and apply simple threshold for now 
  // (Full adaptive thresholding is complex, this is a performant approximation)
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const threshold = gray > 128 ? 255 : 0;
    data[i] = threshold;
    data[i + 1] = threshold;
    data[i + 2] = threshold;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Common English-Bengali vocabulary (Static fallback)
export const vocabularyMap: Record<string, string> = {
  "the": "দ্য (নির্দিষ্ট)",
  "a": "একটি",
  "an": "একটি",
  "is": "হয়/আছে",
  "are": "হয়/আছে",
  "was": "ছিল",
  "were": "ছিল",
  "have": "আছে",
  "has": "আছে",
  "had": "ছিল",
  "do": "করা",
  "go": "যাওয়া",
  "come": "আসা",
  "see": "দেখা",
  "look": "দেখা",
  "know": "জানা",
  "think": "ভাবা",
  "take": "নেওয়া",
  "make": "তৈরি করা",
  "get": "পাওয়া",
  "give": "দেওয়া",
  "and": "এবং",
  "or": "অথবা",
  "but": "কিন্তু",
  "if": "যদি",
  "because": "কারণ",
  "good": "ভালো",
  "new": "নতুন",
  "first": "প্রথম",
  "last": "শেষ",
  "long": "লম্বা",
  "great": "দুর্দান্ত",
  "little": "ছোট",
  "i": "আমি",
  "you": "তুমি/আপনি",
  "he": "সে",
  "she": "সে",
  "we": "আমরা",
  "they": "তারা",
};
