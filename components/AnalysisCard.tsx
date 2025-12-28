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
    <div className="result-card p-6 rounded-2xl border border-gray-100 shadow-sm bg-white hover:border-blue-200 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
          {index.toString().padStart(2, '0')}
        </span>
        <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Analysis</span>
      </div>

      {/* English Sentence */}
      <div className="mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed font-serif">
          {sentence.english}
        </h3>
      </div>

      {/* Grid Layout for Vocab & Translation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Vocabulary Column */}
        <div className="bg-gray-50 rounded-xl p-4 h-full">
          <h4 className="flex items-center gap-2 font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
            <span>📖</span> Vocabulary
          </h4>
          <div className="space-y-2">
            {sentence.vocab.map((v, i) => (
              <div key={i} className="flex justify-between items-start border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                <span className="font-semibold text-gray-800 text-sm md:text-base">{v.word}</span>
                <span className="text-gray-600 text-sm italic text-right ml-4">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Translation Column */}
        <div className="space-y-4 h-full flex flex-col">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex-1">
            <h4 className="font-bold text-blue-800 text-xs uppercase mb-2">Literal (আক্ষরিক)</h4>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              {sentence.literal_translation}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex-1">
            <h4 className="font-bold text-green-800 text-xs uppercase mb-2">Fluent (সাবলীল)</h4>
            <p className="text-gray-800 font-medium text-base md:text-lg leading-relaxed">
              {sentence.fluent_translation}
            </p>
          </div>
        </div>
        
      </div>
    </div>
  )
}
