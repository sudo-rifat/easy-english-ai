'use client'

import { useState, useEffect } from 'react'

interface OnboardingModalProps {
  onComplete: () => void
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [language, setLanguage] = useState<'bn' | 'en' | null>(null)

  useEffect(() => {
    // Check if onboarding is already completed
    const completed = localStorage.getItem('onboarding_completed')
    if (!completed) {
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleFinish = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setIsOpen(false)
    if (onComplete) onComplete()
  }

  const handleSkip = () => {
    if (confirm('আপনি কি টিউটোরিয়াল স্কিপ করতে চান?\n(Do you want to skip the tutorial?)')) {
      handleFinish()
    }
  }

  const selectLanguage = (lang: 'bn' | 'en') => {
    setLanguage(lang)
    localStorage.setItem('user_language', lang)
    handleNext()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleSkip} 
      />

      {/* Modal Content */}
      <div className="relative glass-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header / Progress */}
        <div className="bg-white/40 backdrop-blur-md px-6 py-5 border-b border-white/20 flex justify-between items-center">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={`h-1.5 w-6 sm:w-8 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-indigo-600 shadow-sm shadow-indigo-200' : 'bg-slate-200'
                }`} 
              />
            ))}
          </div>
          <button 
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium transition"
          >
            Skip
          </button>
        </div>

        {/* Body */}
        <div className="p-6 min-h-[340px] flex flex-col items-center justify-center text-center">
          
          {/* STEP 0: Language */}
          {step === 0 && (
            <div className="space-y-6 w-full animate-in slide-in-from-right duration-300">
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome to Easy English AI!
                <span className="block text-lg text-gray-500 font-normal mt-1">Select your preferred language</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  onClick={() => selectLanguage('bn')}
                  className="group relative p-6 glass-panel rounded-2xl border-2 border-transparent hover:border-indigo-400 hover:bg-white/60 transition-all duration-300"
                >
                  <div className="text-4xl mb-2">🇧🇩</div>
                  <div className="font-bold text-slate-800 group-hover:text-indigo-700">বাংলা</div>
                  <div className="text-xs text-slate-500 mt-1">Bangla Interface</div>
                  {language === 'bn' && <div className="absolute top-3 right-3 text-indigo-500 font-bold">✓</div>}
                </button>

                <button
                  onClick={() => selectLanguage('en')}
                  className="group relative p-6 glass-panel rounded-2xl border-2 border-transparent hover:border-indigo-400 hover:bg-white/60 transition-all duration-300"
                >
                  <div className="text-4xl mb-2">🇺🇸</div>
                  <div className="font-bold text-slate-800 group-hover:text-indigo-700">English</div>
                  <div className="text-xs text-slate-500 mt-1">English Interface</div>
                  {language === 'en' && <div className="absolute top-3 right-3 text-indigo-500 font-bold">✓</div>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Analyzer Intro */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800">
                {language === 'bn' ? 'গভীর বিশ্লেষণ (Analyzer)' : 'Deep Analysis'}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {language === 'bn' 
                  ? 'যেকোনো ইংরেজি বাক্য বা প্যারাগ্রাফ দিন। আমাদের AI সেটির গ্রামার, শব্দভান্ডার এবং বাংলা অর্থ বিস্তারিতভাবে বুঝিয়ে দেবে।'
                  : 'Submit any English sentence or paragraph. Our AI will break down the grammar, vocabulary, and meaning in detail.'}
              </p>
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mt-2">
                <strong>Tip:</strong> Use Google Translate for quick results, or Gemini for detailed grammar explanation.
              </div>
            </div>
          )}

          {/* STEP 2: Stable Intro */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="text-6xl mb-4">📖</div>
              <h2 className="text-2xl font-bold text-gray-800">
                {language === 'bn' ? 'সহজ অনুবাদ (Easy Translation)' : 'Easy Translation'}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {language === 'bn' 
                  ? 'বই পড়ার মতো অভিজ্ঞতা! লাইন-বাই-লাইন ইংরেজি ও বাংলা অনুবাদ পড়ুন। কঠিন শব্দে ক্লিক করে অর্থ ও উচ্চারণ জানুন।'
                  : 'Experience reading like a book! Read line-by-line English and Bangla translations. Click on difficult words for meaning and pronunciation.'}
              </p>
            </div>
          )}

          {/* STEP 3: Prompt Generator Intro (NEW) */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="mb-4 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 2 2 2-2 2-2-2 2-2Z"/>
                  <path d="m5 7 2 2-2 2-2-2 2-2Z"/>
                  <path d="m15 11 2 2-2 2-2-2 2-2Z"/>
                  <path d="M6 20h3l10-10a2.3 2.3 0 0 0 0-3.2l-1.8-1.8a2.3 2.3 0 0 0-3.2 0l-10 10v3Z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {language === 'bn' ? 'প্রম্পট জেনারেটর (Prompt Generator)' : 'Prompt Generator'}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {language === 'bn'
                  ? 'API Key নেই? সমস্যা নেই! আমাদের বিল্ট-ইন প্রম্পট জেনারেটর ব্যবহার করুন। এটি আপনার জন্য এমন একটি প্রম্পট তৈরি করে দেবে যা আপনি ChatGPT বা Claude-এ ব্যবহার করে একই ফলাফল পেতে পারেন।'
                  : 'No API Key? No problem! Use our built-in Prompt Generator. It creates a perfect prompt for you to use in ChatGPT or Claude to get the exact same analysis.'}
              </p>
              <div className="bg-purple-50 p-2 rounded-lg text-sm text-purple-800 mt-2 inline-flex items-center gap-2 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 2 2 2-2 2-2-2 2-2Z"/>
                  <path d="m5 7 2 2-2 2-2-2 2-2Z"/>
                  <path d="m15 11 2 2-2 2-2-2 2-2Z"/>
                  <path d="M6 20h3l10-10a2.3 2.3 0 0 0 0-3.2l-1.8-1.8a2.3 2.3 0 0 0-3.2 0l-10 10v3Z"/>
                </svg>
                Click the "Prompt Generator" button to start
              </div>
            </div>
          )}

          {/* STEP 4: Response Formatter Intro (NEW) */}
          {step === 4 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-2xl font-bold text-gray-800">
                {language === 'bn' ? 'রেসপন্স ফরমেটার (Result Formatter)' : 'Result Formatter'}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {language === 'bn'
                  ? 'ChatGPT থেকে পাওয়া রেসপন্স বা যেকোনো JSON এখানে পেস্ট করুন। এটি অটোমেটিক সেটিকে সুন্দর কালারফুল কার্ডে সাজিয়ে দেবে এবং PDF ডাউনলোড করার অপশন দেবে।'
                  : 'Paste any JSON response from ChatGPT or other AIs here. It will automatically format it into beautiful colorful cards with PDF download options.'}
              </p>
            </div>
          )}

          {/* STEP 5: Ready */}
          {step === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-800">
                {language === 'bn' ? 'আপনি প্রস্তুত!' : 'You are all set!'}
              </h2>
              <p className="text-gray-600">
                {language === 'bn' 
                  ? 'আপনার ইংরেজি শেখার যাত্রা শুরু করুন। যেকোনো সময় সেটিংস থেকে সব পরিবর্তন করতে পারবেন।'
                  : 'Start your English learning journey. You can modify settings anytime.'}
              </p>
              
              <button 
                onClick={handleFinish}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                {language === 'bn' ? 'শুরু করুন (Get Started)' : 'Get Started'}
              </button>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        {step > 0 && step < 5 && (
          <div className="px-6 py-5 border-t border-white/20 bg-white/40 backdrop-blur-md flex justify-between items-center">
            <button 
              onClick={handleBack}
              className="px-5 py-2 text-slate-600 hover:text-slate-900 font-bold glass-button rounded-xl"
            >
              Back
            </button>
            <button 
              onClick={handleNext}
              className="px-8 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:scale-105 transition-all shadow-lg"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
