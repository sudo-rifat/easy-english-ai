'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'

const AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini (Free)' },
  { id: 'groq', name: 'Groq Llama 3.1 (Fast)' },
  { id: 'google-translate', name: 'Google Translate (Free)' },
  { id: 'together', name: 'Together AI' },
  { id: 'openai', name: 'OpenAI / Claude API' },
  { id: 'huggingface', name: 'Hugging Face' },
]

interface AnalyzerFormProps {
  onAnalyze: (data: {
    passage: string
    aiProvider: string
    apiKey: string
  }) => void
  loading: boolean
}

export default function AnalyzerForm({ onAnalyze, loading }: AnalyzerFormProps) {
  const [passage, setPassage] = useState('')
  const [aiProvider, setAiProvider] = useState('gemini')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [rememberKey, setRememberKey] = useState(false)
  const [hasSavedKey, setHasSavedKey] = useState(false)

  // Load saved credentials for current provider
  useEffect(() => {
    const savedApiKey = storage.getProviderKey(aiProvider)
    const savedProvider = storage.getSavedProvider()

    if (savedApiKey) {
      setApiKey(savedApiKey)
      setHasSavedKey(true)
      setRememberKey(true)
    } else {
      setApiKey('')
      setHasSavedKey(false)
      setRememberKey(false)
    }

    if (savedProvider && aiProvider === 'gemini') { // Only initial check
      // This part handles the first load
    }
  }, [aiProvider])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passage.trim()) {
      alert('অনুগ্রহ করে একটি প্যাসেজ প্রবেশ করুন')
      return
    }
    
    // Skip key check for Google Translate
    if (aiProvider !== 'google-translate' && !apiKey.trim()) {
      alert('অনুগ্রহ করে একটি API কী প্রবেশ করুন')
      return
    }

    // Save credentials if checkbox is checked
    if (rememberKey && aiProvider !== 'google-translate') {
      storage.saveProviderKey(aiProvider, apiKey.trim())
    }

    onAnalyze({
      passage: passage.trim(),
      aiProvider,
      apiKey: apiKey.trim(),
    })
  }

  const handleClearSavedKey = () => {
    if (confirm(`আপনার সংরক্ষিত ${aiProvider} API কী মুছে ফেলবেন?`)) {
      storage.removeProviderKey(aiProvider)
      setApiKey('')
      setHasSavedKey(false)
      setRememberKey(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
          AI প্রদানকারী
        </label>
        <select
          value={aiProvider}
          onChange={(e) => setAiProvider(e.target.value)}
          disabled={loading}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          {AI_PROVIDERS.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
          {aiProvider === 'gemini' && '📌 console.cloud.google.com থেকে বিনামূল্যে কী পান'}
          {aiProvider === 'groq' && '⚡ console.groq.com থেকে বিনামূল্যে কী পান (সবচেয়ে দ্রুত!)'}
          {aiProvider === 'together' && '🚀 together.ai থেকে বিনামূল্যে কী পান'}
          {aiProvider === 'openai' && '🔑 OpenAI, Anthropic Claude APIs এর সাথে কাজ করে'}
          {aiProvider === 'huggingface' && '🤗 Hugging Face Inference API ব্যবহার করুন'}
          {aiProvider === 'google-translate' && '🌐 Google Translate থেকে সরাসরি অনুবাদ'}
        </p>
      </div>

      {aiProvider !== 'google-translate' && (
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            API কী
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={loading}
              placeholder="sk-... বা আপনার-api-key..."
              className="w-full px-3 sm:px-4 py-3 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 sm:right-3 top-2.5 sm:top-3 text-gray-500 hover:text-gray-700 text-lg"
            >
              {showApiKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {/* Remember Key Checkbox */}
          <label className="flex items-center mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberKey}
              onChange={(e) => setRememberKey(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="ml-2 text-xs sm:text-sm text-gray-600">
              আমার API কী মনে রাখুন (স্থানীয়ভাবে সংরক্ষিত)
            </span>
          </label>

          {/* Show saved key indicator */}
          {hasSavedKey && (
            <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded px-2 sm:px-3 py-2 text-xs sm:text-sm gap-2">
              <span className="text-green-700">✓ API কী সংরক্ষিত</span>
              <button
                type="button"
                onClick={handleClearSavedKey}
                disabled={loading}
                className="text-red-600 hover:text-red-800 disabled:text-gray-400 whitespace-nowrap"
              >
                মুছুন
              </button>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
          ইংরেজি প্যাসেজ
        </label>
        <textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          disabled={loading}
          placeholder="আপনার ইংরেজি প্যাসেজ এখানে আটকান..."
          rows={6}
          className="w-full px-3 sm:px-4 py-3 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
        />
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          {passage.length} অক্ষর
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !passage.trim() || (aiProvider !== 'google-translate' && !apiKey.trim())}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl"
      >
        {loading ? 'বিশ্লেষণ করা হচ্ছে...' : 'প্যাসেজ বিশ্লেষণ করুন'}
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>💡 টিপ:</strong> আপনার API কী নিরাপদে পাঠানো হয়। কখনও আপনার API কী জনসাধারণের সাথে শেয়ার করবেন না!
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-green-800">
          <strong>🚀 API কী নেই?</strong> শীর্ষে রকেট বোতাম (🚀) ক্লিক করুন আমাদের প্রম্পট জেনারেটর ব্যবহার করতে। বিনামূল্যে ফরম্যাটেড টেক্সট পান যা Word, Google Docs বা শেয়ারিংয়ের জন্য প্রস্তুত!
        </p>
      </div>
    </form>
  )
}
