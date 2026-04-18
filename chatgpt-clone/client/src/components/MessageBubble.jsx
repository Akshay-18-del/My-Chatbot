import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MessageBubble({ role, content, isStreaming }) {
  const isUser   = role === 'user';
  const isSystem = role === 'system';

  if (isSystem) return null; // hide system prompts

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      layout
      className={`px-4 py-6 w-full group transition-colors ${
        isUser 
          ? 'bg-transparent' 
          : 'glass-panel rounded-2xl mx-auto my-2 border border-white/5 shadow-xl w-full'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4 md:gap-6 text-base md:text-lg relative">
        {/* Avatar */}
        <div className="flex-shrink-0 flex flex-col relative items-start md:items-end">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg
            ${isUser ? 'bg-white/10 ring-1 ring-white/20' : 'bg-gradient-to-br from-blue-500 to-purple-600 ring-1 ring-purple-400/30 shadow-purple-500/20'}`}>
            {isUser ? <User size={22} className="text-white/80" /> : <Bot size={22} />}
          </div>
        </div>

        {/* Content */}
        <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 break-words text-white/90">
          <div className="flex flex-grow flex-col gap-3 min-h-[20px] mt-1">
            {isUser ? (
              <div className="whitespace-pre-wrap font-medium">{content}</div>
            ) : (
              <ReactMarkdown
                className={`prose prose-invert max-w-none ${isStreaming ? 'cursor-blink' : ''}`}
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="relative group mt-4 mb-4">
                        <div className="text-xs text-white/50 bg-black/40 px-4 py-2 border border-white/5 border-b-0 rounded-t-xl font-mono flex justify-between backdrop-blur-md">
                          <span>{match[1]}</span>
                        </div>
                        <SyntaxHighlighter
                          {...props}
                          children={String(children).replace(/\n$/, '')}
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="!mt-0 !rounded-t-none !rounded-b-xl !bg-black/40 !border !border-white/5 shadow-2xl"
                        />
                      </div>
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
