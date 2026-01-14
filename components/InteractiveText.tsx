'use client'

import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Volume2 } from 'lucide-react';
import { cleanWord, vocabularyMap } from '@/lib/textProcessing';
import { getWordMeaning, getCachedWordMeaning, populateWordCache } from '@/lib/translationService';

interface WordTooltipProps {
  word: string;
  originalWord: string;
  rect: DOMRect;
  onClose: () => void;
  cachedMeanings?: Map<string, string>;
}

function WordTooltip({ word, originalWord, rect, onClose, cachedMeanings }: WordTooltipProps) {
  const [meaning, setMeaning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const cleanedWord = cleanWord(word).toLowerCase();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(originalWord);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Check static vocabulary first
    const staticMeaning = vocabularyMap[cleanedWord];
    if (staticMeaning) {
      setMeaning(staticMeaning);
      return;
    }

    // Check cached meanings from parent
    if (cachedMeanings?.has(cleanedWord)) {
      setMeaning(cachedMeanings.get(cleanedWord) || null);
      return;
    }

    // Check translation service cache
    const cached = getCachedWordMeaning(cleanedWord);
    if (cached) {
      setMeaning(cached);
      return;
    }

    // Fetch from API
    setIsLoading(true);
    getWordMeaning(cleanedWord)
      .then((result) => {
        setMeaning(result);
      })
      .catch(() => {
        setMeaning(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [cleanedWord, cachedMeanings]);

  // Calculate position - tooltip appears below the word
  const tooltipStyle = {
    position: 'absolute' as const,
    left: rect.left + window.scrollX,
    top: rect.bottom + window.scrollY + 8,
    zIndex: 9999,
  };

  return createPortal(
    <>
      {/* Backdrop to close on click outside */}
      <div 
        className="fixed inset-0" 
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        style={tooltipStyle}
        className="bg-white dark:bg-gray-800 rounded-xl p-3 min-w-[180px] max-w-[260px] shadow-2xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-1.5 right-1.5 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 pr-5">
            <p className="font-semibold text-base text-gray-900 dark:text-white">{originalWord}</p>
            <button 
              onClick={handleSpeak}
              className="p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 transition-colors"
              title="Listen"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-1.5 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 mb-0.5">Bengali Meaning</p>
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : meaning ? (
              <p className="font-semibold text-indigo-600 text-sm">{meaning}</p>
            ) : (
              <p className="text-gray-400 italic text-sm">Translation not available</p>
            )}
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
}

interface InteractiveTextProps {
  text: string;
  translation?: string;
  wordMeanings?: Map<string, string>;
  isTranslationLoading?: boolean;
  fontSize?: number;
}

export function InteractiveText({ 
  text, 
  translation, 
  wordMeanings,
  isTranslationLoading,
  fontSize = 18 
}: InteractiveTextProps) {
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    rect: DOMRect;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Populate cache when wordMeanings changes
  useEffect(() => {
    if (wordMeanings) {
      populateWordCache(wordMeanings);
    }
  }, [wordMeanings]);

  const handleWordClick = useCallback((word: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    setSelectedWord({ word, rect });
  }, []);

  const words = text.split(/\s+/);

  // Check if word has a translation available
  const hasTranslation = useCallback((word: string) => {
    const cleanedWord = cleanWord(word).toLowerCase();
    return vocabularyMap[cleanedWord] || wordMeanings?.has(cleanedWord) || getCachedWordMeaning(cleanedWord);
  }, [wordMeanings]);

  return (
    <div className="space-y-3">
      <div 
        className="leading-relaxed transition-all duration-300"
        style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
      >
        {words.map((word, index) => {
          const hasWordTranslation = hasTranslation(word);

          return (
            <span key={index}>
              <span
                onClick={(e) => handleWordClick(word, e)}
                className={`cursor-pointer transition-colors px-[1px] rounded ${
                  hasWordTranslation
                    ? 'word-highlight text-primary font-medium hover:bg-primary/10'
                    : 'hover:text-primary/70'
                } ${selectedWord?.word === word ? 'bg-primary/20' : ''}`}
              >
                {word}
              </span>
              {index < words.length - 1 && ' '}
            </span>
          );
        })}
      </div>

      {isTranslationLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Translating...</span>
        </div>
      ) : translation ? (
        <div 
          className="text-muted-foreground border-l-2 border-primary/30 pl-3 italic transition-all duration-300"
          style={{ fontSize: `${Math.max(14, fontSize * 0.9)}px` }}
        >
          {translation}
        </div>
      ) : null}

      {/* Tooltip rendered via portal */}
      {mounted && selectedWord && (
        <AnimatePresence>
          <WordTooltip
            word={selectedWord.word}
            originalWord={selectedWord.word}
            rect={selectedWord.rect}
            onClose={() => setSelectedWord(null)}
            cachedMeanings={wordMeanings}
          />
        </AnimatePresence>
      )}
    </div>
  );
}
