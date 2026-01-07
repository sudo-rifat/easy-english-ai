'use client'

import { useState, useEffect, useRef } from 'react'
import { storage } from '@/lib/storage'
import ThemeSelector, { Theme } from './ThemeSelector'
import { parseStableResponse } from '@/lib/ai/stable'
import Tesseract from 'tesseract.js'
import Cropper, { ReactCropperElement } from 'react-cropper'
import 'cropperjs/dist/cropper.css'

interface StableAnalyzerProps {
  initialPassage?: string
}

export default function StableAnalyzer({ initialPassage = '' }: StableAnalyzerProps) {
  const [passage, setPassage] = useState(initialPassage)
  const [aiProvider, setAiProvider] = useState('google-translate')
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [debugImageUrl, setDebugImageUrl] = useState<string | null>(null)
  
  // Cropper states
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [lastAppliedImage, setLastAppliedImage] = useState<string | null>(null) // Committed snapshot for Scan
  const cropperRef = useRef<ReactCropperElement>(null)

  const [result, setResult] = useState<{ lines: { en: string; bn: string }[]; vocab: Record<string, string> } | null>(null)
  const [tooltip, setTooltip] = useState<{ word: string; meaning: string; x: number; y: number; showAbove: boolean } | null>(null)
  
  // Initialize from localStorage if available, otherwise default to modern-blue
  const [selectedTheme, setSelectedTheme] = useState<Theme>('modern-blue')

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('easy-english-theme') as Theme
    if (savedTheme) {
      setSelectedTheme(savedTheme)
    }
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('easy-english-theme', selectedTheme)
  }, [selectedTheme])
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleWordClick = (word: string, e: React.MouseEvent<HTMLSpanElement>) => {
    // Clean word for dictionary lookup
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=_`~()"'“”‘’]/g, "").toLowerCase()
    const meaning = result?.vocab[cleanWord]
    
    if (meaning) {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
      
      // Get the clicked element's position
      const rect = e.currentTarget.getBoundingClientRect()
      
      // Calculate tooltip position - center horizontally, position above word
      const tooltipX = rect.left + rect.width / 2
      
      // Always position above the word, but clamp to stay in viewport
      // The tooltip will be shifted up by translateY(-100%), so we set y = rect.top - gap
      // Then clamp to minimum 80 (tooltip height) to prevent going off-screen
      const tooltipY = Math.max(80, rect.top - 10)
      
      setTooltip({
        word: cleanWord,
        meaning,
        x: tooltipX,
        y: tooltipY,
        showAbove: true // Always show above
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setPassage(text)
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err)
      // Fallback for Firefox or if permission denied - just focus
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.focus()
        document.execCommand('paste')
      }
    }
  }

  // Helper to preprocess image (Adaptive Thresholding - Bradley's Method)
  const preprocessImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject('No canvas context')
        
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const width = canvas.width
        const height = canvas.height
        
        // 1. Convert to Grayscale
        const gray = new Uint8ClampedArray(width * height)
        for (let i = 0; i < width * height; i++) {
          const r = data[i * 4]
          const g = data[i * 4 + 1]
          const b = data[i * 4 + 2]
          gray[i] = (r * 0.299 + g * 0.587 + b * 0.114)
        }

        // 2. Compute Integral Image
        const integral = new Int32Array(width * height)
        for (let x = 0; x < width; x++) {
          let sum = 0
          for (let y = 0; y < height; y++) {
            const index = y * width + x
            sum += gray[index]
            if (x === 0) integral[index] = sum
            else integral[index] = integral[index - 1] + sum
          }
        }

        // 3. Adaptive Thresholding
        const windowSize = Math.floor(width / 8) // Dynamic window size
        const s2 = Math.floor(windowSize / 2)
        const t = 0.15 // Threshold constant (15%)
        
        // Correct 2D Integral Image calculation
        const integral2 = new Int32Array(width * height)
        for (let y = 0; y < height; y++) {
          let rowSum = 0
          for (let x = 0; x < width; x++) {
            const index = y * width + x
            rowSum += gray[index]
            if (y === 0) integral2[index] = rowSum
            else integral2[index] = integral2[(y - 1) * width + x] + rowSum
          }
        }

        // Apply Threshold
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const index = y * width + x
            
            const x1 = Math.max(x - s2, 0)
            const x2 = Math.min(x + s2, width - 1)
            const y1 = Math.max(y - s2, 0)
            const y2 = Math.min(y + s2, height - 1)
            
            const count = (x2 - x1 + 1) * (y2 - y1 + 1)
            
            // Sum = I(x2,y2) - I(x2, y1-1) - I(x1-1, y2) + I(x1-1, y1-1)
            let sum = integral2[y2 * width + x2]
            if (y1 > 0) sum -= integral2[(y1 - 1) * width + x2]
            if (x1 > 0) sum -= integral2[y2 * width + (x1 - 1)]
            if (x1 > 0 && y1 > 0) sum += integral2[(y1 - 1) * width + (x1 - 1)]
            
            const value = gray[index]
            // const avg = sum / count -> unused
            
            // If pixel is T% darker than average, it's black
            const color = (value * count) < (sum * (1.0 - t)) ? 0 : 255
            
            data[index * 4] = color
            data[index * 4 + 1] = color
            data[index * 4 + 2] = color
          }
        }
        
        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('File select triggered. File:', file?.name)
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      console.log('FileReader loaded. Result length:', reader.result?.toString().length)
      setImageToCrop(reader.result as string)
      // Reset input value
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.onerror = (err) => console.error('FileReader error:', err)
    reader.readAsDataURL(file)
  }

  const handleCropAndScan = async () => {
    try {
      setIsScanning(true)
      
      // Use lastAppliedImage if user clicked Apply, otherwise use current crop
      let imageToProcess: string | null = null
      
      if (lastAppliedImage) {
        // Use the committed (Applied) image
        imageToProcess = lastAppliedImage
      } else if (cropperRef.current) {
        // No Apply was clicked, use current crop state
        const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas()
        if (croppedCanvas) {
          imageToProcess = croppedCanvas.toDataURL('image/png')
        }
      }

      if (!imageToProcess) {
        setIsScanning(false)
        return
      }

      // Convert dataURL to blob/file for preprocessor
      const response = await fetch(imageToProcess)
      const blob = await response.blob()
      const file = new File([blob], "cropped.png", { type: "image/png" })

      // Preprocess (Adaptive Thresholding)
      const processedImageUrl = await preprocessImage(file)
      setDebugImageUrl(processedImageUrl)
      setImageToCrop(null) // Close cropper
      setLastAppliedImage(null) // Reset for next session
      
      // OCR Scan
      const { data: { text } } = await Tesseract.recognize(
        processedImageUrl,
        'eng',
        { logger: m => console.log(m) }
      )
      
      const cleanText = text.replace(/\s+/g, ' ').trim()
      if (cleanText) {
        setPassage(prev => prev ? prev + '\n\n' + cleanText : cleanText)
      }
      setIsScanning(false)

    } catch (err) {
      console.error('OCR Error:', err)
      alert('Failed to extract text. Please try again.')
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            ইংরেজি প্যাসেজ
            {isScanning && <span className="text-xs text-blue-600 animate-pulse font-normal">(Scanning image... please wait)</span>}
          </label>
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-100"
              title="Upload image to extract text"
              disabled={isScanning}
            >
              📷 Upload Image
            </button>
            <button
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
              title="Paste text from clipboard"
            >
              📋 Paste
            </button>
          </div>
        </div>
        <textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          placeholder="আপনার ইংরেজি প্যাসেজ এখানে দিন (লাইন-বাই-লাইন অনুবাদের জন্য)..."
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-none text-base"
        />
        
        {/* Debug View for OCR Preprocessing */}
        {debugImageUrl && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Debug: OCR Input Image (Binarized)</span>
              <button 
                onClick={() => setDebugImageUrl(null)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Hide
              </button>
            </div>
            <img 
              src={debugImageUrl} 
              alt="Processed for OCR" 
              className="w-full max-h-60 object-contain border bg-white" 
            />
          </div>
        )}
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
              <div 
                key={idx} 
                className="sentence-container group p-5 bg-white rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-accent)] transition-all duration-300 shadow-sm"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                <div className="flex flex-wrap gap-x-1.5 gap-y-2 mb-3">
                  {(line.en || '').split(' ').filter(Boolean).map((word, wIdx) => {
                    // Clean word: Remove possessives/contractions FIRST, then punctuation
                    // This handles "milliner's." -> "milliner." -> "milliner"
                    let clean = word.replace(/'s/gi, '').replace(/n't/gi, '')
                    clean = clean.replace(/[.,/#!$%^&*;:{}=_`~()"'“”‘’?!]/g, "").toLowerCase()
                    const hasMeaning = !!result.vocab[clean]
                    const isSelected = tooltip?.word === clean
                    return (
                      <span
                        key={wIdx}
                        className="relative inline-block"
                      >
                        <span
                          onClick={(e) => handleWordClick(word, e)}
                          className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors font-medium text-xl sm:text-2xl inline-block
                            ${hasMeaning 
                              ? 'text-[var(--theme-primary)] hover:bg-[var(--theme-border)] decoration-[var(--theme-accent)] underline underline-offset-4 decoration-dashed' 
                              : 'text-[var(--theme-text)]'
                            }`}
                        >
                          {word}
                        </span>
                        {/* Tooltip directly above this word */}
                        {isSelected && tooltip && (
                          <div 
                            className="absolute z-[100] left-1/2 -translate-x-1/2 bottom-full mb-2 px-4 py-3 bg-gray-800 text-white text-sm rounded-xl shadow-2xl animate-in fade-in zoom-in-95 pointer-events-none whitespace-nowrap text-center"
                          >
                            <div className="font-bold border-b border-gray-600 mb-1.5 pb-1 text-blue-300 uppercase tracking-wider text-xs">{tooltip.word}</div>
                            <div className="text-sm font-medium">{tooltip.meaning}</div>
                            {/* Arrow pointing down to word */}
                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-gray-800 rotate-45"></div>
                          </div>
                        )}
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

      {/* Cropper Modal - Full Screen */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          {/* Cropper fills most of the screen */}
          <div className="flex-1 min-h-0 bg-gray-900">
            <Cropper
              ref={cropperRef}
              style={{ height: '100%', width: '100%' }}
              initialAspectRatio={0}
              src={imageToCrop}
              viewMode={0}
              dragMode="move"
              guides={true}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false} 
              responsive={true}
              autoCropArea={0.9}
              checkOrientation={false}
              zoomable={true}
              scalable={true}
              toggleDragModeOnDblclick={false}
            />
          </div>

          {/* Compact Bottom Toolbar */}
          <div className="flex items-center justify-between gap-2 p-2 bg-gray-900 border-t border-gray-700">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => cropperRef.current?.cropper.zoom(0.1)} className="p-2 text-white hover:bg-gray-700 rounded" title="Zoom In">➕</button>
              <button type="button" onClick={() => cropperRef.current?.cropper.zoom(-0.1)} className="p-2 text-white hover:bg-gray-700 rounded" title="Zoom Out">➖</button>
              <button type="button" onClick={() => cropperRef.current?.cropper.rotate(-90)} className="p-2 text-white hover:bg-gray-700 rounded" title="Rotate Left">↺</button>
              <button type="button" onClick={() => cropperRef.current?.cropper.rotate(90)} className="p-2 text-white hover:bg-gray-700 rounded" title="Rotate Right">↻</button>
              <button type="button" onClick={() => cropperRef.current?.cropper.reset()} className="px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded" title="Reset">Reset</button>
              
              {/* Apply Crop Button - commits the crop, then you can rotate */}
              <button 
                type="button" 
                onClick={() => {
                  const cropper = cropperRef.current?.cropper
                  if (!cropper) return
                  const croppedCanvas = cropper.getCroppedCanvas()
                  if (croppedCanvas) {
                    const dataUrl = croppedCanvas.toDataURL('image/png')
                    setImageToCrop(dataUrl) // Continue editing the cropped image
                    setLastAppliedImage(dataUrl) // Save as committed snapshot for Scan
                  }
                }}
                className="px-2 py-1 text-xs text-yellow-300 bg-yellow-900/50 hover:bg-yellow-800 rounded font-medium"
                title="Apply Crop (commits current selection, then you can rotate/edit more)"
              >
                ✂️ Apply
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setImageToCrop(null)} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg">Cancel</button>
              <button type="button" onClick={handleCropAndScan} disabled={isScanning} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg">
                {isScanning ? 'Processing...' : '✅ Scan'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Tooltip is now rendered inline with each word above */}
    </div>
  )
}
