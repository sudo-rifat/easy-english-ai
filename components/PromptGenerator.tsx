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
    <div className="fixed inset-0 bg-black/40 bg-opacity-60 flex items-center justify-center z-[110] p-4 backdrop-blur-md">
      <div className="glass-card rounded-3xl shadow-2xl w-[95%] sm:w-full max-w-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20 bg-white/40 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Prompt Generator</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Get analysis without API keys</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full glass-button text-slate-600"
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
            <div className="flex p-1.5 glass-panel rounded-xl flex-1 backdrop-blur-md">
              <button
                onClick={() => setMode('standard')}
                className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all ${mode === 'standard' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
              >
                Standard (Text)
              </button>
              <button
                onClick={() => setMode('advanced')}
                className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all ${mode === 'advanced' ? 'bg-white shadow-md text-purple-600' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
              >
                Advanced (JSON)
              </button>
            </div>

            <div className="flex p-1.5 glass-panel rounded-xl shrink-0 backdrop-blur-md">
               <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${showPreview ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 font-medium hover:bg-white/50'}`}
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
                  placeholder="Paste English text here..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-white/40 bg-white/50 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-indigo-500 resize-none transition-all shadow-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl transition hover:shadow-indigo-500/20 shadow-lg hover:scale-[1.02] active:scale-95"
                >
                  <span>📋</span>
                  {copied ? 'Copied!' : 'Copy Full Prompt'}
                </button>
                <button
                  onClick={handleCopySystemPrompt}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 glass-button text-slate-700 font-bold rounded-2xl transition active:scale-95"
                >
                  <span>📝</span>
                  {copied ? 'Copied!' : 'Copy System Rules'}
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
