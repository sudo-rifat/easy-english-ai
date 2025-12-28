'use client'

import { useState, useEffect } from 'react'
import { marked } from 'marked'
import ThemeSelector, { Theme } from './ThemeSelector'
import ResultDisplay from './ResultDisplay'

export default function ResponseFormatter() {
  const [inputText, setInputText] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<Theme>('modern-blue')
  const [previewHtml, setPreviewHtml] = useState('')

  useEffect(() => {
    const convert = async () => {
      try {
        // Try to parse as JSON first (for Advanced Mode)
        // If it parses successfully as our schema, we pass the raw JSON string
        // ResultDisplay will handle the rendering via AnalysisCard
        const jsonData = JSON.parse(inputText.trim())
        
        if (jsonData.sentences && Array.isArray(jsonData.sentences)) {
          setPreviewHtml(inputText.trim())
          return
        }
      } catch (e) {
        // Not JSON, continue to Markdown parsing
      }

      // Fallback: Markdown Parsing
      const html = await marked.parse(inputText)
      setPreviewHtml(html)
    }
    convert()
  }, [inputText])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Area */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Paste your AI response here (Markdown or Plain Text)
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-[500px] p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm shadow-inner"
            placeholder="Paste the response from Gemini, ChatGPT, or Groq here..."
          />
        </div>

        {/* Preview Area */}
        <div className="space-y-4 flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Live Preview</span>
            <ThemeSelector 
              selectedTheme={selectedTheme} 
              onThemeChange={setSelectedTheme} 
            />
          </div>
          
          <div className="flex-1 h-[500px]">
            {inputText ? (
              <ResultDisplay html={previewHtml} theme={selectedTheme} />
            ) : (
              <div className="h-full border rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 italic text-sm">
                Preview will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
