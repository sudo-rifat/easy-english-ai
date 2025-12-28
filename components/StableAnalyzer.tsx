'use client'

import { useState, useEffect, useRef } from 'react'
import { storage } from '@/lib/storage'
import ThemeSelector, { Theme } from './ThemeSelector'
import { parseStableResponse } from '@/lib/ai/stable'

interface StableAnalyzerProps {
  initialPassage?: string
}

export default function StableAnalyzer({ initialPassage = '' }: StableAnalyzerProps) {
  const [passage, setPassage] = useState(initialPassage)
  const [aiProvider, setAiProvider] = useState('google-translate')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ lines: { en: string; bn: string }[]; vocab: Record<string, string> } | null>(null)
  const [tooltip, setTooltip] = useState<{ word: string; meaning: string; x: number; y: number } | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<Theme>('modern-blue')
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedProvider = storage.getSavedProvider()
    if (savedProvider) setAiProvider(savedProvider)
  }, [])

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return

    const html2pdf = (await import('html2pdf.js')).default
    const element = pdfRef.current
    const opt = {
      margin: [0.5, 0.5] as [number, number],
      filename: `EasyEnglish_Reader_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    }

    html2pdf().from(element).set(opt).save()
  }

  const handleAnalyze = async () => {
    if (!passage.trim()) return

    setLoading(true)
    setResult(null)
    
    try {
      const apiKey = storage.getProviderKey(aiProvider)
      if (!apiKey && aiProvider !== 'google-translate') {
        alert('প্রথমে সেটিংস থেকে API কী সেট করুন')
        setLoading(false)
        return
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage: passage.trim(),
          aiProvider,
          apiKey: apiKey || '',
          mode: 'stable'
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setResult(parseStableResponse(data.analysis))
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleWordClick = (word: string, e: React.MouseEvent) => {
    // Clean word for dictionary lookup
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase()
    const meaning = result?.vocab[cleanWord]
    
    if (meaning) {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
      
      setTooltip({
        word: cleanWord,
        meaning,
        x: e.clientX,
        y: e.clientY - 80
      })

      // Text to Speech
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)

      tooltipTimer.current = setTimeout(() => {
        setTooltip(null)
      }, 4000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm border">
        <textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          placeholder="আপনার ইংরেজি প্যাসেজ এখানে দিন (লাইন-বাই-লাইন অনুবাদের জন্য)..."
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-none text-base"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value)}
            className="flex-1 p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="gemini">Google Gemini</option>
            <option value="google-translate">Google Translate (Free)</option>
            <option value="groq">Groq Llama 3.1</option>
            <option value="together">Together AI</option>
            <option value="openai">OpenAI</option>
            <option value="huggingface">Hugging Face</option>
          </select>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition shadow-md sm:shadow-lg"
          >
            {loading ? 'প্রক্রিয়া করা হচ্ছে...' : 'ইন্টারেক্টিভ বিশ্লেষণ'}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <ThemeSelector selectedTheme={selectedTheme} onThemeChange={setSelectedTheme} />
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              📥 Download PDF
            </button>
          </div>

          <div ref={pdfRef} className={`theme-${selectedTheme} p-6 bg-white rounded-xl shadow-sm border space-y-4`}>
            {result.lines.map((line, idx) => (
              <div key={idx} className="sentence-container group p-5 bg-white rounded-xl border border-gray-100 hover:border-blue-400 transition-all duration-300 shadow-sm">
                <div className="flex flex-wrap gap-x-1.5 gap-y-2 mb-3">
                  {(line.en || '').split(' ').filter(Boolean).map((word, wIdx) => {
                    const clean = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase()
                    const hasMeaning = !!result.vocab[clean]
                    return (
                      <span
                        key={wIdx}
                        onClick={(e) => handleWordClick(word, e)}
                        className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors font-medium text-xl sm:text-2xl inline-block
                          ${hasMeaning 
                            ? 'text-blue-700 hover:bg-blue-100 decoration-blue-300 underline underline-offset-4 decoration-dashed' 
                            : 'text-gray-800'
                          }`}
                      >
                        {word}
                      </span>
                    )
                  })}
                </div>
                <div className="text-gray-600 font-medium border-t pt-2 border-gray-100">
                  {line.bn || 'অনুবাদ পাওয়া যায়নি'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tooltip && (
        <div 
          className="fixed z-[100] px-4 py-3 bg-gray-800 text-white text-sm rounded-xl shadow-2xl animate-in fade-in zoom-in-95 pointer-events-none max-w-[90vw] whitespace-normal text-center"
          style={{ 
            left: `${tooltip.x}px`, 
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-bold border-b border-gray-600 mb-1.5 pb-1 text-blue-300 uppercase tracking-wider text-xs">{tooltip.word}</div>
          <div className="text-sm font-medium">{tooltip.meaning}</div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
        </div>
      )}
    </div>
  )
}
