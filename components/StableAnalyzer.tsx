'use client'

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Download, Loader2, Trash2, Languages, X, ChevronDown, Check } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { ImageEditor } from './ImageEditor';
import { InteractiveText } from './InteractiveText';
import { splitIntoLines, cleanOCRText } from '@/lib/textProcessing';
import { 
  translateSentences, 
  fetchWordMeanings, 
  extractUniqueWords 
} from '@/lib/translationService';
import { translateWithAI } from '@/lib/ai/aiTranslation';
import { storage } from '@/lib/storage';

type TranslationProvider = 'google' | 'gemini' | 'groq' | 'together' | 'openai' | 'huggingface';

const PROVIDER_OPTIONS: { id: TranslationProvider; name: string; description: string; requiresKey: boolean }[] = [
  { id: 'google', name: 'Google Translate', description: 'Free, fast translation', requiresKey: false },
  { id: 'gemini', name: 'Google Gemini', description: 'Gemini 2.0 Flash', requiresKey: true },
  { id: 'groq', name: 'Groq Llama 3.1', description: 'Fast AI inference', requiresKey: true },
  { id: 'together', name: 'Together AI', description: 'Open source models', requiresKey: true },
  { id: 'openai', name: 'OpenAI GPT', description: 'GPT-4 powered', requiresKey: true },
  { id: 'huggingface', name: 'Hugging Face', description: 'Community models', requiresKey: true },
];

interface LineData {
  text: string;
  translation?: string;
}

