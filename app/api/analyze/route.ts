import { NextRequest, NextResponse } from 'next/server';

const ANALYZER_PROMPT = `You are an expert English-to-Bengali language teacher.
TASK: Analyze the following English text.
1. Split the text into individual sentences.
2. For each sentence, break it down into logical "meaning chunks" (phrases).
3. Provide the Bengali meaning for each chunk.
4. Provide a natural, fluent Bengali translation for the full sentence.
5. Assign a grammar role/color hint to main chunks (Subject=blue, Verb=red, Object/Preposition=green, Other=gray).

OUTPUT FORMAT:
Return ONLY valid JSON with this structure:
{
  "sentences": [
    {
      "original": "Full English sentence",
      "translation": "Full natural Bengali translation",
      "chunks": [
        { "text": "English chunk", "meaning": "Bengali meaning", "grammar": "Subject", "color": "blue" },
        { "text": "English chunk", "meaning": "Bengali meaning", "grammar": "Verb", "color": "red" }
      ]
    }
  ]
}

TEXT TO ANALYZE:
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text || body.passage;
    const provider = body.provider || body.aiProvider;
    const apiKey = body.apiKey;

    if (!text || !provider) {
      return NextResponse.json({ error: 'Missing required fields (text/passage or provider)' }, { status: 400 });
    }

    let responseText = '';
    const fullPrompt = `${ANALYZER_PROMPT}\n"${text}"`;

    // Common fetch options
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    if (provider === 'huggingface') {
       // Using Zephyr 7B as it is reliable on free tier
       const response = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: `<|system|>\n${ANALYZER_PROMPT}\n</s>\n<|user|>\n${text}\n</s>\n<|assistant|>\n`,
          parameters: { max_new_tokens: 4096, temperature: 0.1, return_full_text: false }
        })
      });
      if (!response.ok) throw new Error(`HuggingFace Error: ${response.status}`);
      const data = await response.json();
      responseText = data[0]?.generated_text || '';

    } else if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
        })
      });
      if (!response.ok) throw new Error(`Gemini Error: ${response.status}`);
      const data = await response.json();
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else {
      // Groq (Llama 3.3) / OpenAI
      const model = provider === 'openai' ? 'gpt-4o' : 'llama-3.3-70b-versatile';
      const url = provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.groq.com/openai/v1/chat/completions';
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: ANALYZER_PROMPT },
            { role: 'user', content: text }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) throw new Error(`${provider} Error: ${response.status}`);
      const data = await response.json();
      responseText = data.choices?.[0]?.message?.content || '';
    }

    // Clean and Parse JSON
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Analyzer API error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
