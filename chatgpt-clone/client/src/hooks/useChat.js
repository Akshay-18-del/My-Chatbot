import { useState, useCallback, useEffect, useRef } from 'react';

/** Unique ID without external deps */
function uid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

const SYSTEM_MESSAGE = {
  role: 'system',
  content:
    'You are a helpful, accurate, and thoughtful AI assistant. ' +
    'Format your responses with Markdown when appropriate — use code blocks with language tags, ' +
    'numbered lists, headers, and tables where they help clarity.',
};

/**
 * useChat — manages conversation state and streams responses from the backend.
 */
export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId,  setActiveConvId]  = useState(null);
  const [isStreaming,   setIsStreaming]   = useState(false);
  const initialized = useRef(false);

  /* ── Initialize ────────────────────────────────── */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        const convs = data.map(c => ({ ...c, messages: [] }));
        setConversations(convs);
        if (convs.length > 0) {
          selectConv(convs[0].id);
        }
      })
      .catch(err => console.error('Failed to fetch conversations:', err));
  }, []);

  /* ── helpers ───────────────────────────────────── */
  const activeMessages = conversations.find(c => c.id === activeConvId)?.messages ?? [];

  const createConvOnBackend = (id, title) => {
    fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title }),
    }).catch(err => console.error('Failed to sync conv to backend', err));
  };

  /** Ensure a conversation exists and return its id */
  const ensureConv = useCallback((firstUserContent) => {
    if (activeConvId) return activeConvId;

    const id    = uid();
    const title = firstUserContent.slice(0, 52) + (firstUserContent.length > 52 ? '…' : '');
    const newConv = { id, title, messages: [], createdAt: new Date() };
    
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(id);
    createConvOnBackend(id, title);
    return id;
  }, [activeConvId]);

  /** Append or mutate the last message of a specific conversation */
  const patchLastMsg = useCallback((convId, patcher) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      const msgs = [...c.messages];
      msgs[msgs.length - 1] = patcher(msgs[msgs.length - 1]);
      return { ...c, messages: msgs };
    }));
  }, []);

  /* ── public API  ───────────────────────────────── */
  const newChat = useCallback(() => {
    const id    = uid();
    const conv  = { id, title: 'New Chat', messages: [], createdAt: new Date() };
    setConversations(prev => [conv, ...prev]);
    setActiveConvId(id);
    createConvOnBackend(id, 'New Chat');
  }, []);

  const selectConv = useCallback((id) => {
    setActiveConvId(id);
    
    // Fetch messages for this conversation if not already loaded into state
    fetch(`/api/conversations/${id}/messages`)
      .then(res => res.json())
      .then(msgs => {
        setConversations(prev => prev.map(c => 
          c.id === id ? { ...c, messages: msgs } : c
        ));
      })
      .catch(err => console.error('Failed to fetch msgs for conv', id, err));
  }, []);

  const deleteConv = useCallback((id) => {
    fetch(`/api/conversations/${id}`, { method: 'DELETE' })
      .catch(err => console.error('Failed to delete conv', id, err));

    setConversations(prev => {
      const next = prev.filter(c => c.id !== id);
      if (id === activeConvId) {
        setActiveConvId(next[0]?.id ?? null);
      }
      return next;
    });
  }, [activeConvId]);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isStreaming) return;

    const convId      = ensureConv(content);
    const userMsg     = { role: 'user',      content };
    const assistantMsg = { role: 'assistant', content: '' };

    setConversations(prev => {
      let prevConvs = [...prev];
      const targetConv = prevConvs.find(c => c.id === convId);
      
      let finalTitle = targetConv?.title || 'New Chat';
      // Dynamically rename "New Chat" on first message
      if (targetConv && targetConv.title === 'New Chat' && targetConv.messages.length === 0) {
        finalTitle = content.slice(0, 52) + (content.length > 52 ? '…' : '');
        createConvOnBackend(convId, finalTitle);
      }

      return prevConvs.map(c =>
        c.id !== convId ? c : {
          ...c,
          title: finalTitle,
          messages: [...c.messages, userMsg, assistantMsg],
        }
      );
    });

    const targetConv = conversations.find(c => c.id === convId);
    const prevMessages = targetConv?.messages ?? [];

    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          convId,
          messages: [SYSTEM_MESSAGE, ...prevMessages, userMsg],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw);

            if (event.type === 'delta') {
              patchLastMsg(convId, msg => ({
                ...msg,
                content: msg.content + event.content,
              }));
            } else if (event.type === 'error') {
              patchLastMsg(convId, msg => ({
                ...msg,
                content: `❌ **Error:** ${event.message}`,
              }));
            }
          } catch { /* Malformed JSON — ignore */ }
        }
      }
    } catch (err) {
      console.error('[useChat] stream error:', err);
      patchLastMsg(convId, msg => ({
        ...msg,
        content: `❌ **Connection error:** ${err.message}\n\nMake sure the backend server is running on port 3001.`,
      }));
    } finally {
      setIsStreaming(false);
    }
  }, [conversations, isStreaming, ensureConv, patchLastMsg, activeConvId]);

  return {
    conversations,
    activeConvId,
    activeMessages,
    isStreaming,
    sendMessage,
    newChat,
    selectConv,
    deleteConv,
  };
}
