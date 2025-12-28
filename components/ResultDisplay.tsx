'use client'

import { useRef } from 'react'
import { Theme } from './ThemeSelector'

interface ResultDisplayProps {
  html: string
  theme: Theme
}

import AnalysisCard from './AnalysisCard'

interface ResultDisplayProps {
  html: string
  theme: Theme
}

export default function ResultDisplay({ html, theme }: ResultDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const handleDownloadPdf = async () => {
    if (!contentRef.current) return

    const html2pdf = (await import('html2pdf.js')).default
    const element = contentRef.current
    const opt = {
      margin: [0.5, 0.5] as [number, number],
      filename: `EasyEnglish_AI_Analysis_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    }

    html2pdf().from(element).set(opt).save()
  }

  // Try to parse as JSON first
  let jsonData = null
  try {
    const parsed = JSON.parse(html)
    if (parsed.sentences && Array.isArray(parsed.sentences)) {
      jsonData = parsed
    }
  } catch (e) {
    // Not JSON, ignore
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleDownloadPdf}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2 text-sm font-medium shadow-sm"
        >
          📥 Download PDF
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto border rounded-xl bg-white shadow-inner">
        <div
          ref={contentRef}
          className={`theme-${theme} formatted-content min-h-full p-6`}
        >
          {jsonData ? (
            <div className="space-y-6">
              {jsonData.sentences.map((sentence: any, idx: number) => (
                <AnalysisCard key={idx} index={idx + 1} sentence={sentence} />
              ))}
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </div>
    </div>
  )
}
