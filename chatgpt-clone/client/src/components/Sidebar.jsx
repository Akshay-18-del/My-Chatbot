import React from 'react';
import { MessageSquare, Plus, Trash2, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({
  conversations,
  activeConvId,
  onSelectConv,
  onDeleteConv,
  onNewChat,
  isSidebarOpen,
  setSidebarOpen
}) {
  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div 
        layout
        className={`
          fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r-0 border-white/5 flex flex-col md:relative md:translate-x-0
          transition-transform duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-3 px-3 py-3 text-sm font-semibold tracking-wide bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all border border-white/10"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-xs text-white/40 text-center mt-6 px-4">
              Your conversations will appear here.
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map((c) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={c.id}
                  onClick={() => {
                    onSelectConv(c.id);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`
                    group relative flex items-center gap-3 px-3 py-3 text-sm rounded-xl cursor-pointer transition-colors
                    ${c.id === activeConvId ? 'conv-active text-white shadow-inner bg-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <MessageSquare size={16} className={c.id === activeConvId ? "text-purple-400" : ""} />
                  <div className="truncate flex-1 font-medium">{c.title}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConv(c.id);
                    }}
                    className="absolute right-2 p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                    title="Delete Chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 px-3 py-3 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white rounded-xl transition-colors border border-transparent hover:border-white/10"
          >
            <Github size={18} />
            <span>GitHub</span>
          </a>
        </div>
      </motion.div>
    </>
  );
}
