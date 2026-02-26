/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Send, Image as ImageIcon, Sparkles, Download, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MODEL_NAME = "gemini-2.5-flash-image";

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ prompt: string; type: 'generate' | 'edit' }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateImage = async (isEdit: boolean = false) => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const parts: any[] = [{ text: prompt }];
      
      // If editing, we need to include the current image
      if (isEdit && imageUrl) {
        const base64Data = imageUrl.split(',')[1];
        parts.unshift({
          inlineData: {
            data: base64Data,
            mimeType: "image/png"
          }
        });
      }

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const newImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          setImageUrl(newImageUrl);
          setHistory(prev => [...prev, { prompt, type: isEdit ? 'edit' : 'generate' }]);
          setPrompt('');
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        // Sometimes the model might return text instead of an image if it refuses or fails
        const textResponse = response.text;
        setError(textResponse || "Failed to generate image. Please try a different prompt.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    link.click();
  };

  const handleReset = () => {
    setImageUrl(null);
    setHistory([]);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Powered by Gemini 2.5 Flash
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Proposal Vision
          </h1>
          <p className="text-white/40 max-w-md mx-auto text-lg">
            Create and refine your perfect moment with AI-powered image generation and editing.
          </p>
        </motion.div>

        {/* Image Display Area */}
        <div className="w-full aspect-square max-w-2xl bg-white/5 rounded-3xl border border-white/10 overflow-hidden relative group shadow-2xl">
          <AnimatePresence mode="wait">
            {imageUrl ? (
              <motion.div 
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="relative w-full h-full"
              >
                <img 
                  src={imageUrl} 
                  alt="Generated proposal" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={handleDownload}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
                    title="Download Image"
                  >
                    <Download className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={handleReset}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
                    title="Start Over"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <ImageIcon className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-white/80">Your vision starts here</h3>
                <p className="text-white/40 text-sm max-w-xs">
                  Describe a proposal scene below to generate your first image.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
              <p className="text-emerald-400 font-medium animate-pulse">
                {imageUrl ? "Refining your vision..." : "Bringing your vision to life..."}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-2xl mt-8">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={imageUrl ? "Describe changes (e.g., 'Make it sunset', 'Add more flowers')" : "Describe the proposal (e.g., 'A man proposing on a beach at sunset')"}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 pr-16 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none min-h-[120px] placeholder:text-white/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  generateImage(!!imageUrl);
                }
              }}
            />
            <button
              onClick={() => generateImage(!!imageUrl)}
              disabled={isGenerating || !prompt.trim()}
              className="absolute bottom-4 right-4 p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/20 text-black transition-all shadow-lg shadow-emerald-500/20"
            >
              {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* History / Tips */}
          {!imageUrl && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => { setPrompt("A man proposing to his girl with a ring in a candlelit garden"); }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors group"
              >
                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">Try this</p>
                <p className="text-sm text-white/80 group-hover:text-white transition-colors">A man proposing to his girl with a ring in a candlelit garden</p>
              </button>
              <button 
                onClick={() => { setPrompt("Romantic proposal on a rooftop overlooking Paris at night"); }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors group"
              >
                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">Try this</p>
                <p className="text-sm text-white/80 group-hover:text-white transition-colors">Romantic proposal on a rooftop overlooking Paris at night</p>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-white/20 text-xs border-t border-white/5">
        &copy; 2026 Proposal Vision &bull; Built with Gemini 2.5 Flash Image
      </footer>
    </div>
  );
}
