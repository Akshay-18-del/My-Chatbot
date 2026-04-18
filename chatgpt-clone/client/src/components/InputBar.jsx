import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InputBar({ onSend, isStreaming }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (text.trim() && !isStreaming) {
      onSend(text);
      setText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  return (
    <div className="absolute bottom-0 left-0 w-full px-4 pt-12 pb-6 lg:pb-8 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pointer-events-none scale-100">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="max-w-3xl mx-auto pointer-events-auto"
      >
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end w-full p-2 glass-panel rounded-3xl shadow-2xl shadow-purple-500/10 focus-within:ring-2 focus-within:ring-purple-500/50 transition-all border border-white/10"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "Gemini is conceptualizing..." : "Message Gemini..."}
            className="w-full max-h-[200px] bg-transparent border-0 resize-none outline-none py-3 px-4 text-white placeholder-white/40 focus:ring-0 font-medium tracking-wide"
            rows="1"
            disabled={isStreaming}
            autoFocus
          />

          <motion.button
            whileHover={{ scale: text.trim() && !isStreaming ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!text.trim() || isStreaming}
            className={`mb-1 mr-1 p-3 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              isStreaming 
                ? 'bg-purple-500/20 text-purple-300 animate-pulse' 
                : text.trim() 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-white/5 text-white/30'
            }`}
            aria-label="Send message"
          >
            <ArrowUp size={20} strokeWidth={3} />
          </motion.button>
        </form>
        <div className="text-center text-[10px] font-bold tracking-[0.2em] text-white/20 mt-4 hidden md:block">
          GOOGLE GEMINI CLONE • ANTIGRAVITY AESTHETICS OVERHAUL
        </div>
      </motion.div>
    </div>
  );
}
