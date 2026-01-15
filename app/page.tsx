'use client'

import { useState } from 'react'
import AnalyzerForm from '@/components/AnalyzerForm'
import ResultDisplay from '@/components/ResultDisplay'
import SettingsModal from '@/components/SettingsModal'
import PromptGenerator from '@/components/PromptGenerator'
import ResponseFormatter from '@/components/ResponseFormatter'
import ThemeSelector, { Theme } from '@/components/ThemeSelector'
import StableAnalyzer from '@/components/StableAnalyzer'
import OnboardingModal from '@/components/OnboardingModal'
import { splitIntoSentences, translateSentences } from '@/lib/translationService'

type ViewMode = 'analyzer' | 'formatter' | 'stable'

export default function Home() {
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [promptGeneratorOpen, setPromptGeneratorOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('stable')
  const [analyzerTheme, setAnalyzerTheme] = useState<Theme>('modern-blue')

  const handleAnalyze = async (formData: {
    passage: string
    aiProvider: string
    apiKey: string
  }) => {
    setLoading(true)
    setResult(null)
    
    try {
      // Special handling for Client-Side Google Translate
      if (formData.aiProvider === 'google-translate') {
        const sentences = splitIntoSentences(formData.passage);
        
        // 1. Translate sentences
        const translatedMap = await translateSentences(sentences);

        // 2. Fetch word meanings
        const allWords = formData.passage.split(/\s+/).map(w => w.replace(/[.,!?;:'"()[\]{}]/g, '').trim()).filter(w => w.length > 2);
        const uniqueWords = [...new Set(allWords)];
        // Use a smaller batch size for word meanings to ensure reliability
        const wordMeanings = await import('@/lib/translationService').then(m => m.fetchWordMeanings(uniqueWords, 10, 200));

        const analyzedData = {
          sentences: sentences.map(original => {
            // Split into "pseudo-chunks" (words)
            const words = original.split(/(\s+|[,.;?!]+)/).filter(w => w.trim().length > 0);
            
            return {
              original,
              translation: translatedMap.get(original) || '',
              chunks: words.map(text => {
                const cleanText = text.trim().replace(/[.,!?;:'"()[\]{}]/g, '').toLowerCase();
                const isWord = cleanText.length > 0 && /\w/.test(text); // Basic check if it's a word
                
                return {
                  text: text,
                  meaning: isWord ? (wordMeanings.get(cleanText) || wordMeanings.get(text.trim()) || '') : '',
                  grammar: null,
                  color: 'gray'
                };
              })
            };
          })
        };
        
        setResult(JSON.stringify(analyzedData));
        setLoading(false);
        return;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Handle both legacy HTML response and new JSON response
        setResult(data.html || JSON.stringify(data))
      } else {
        setResult(`<div class="p-4 bg-red-100 border border-red-400 rounded text-red-700">${data.error}</div>`)
      }
    } catch (error) {
      setResult(`<div class="p-4 bg-red-100 border border-red-400 rounded text-red-700">Error: ${error instanceof Error ? error.message : 'Unknown error'}</div>`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-4 px-3 sm:py-6 sm:px-4 md:py-8 overflow-x-hidden">
      <div className={`max-w-7xl mx-auto theme-${analyzerTheme}`}>
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="flex justify-center items-center gap-2 sm:gap-4 mb-3 sm:mb-4 flex-wrap">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 pb-2">
              Sahaj English
            </h1>
            <p className="text-slate-600 font-medium">AI Powered English Learning Assistant</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 hover:bg-gray-200 rounded-full transition text-xl sm:text-2xl"
                title="সেটিংস"
              >
                ⚙️
              </button>
              <button
                onClick={() => setPromptGeneratorOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-purple-100 rounded-lg transition text-xs sm:text-sm font-bold text-purple-700 bg-purple-50 border border-purple-200 shadow-sm"
                title="API কী নেই? প্রম্পট জেনারেটর ব্যবহার করুন"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <path d="m19 2 2 2-2 2-2-2 2-2Z"/>
                  <path d="m5 7 2 2-2 2-2-2 2-2Z"/>
                  <path d="m15 11 2 2-2 2-2-2 2-2Z"/>
                  <path d="M6 20h3l10-10a2.3 2.3 0 0 0 0-3.2l-1.8-1.8a2.3 2.3 0 0 0-3.2 0l-10 10v3Z"/>
                </svg>
                <span>Prompt Generator</span>
              </button>
            </div>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex justify-start sm:justify-center mb-8 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="glass-panel p-1.5 rounded-2xl flex gap-2 min-w-max backdrop-blur-md">
              <button
                onClick={() => setViewMode('analyzer')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${viewMode === 'analyzer' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                🔍 বিশ্লেষক (Analyzer)
              </button>
              <button
              onClick={() => setViewMode('stable')}
              className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-base transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                viewMode === 'stable'
                  ? 'bg-white text-blue-600 shadow-md transform scale-105 ring-2 ring-blue-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>📖</span>
              Easy Translation
            </button>
              <button
                onClick={() => setViewMode('formatter')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${viewMode === 'formatter' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                🎨 রেসপন্স ফরমেটার (Formatter)
              </button>
            </div>
          </div>
        </div>

        {/* Analyzer Tab Content */}
        <div className={viewMode === 'analyzer' ? 'block animate-in fade-in duration-500' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="glass-card rounded-2xl p-4 sm:p-6 md:p-8">
              <AnalyzerForm onAnalyze={handleAnalyze} loading={loading} />
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-6 md:p-8 min-h-[400px] sm:min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-4 min-h-[40px]">
                <h3 className="text-lg font-bold text-gray-800">বিশ্লেষণ ফলাফল</h3>
                {result && !loading && (
                  <ThemeSelector 
                    selectedTheme={analyzerTheme} 
                    onThemeChange={setAnalyzerTheme} 
                  />
                )}
              </div>

              <div className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                      <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">আপনার প্যাসেজ বিশ্লেষণ করা হচ্ছে...</p>
                    </div>
                  </div>
                ) : result ? (
                  <ResultDisplay html={result} theme={analyzerTheme} />
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <p className="text-gray-400 text-sm sm:text-base px-2">আপনার বিশ্লেষণ এখানে দেখা যাবে</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Easy Translation Content */}
        <div className={viewMode === 'stable' ? 'block animate-in fade-in zoom-in-95 duration-500' : 'hidden'}>
          <div className="glass-card rounded-2xl p-2 sm:p-4 md:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 border-gray-100 gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="p-1.5 bg-primary/10 rounded text-primary">📖</span>
                  Easy Translation
                </h2>
                <p className="text-gray-600 text-sm mt-1">শব্দে ক্লিক করে অর্থ দেখুন ও উচ্চারণ শুনুন</p>
              </div>
              <ThemeSelector 
                selectedTheme={analyzerTheme} 
                onThemeChange={setAnalyzerTheme} 
              />
            </div>
            <StableAnalyzer />
          </div>
        </div>

        {/* Response Formatter Content */}
        <div className={viewMode === 'formatter' ? 'block animate-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
          <div className="glass-card rounded-2xl p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800">রেসপন্স ফরমেটার</h2>
                <p className="text-gray-600 text-sm">AI এর রেসপন্স এখানে পেস্ট করুন এবং সুন্দরভাবে সাজিয়ে PDF ডাউনলোড করুন</p>
              </div>
            </div>
            <ResponseFormatter />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Prompt Generator Modal */}
      <PromptGenerator isOpen={promptGeneratorOpen} onClose={() => setPromptGeneratorOpen(false)} />

      {/* Onboarding Modal */}
      <OnboardingModal onComplete={() => {}} />
    </main>
  )
}
