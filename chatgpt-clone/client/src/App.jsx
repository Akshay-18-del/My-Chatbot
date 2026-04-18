import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useChat } from './hooks/useChat';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import Scene from './components/Scene';
import TouchEffect from './components/TouchEffect';

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const {
    conversations,
    activeConvId,
    activeMessages,
    isStreaming,
    sendMessage,
    newChat,
    selectConv,
    deleteConv,
  } = useChat();

  return (
    <>
      <TouchEffect />
      {/* 3D Background */}
      <Scene />

      {/* Foreground UI container */}
      <div className="flex h-screen text-white font-sans overflow-hidden relative z-10 selection:bg-blue-500/30">
        {/* Sidebar component now handles its own glass styling */}
        <Sidebar
          conversations={conversations}
          activeConvId={activeConvId}
          onSelectConv={selectConv}
          onDeleteConv={deleteConv}
          onNewChat={newChat}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
          {/* Mobile Header (Glass) */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-xl border-b border-white/10 z-20">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 -ml-1 text-white/70 hover:text-white transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="font-semibold tracking-wide text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Gemini</div>
            <div className="w-6" /> {/* spacer for center alignment */}
          </div>

          {/* Chat Area */}
          <div className="flex-1 relative flex flex-col h-full w-full overflow-hidden">
            <ChatWindow
              messages={activeMessages}
              isStreaming={isStreaming}
            />

            {/* Input Region */}
            <InputBar
              onSend={sendMessage}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>
    </>
  );
}