export default function StableAnalyzer() {
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [extractedLines, setExtractedLines] = useState<LineData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [wordMeanings, setWordMeanings] = useState<Map<string, string>>(new Map());
  
  // AI Provider States
  const [translationProvider, setTranslationProvider] = useState<TranslationProvider>('google');
  const [apiKey, setApiKey] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // User Feedback States
  const [fontSize, setFontSize] = useState(20);
  const [binarizedImage, setBinarizedImage] = useState<string | null>(null);
  const [showBinarizedPreview, setShowBinarizedPreview] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load saved provider and API key
    const savedProvider = storage.getSavedProvider();
    if (savedProvider && ['google', 'gemini', 'groq'].includes(savedProvider)) {
      setTranslationProvider(savedProvider as TranslationProvider);
      const savedKey = storage.getProviderKey(savedProvider);
      if (savedKey) setApiKey(savedKey);
    }
  }, []);

  // Update API key when provider changes
  useEffect(() => {
    if (translationProvider !== 'google') {
      const savedKey = storage.getProviderKey(translationProvider);
      if (savedKey) setApiKey(savedKey);
      else setApiKey('');
    }
  }, [translationProvider]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setShowImageEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async (processedImage: string) => {
    setShowImageEditor(false);
    setIsProcessing(true);
    setOcrProgress(0);
    setBinarizedImage(processedImage);

    try {
      const result = await Tesseract.recognize(processedImage, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const cleanedText = cleanOCRText(result.data.text);
      setInputText(cleanedText);
      await processText(cleanedText);
    } catch (error) {
      console.error('OCR Error:', error);
    } finally {
      setIsProcessing(false);
      setSelectedImage(null);
    }
  };

  const processText = async (text: string) => {
    const lines = splitIntoLines(text);
    
    // Initialize lines without translations
    setExtractedLines(lines.map(line => ({ text: line })));
    
    // Start translation process
    setIsTranslating(true);
    
    try {
      if (translationProvider === 'google') {
        // Use Google Translate
        const sentences = lines.filter(line => line.trim().length > 0);
        const [sentenceTranslations, meanings] = await Promise.all([
          translateSentences(sentences, 5, 100),
          fetchWordMeanings(extractUniqueWords(text), 10, 150),
        ]);
        
        setExtractedLines(lines.map(line => ({
          text: line,
          translation: sentenceTranslations.get(line) || undefined,
        })));
        setWordMeanings(meanings);
      } else {
        // Use AI for line-by-line translation, Google for word meanings
        if (!apiKey) {
          throw new Error('API key required - please enter your API key above');
        }
        
        // Save the key for future use
        storage.saveProviderKey(translationProvider, apiKey);
        
        // Get AI translations for lines AND Google translations for word meanings in parallel
        const [aiResult, googleMeanings] = await Promise.all([
          translateWithAI(text, translationProvider, apiKey),
          fetchWordMeanings(extractUniqueWords(text), 10, 150), // Always Google for word meanings
        ]);
        
        // Update lines with AI translations
        setExtractedLines(lines.map(line => ({
          text: line,
          translation: aiResult.lines.get(line) || undefined,
        })));
        
        // Use Google Translate for word meanings (more reliable)
        setWordMeanings(googleMeanings);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTextSubmit = async () => {
    if (inputText.trim()) {
      await processText(inputText);
    }
  };

  const handleClear = () => {
    setInputText('');
    setExtractedLines([]);
    setWordMeanings(new Map());
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('text-analysis-content');
    if (element) {
      const opt = {
        margin: 0.5,
        filename: 'english-analysis.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Input Section */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-2 gradient-text">
          Input Text or Upload Image
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          টেক্সট লিখুন অথবা ছবি আপলোড করুন
        </p>

        {/* Translation Provider Selection - Modern Dropdown */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Translation Engine:</span>
            
            {/* Custom Dropdown */}
            <div className="relative flex-1 max-w-xs">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    PROVIDER_OPTIONS.find(p => p.id === translationProvider)?.requiresKey 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                      : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {PROVIDER_OPTIONS.find(p => p.id === translationProvider)?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {PROVIDER_OPTIONS.find(p => p.id === translationProvider)?.description}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden"
                  >
                    {PROVIDER_OPTIONS.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => {
                          setTranslationProvider(provider.id);
                          setShowDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 transition-colors ${
                          translationProvider === provider.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          provider.requiresKey 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                            : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{provider.name}</p>
                          <p className="text-xs text-gray-500">{provider.description}</p>
                        </div>
                        {translationProvider === provider.id && (
                          <Check className="w-4 h-4 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* API Key Input (for AI providers) */}
          {PROVIDER_OPTIONS.find(p => p.id === translationProvider)?.requiresKey && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter ${PROVIDER_OPTIONS.find(p => p.id === translationProvider)?.name} API Key...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm"
              />
              {apiKey && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
          )}
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type English text here... / এখানে ইংরেজি টেক্সট পেস্ট করুন বা লিখুন..."
          className="glass-input w-full h-40 resize-none mb-6 text-lg"
        />

        <div className="flex flex-wrap gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 font-medium transition-all shadow-sm"
          >
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <span className="text-gray-700">Upload Image</span>
          </button>

          <button
            onClick={handleTextSubmit}
            disabled={!inputText.trim() || isTranslating || (translationProvider !== 'google' && !apiKey)}
            className="gradient-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-5 h-5" />
                Analyze & Translate
              </>
            )}
          </button>

          {(inputText || extractedLines.length > 0) && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors border border-red-100"
            >
              <Trash2 className="w-5 h-5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="glass-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-full">
               <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-700">Scanning image...</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${ocrProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">{ocrProgress}% complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {extractedLines.length > 0 && (
        <div className="glass-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-100 pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold gradient-text">Analysis Results</h2>
              <p className="text-sm text-gray-500 mt-1">
                Click on words to see meanings / হাইলাইট করা শব্দে ক্লিক করুন
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
               {binarizedImage && (
                <button
                  onClick={() => setShowBinarizedPreview(true)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  View Image
                </button>
              )}

              <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-white/60">
                <span className="text-xs font-medium text-gray-500">Size</span>
                <input 
                  type="range" 
                  min="14" 
                  max="32" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-20 md:w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 font-medium transition-colors text-sm ml-auto md:ml-0"
              >
                <Download className="w-4 h-4 text-gray-600" />
                Export PDF
              </button>
            </div>
          </div>

          <div id="text-analysis-content" className="space-y-6">
            {extractedLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-2xl bg-white/40 border border-white/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-visible"
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold font-mono border border-indigo-100 mt-1">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <InteractiveText 
                      text={line.text} 
                      translation={line.translation}
                      wordMeanings={wordMeanings}
                      isTranslationLoading={isTranslating && !line.translation}
                      fontSize={fontSize}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Image Editor Modal - Rendered via Portal */}
      {mounted && selectedImage && createPortal(
        <ImageEditor
          isOpen={showImageEditor}
          imageUrl={selectedImage}
          onClose={() => {
            setShowImageEditor(false);
            setSelectedImage(null);
          }}
          onScan={handleScan}
        />,
        document.body
      )}

      {/* Binarized Image Preview Modal - Rendered via Portal for safety */}
      {mounted && showBinarizedPreview && binarizedImage && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowBinarizedPreview(false)}>
          <div className="bg-white rounded-2xl p-4 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Processed Image (for OCR)</h3>
              <button 
                onClick={() => setShowBinarizedPreview(false)}
                className="p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 rounded-xl border border-gray-100 p-2 flex items-center justify-center">
              <img src={binarizedImage} alt="Processed" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </motion.div>
  );
}
