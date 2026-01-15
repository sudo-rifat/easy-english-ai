'use client';

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

  const [error, setError] = useState<string | null>(null); // New error state

  // ... (existing effects)

  // Normalize text for matching: lower case, single spaces, remove punctuation
  const normalizeText = (text: string) => text.trim().toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, '') // Remove common punctuation
    .replace(/\s+/g, ' ');

  const processText = async (text: string) => {
    const lines = splitIntoLines(text);
    
    // Initialize lines without translations
    setExtractedLines(lines.map(line => ({ text: line })));
    setError(null); // Clear previous errors
    
    // Start translation process
    setIsTranslating(true);
    
    try {
      if (translationProvider === 'google') {
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
        if (!apiKey) {
          throw new Error('API key required - please enter your API key above');
        }
        
        storage.saveProviderKey(translationProvider, apiKey);
        
        const [aiResult, googleMeanings] = await Promise.all([
          translateWithAI(text, translationProvider, apiKey),
          fetchWordMeanings(extractUniqueWords(text), 10, 150),
        ]);
        
        // Create a normalized map for fuzzy lookup
        const normalizedMap = new Map<string, string>();
        aiResult.lines.forEach((val, key) => {
          normalizedMap.set(normalizeText(key), val);
        });

        console.log('AI Raw Lines:', Array.from(aiResult.lines.keys()));
        console.log('Normalized AI Keys:', Array.from(normalizedMap.keys()));

        // Update lines with AI translations using fuzzy matching
        setExtractedLines(lines.map(line => {
          const normLine = normalizeText(line);
          const exact = aiResult.lines.get(line);
          const fuzzy = normalizedMap.get(normLine);
          
          console.log(`Line: "${line}" -> Norm: "${normLine}" -> Match: ${!!(exact || fuzzy)}`);
          
          return {
            text: line,
            translation: exact || fuzzy || undefined,
          };
        }));
        
        setWordMeanings(googleMeanings);
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      setError(error.message || 'Translation failed');
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
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Translation Engine:</span>
            
            {/* Custom Dropdown */}
            <div className="relative flex-1 max-w-xs">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    PROVIDER_OPTIONS.find(p => p.id === translationProvider)?.requiresKey 
                      ? 'bg-gradient-to-r from-primary to-accent' 
                      : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800 text-sm group-hover:text-primary transition-colors">
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
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors ${
                          translationProvider === provider.id ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          provider.requiresKey 
                            ? 'bg-gradient-to-r from-primary to-accent' 
                            : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{provider.name}</p>
                          <p className="text-xs text-gray-500">{provider.description}</p>
                        </div>
                        {translationProvider === provider.id && (
                          <Check className="w-4 h-4 text-primary" />
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent shadow-sm"
              />
              {apiKey && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
            <div className="p-2 bg-red-100 rounded-full">
              <X className="w-4 h-4" />
            </div>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type English text here... / এখানে ইংরেজি টেক্সট পেস্ট করুন বা লিখুন..."
          className="glass-input w-full h-40 resize-none mb-6 text-lg focus:ring-primary/50 focus:border-primary/50"
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
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 font-medium transition-all shadow-sm group hover:border-primary/30"
          >
            <ImageIcon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
            <span className="text-gray-700 group-hover:text-primary transition-colors">Upload Image</span>
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
            <div className="p-3 bg-primary/10 rounded-full">
               <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-700">Scanning image...</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
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
        <div className="glass-card p-2 sm:p-6">
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
                  className="w-20 md:w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 font-medium transition-colors text-sm ml-auto md:ml-0 hover:text-primary"
              >
                <Download className="w-4 h-4 text-gray-600" />
                Export PDF
              </button>
            </div>
          </div>

          <div id="text-analysis-content" className="space-y-4 sm:space-y-6">
            {extractedLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-3 sm:p-6 rounded-2xl bg-white/40 border border-white/40 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-primary/30"
              >
                {/* Modern Folded Corner Badge */}
                <div 
                  className="absolute bottom-0 right-0 w-14 h-14 sm:w-16 sm:h-16 translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300 ease-out"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                    clipPath: 'polygon(145% 0, 100% 100%, 0 100%)',
                    boxShadow: '-4px -4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Number positioned in corner */}
                  <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-white text-[11px] sm:text-xs font-bold tracking-wide drop-shadow-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Subtle corner indicator (always visible) */}
                <div 
                  className="absolute bottom-0 right-0 w-6 h-6 opacity-30 group-hover:opacity-0 transition-opacity duration-200"
                  style={{ 
                    background: 'linear-gradient(135deg, transparent 50%, hsl(var(--primary)) 50%)',
                  }}
                />

                {/* Content - Full Width */}
                <div>
                  <InteractiveText 
                    text={line.text} 
                    translation={line.translation}
                    wordMeanings={wordMeanings}
                    isTranslationLoading={isTranslating && !line.translation}
                    fontSize={fontSize}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
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

      {/* Binarized Image Preview Modal */}
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
