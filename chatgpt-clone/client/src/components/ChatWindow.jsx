import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatWindow({ messages, isStreaming }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom nicely
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 overflow-y-auto pb-48 pt-6" ref={scrollRef}>
      {messages.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="h-full flex flex-col items-center justify-center text-center p-8 z-10 relative"
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 glass-panel rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-purple-500/20 ring-1 ring-white/10"
          >
             <Bot size={40} className="text-white/80" />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            How can I help you today?
          </h2>
          <p className="text-white/50 max-w-md text-lg leading-relaxed font-medium">
            Type a message below to start exploring ideas with Google Gemini.
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-2 relative z-10 w-[95%] max-w-4xl mx-auto overflow-hidden">
          {messages.map((msg, idx) => {
            const isLastMsg = idx === messages.length - 1;
            const streamingThisMsg = isLastMsg && isStreaming && (msg.role === 'assistant' || msg.role === 'model');

            return (
              <MessageBubble
                key={idx}
                role={msg.role}
                content={msg.content}
                isStreaming={streamingThisMsg}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
