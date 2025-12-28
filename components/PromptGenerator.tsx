'use client'

import { useState } from 'react'
import { STANDARD_SYSTEM_PROMPT, JSON_ANALYSIS_PROMPT } from '@/lib/ai/prompts'

interface PromptGeneratorProps {
  isOpen: boolean
  onClose: () => void
}

export default function PromptGenerator({ isOpen, onClose }: PromptGeneratorProps) {
  const [passage, setPassage] = useState('')
  const [mode, setMode] = useState<'standard' | 'advanced'>('standard')
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const currentSystemPrompt = mode === 'standard' ? STANDARD_SYSTEM_PROMPT : JSON_ANALYSIS_PROMPT

  const handleCopyPrompt = () => {
    const fullPrompt = `${currentSystemPrompt}\n\nNow analyze this passage:\n\n${passage || '[Paste your English passage here]'}`
    navigator.clipboard.writeText(fullPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopySystemPrompt = () => {
    navigator.clipboard.writeText(currentSystemPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] sm:w-full max-w-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">প্রম্পট জেনারেটর</h2>
            <p className="text-xs text-gray-500 mt-1">API কী ছাড়াই স্মার্ট বিশ্লেষণ পাওয়ার সেরা উপায়</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar">
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex gap-3">
            <span className="text-xl">💡</span>
            <p className="text-sm text-blue-800 leading-relaxed">
              এই টুলটি আপনাকে একটি <strong>Powerful Prompt</strong> তৈরি করে দিবে। এটি কপি করে ChatGPT বা অন্য AI-তে দিলে আপনি আমাদের অ্যাপের মতোই সুন্দর রেজাল্ট পাবেন।
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex p-1 bg-gray-100 rounded-lg flex-1">
              <button
                onClick={() => setMode('standard')}
                className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-all ${mode === 'standard' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Standard (Text)
              </button>
              <button
                onClick={() => setMode('advanced')}
                className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-all ${mode === 'advanced' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Advanced (JSON)
              </button>
            </div>

            <div className="flex p-1 bg-gray-100 rounded-lg shrink-0">
               <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${showPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-white'}`}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>

          {!showPreview ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  আপনার প্যাসেজ (ঐচ্ছিক)
                </label>
                <textarea
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                  placeholder="এখানে ইংরেজি টেক্সট পেস্ট করুন..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow shadow-sm focus:shadow-md outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg hover:shadow-xl active:scale-95"
                >
                  <span>📋</span>
                  {copied ? 'কপি হয়েছে!' : 'সম্পূর্ণ প্রম্পট কপি করুন'}
                </button>
                <button
                  onClick={handleCopySystemPrompt}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl transition hover:bg-gray-50 active:scale-95"
                >
                  <span>📝</span>
                  {copied ? 'কপি হয়েছে!' : 'শুধু রুলস কপি করুন'}
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                 <h4 className="font-bold text-yellow-800 text-sm mb-2">📌 ব্যবহারবিধি:</h4>
                 <ol className="text-sm text-yellow-800 space-y-1 list-decimal ml-4">
                    <li>প্রম্পট কপি করুন।</li>
                    <li>ChatGPT / Claude ওপেন করে পেস্ট করুন।</li>
                    <li>ম্যাজিক দেখুন! ✨</li>
                 </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">System Prompt Preview</label>
                 <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{mode} mode</span>
              </div>
              <div className="bg-gray-800 text-gray-300 rounded-xl p-4 max-h-[300px] overflow-y-auto text-xs font-mono whitespace-pre-wrap border border-gray-700 shadow-inner">
                {currentSystemPrompt}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
