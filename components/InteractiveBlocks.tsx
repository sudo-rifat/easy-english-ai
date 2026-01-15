'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Sparkles } from 'lucide-react';
import { AnalyzedSentence } from '@/lib/ai/analyzer';

interface InteractiveBlocksProps {
  data: AnalyzedSentence[];
}

export function InteractiveBlocks({ data }: InteractiveBlocksProps) {
  const [activeChunk, setActiveChunk] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(0.9);

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = playbackRate;
    window.speechSynthesis.speak(utterance);
  };

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800';
      case 'red': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-800';
      case 'green': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* TTS Speed Control */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-300 shadow-md">
           <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Speed</span>
           <input 
            type="range" 
            min="0.5" 
            max="1.5" 
            step="0.1" 
            value={playbackRate} 
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            className="w-24 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-sm font-mono font-bold text-primary w-10 text-right">
            {playbackRate.toFixed(1)}x
          </span>
        </div>
      </div>

      {data.map((sentence, sIdx) => (
        <motion.div
          key={sIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sIdx * 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"
        >
          {/* Main Sentence Blocks */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            {sentence.chunks.map((chunk, cIdx) => {
              const uniqueId = `${sIdx}-${cIdx}`;
              const isActive = activeChunk === uniqueId;

              return (
                <motion.button
                  key={cIdx}
                  onClick={() => {
                    setActiveChunk(uniqueId);
                    speakText(chunk.text);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative group px-4 py-2.5 rounded-2xl border-2 transition-all duration-200 text-left ${
                    getColorClass(chunk.color)
                  } ${isActive ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' : ''}`}
                >
                  {/* English Text */}
                  <div className="font-semibold text-lg">{chunk.text}</div>
                  
                  {/* Bengali Meaning (Always visible or toggle? Design says next to it or smaller. Making it smaller below) */}
                  <div className="text-sm opacity-80 mt-0.5 font-medium">{chunk.meaning}</div>

                  {/* Grammar Tag (Floating Badge) */}
                  {chunk.grammar && (
                    <span className="absolute -top-3 right-2 px-1.5 py-0.5 bg-white dark:bg-gray-800 text-[10px] uppercase tracking-wide font-bold rounded shadow-sm border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {chunk.grammar}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Full Translation Section */}
          <div className="flex items-start gap-3 pl-2 border-l-4 border-primary/20">
            <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-gray-600 dark:text-gray-300 italic text-lg leading-relaxed font-bangla">
                {sentence.translation}
              </p>
            </div>
            <button
              onClick={() => speakText(sentence.original)}
              className="ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-primary"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
