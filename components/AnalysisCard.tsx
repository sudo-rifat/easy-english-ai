import React from 'react'

interface AnalysisCardProps {
  index: number
  sentence: {
    english: string
    vocab: { word: string; meaning: string }[]
    literal_translation: string
    fluent_translation: string
  }
}

export default function AnalysisCard({ index, sentence }: AnalysisCardProps) {
  return (
    <div className="result-card p-6 rounded-2xl glass-panel border border-white/40 hover:border-indigo-300 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 border-b border-white/20 pb-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
          {index.toString().padStart(2, '0')}
        </span>
        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Analysis</span>
      </div>

      {/* English Sentence */}
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-relaxed tracking-tight">
          {sentence.english}
        </h3>
      </div>

      {/* Grid Layout for Vocab & Translation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Vocabulary Column */}
        <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-4 h-full">
          <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">
            <span>📖</span> Vocabulary
          </h4>
          <div className="space-y-2">
            {sentence.vocab.map((v, i) => (
              <div key={i} className="flex justify-between items-start border-b border-white/20 last:border-0 pb-2 last:pb-0">
                <span className="font-bold text-slate-800 text-sm md:text-base">{v.word}</span>
                <span className="text-slate-600 text-sm italic text-right ml-4">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Translation Column */}
        <div className="space-y-4 h-full flex flex-col">
          <div className="bg-indigo-50/50 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100 flex-1">
            <h4 className="font-bold text-indigo-800 text-xs uppercase mb-2">Literal (আক্ষরিক)</h4>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed">
              {sentence.literal_translation}
            </p>
          </div>
          
          <div className="bg-emerald-50/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100 flex-1">
            <h4 className="font-bold text-emerald-800 text-xs uppercase mb-2">Fluent (সাবলীল)</h4>
            <p className="text-slate-800 font-semibold text-lg md:text-xl leading-relaxed">
              {sentence.fluent_translation}
            </p>
          </div>
        </div>
        
      </div>
    </div>
  )
}
