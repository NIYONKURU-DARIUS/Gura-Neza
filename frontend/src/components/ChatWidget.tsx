import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, ShieldCheck, Loader2 } from 'lucide-react';
import { useStore } from '../context/store';
import { chatService, type ChatMessage } from '../services/chatService';
import api from '../services/api';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Pull stable primitives only — avoids reconnect loop when walletBalance changes
  const user = useStore(s => s.user);
  const token = useStore(s => s.token);
  const setUser = useStore(s => s.setUser);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep a ref to user so wallet subscription closure stays fresh
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const loadHistory = useCallback(async () => {
    try {
      const history = await chatService.getHistory();
      setMessages(history);
    } catch {
      // silently ignore — REST fallback may not be available
    }
  }, []);

  // Connect / disconnect when chat opens
  useEffect(() => {
    if (!isOpen || !token || !user) return;

    setIsLoading(true);
    loadHistory().finally(() => setIsLoading(false));

    // Poll every 4 s as fallback when WebSocket is unavailable
    pollRef.current = setInterval(loadHistory, 4000);

    chatService.connect(token, (newMsg) => {
      setMessages(prev => {
        const exists = prev.some(
          m => (m.id && m.id === newMsg.id) ||
               (m.sentAt === newMsg.sentAt && m.content === newMsg.content)
        );
        if (exists) return prev;
        // Count unread admin messages when chat is closed
        if (!isOpen && newMsg.senderRole === 'ADMIN') {
          setUnreadCount(c => c + 1);
        }
        return [...prev, newMsg];
      });
    }).then(() => {
      const uid = userRef.current?.id?.toString();
      if (uid) {
        chatService.subscribeToUser(uid);
        chatService.subscribeToWallet(uid, (newBalance) => {
          const current = userRef.current;
          if (current) setUser({ ...current, walletBalance: newBalance });
        });
      }
    });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      chatService.disconnect();
    };
    // intentionally omit `user` — we use userRef to avoid reconnect on wallet update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, token]);

  // Clear unread when opening
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const content = inputText.trim();
    if (!content || isSending) return;
    setInputText('');
    setIsSending(true);
    setSendError('');
    try {
      const response = await api.post('/chat/send', { content });
      const sent: ChatMessage = response.data;
      setMessages(prev => {
        const exists = prev.some(m => m.id === sent.id);
        return exists ? prev : [...prev, sent];
      });
    } catch (err: any) {
      setInputText(content); // restore on failure
      const msg = err.response?.data?.message || err.message || 'Failed to send message';
      setSendError(msg);
      // Clear error after 4s
      setTimeout(() => setSendError(''), 4000);
    } finally {
      setIsSending(false);
    }
  };

  if (!user || user.role === 'ADMIN') return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[200] font-body relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            style={{ transformOrigin: 'bottom right' }}
            className={`
              absolute bottom-[calc(100%+12px)] right-0
              w-[min(420px,calc(100vw-2rem))]
              h-[min(580px,calc(100vh-100px))]
              bg-[var(--card-bg)] rounded-[2rem]
              shadow-[0_20px_60px_rgba(0,0,0,0.2)]
              border border-[var(--border-c)]
              flex flex-col overflow-hidden
            `}
          >
            {/* Header */}
            <div className="relative p-5 sm:p-6 bg-gradient-to-br from-primary to-[#1B5E20] text-white overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/10">
                    <ShieldCheck size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black italic text-base tracking-tighter uppercase leading-none">
                      Gura Support
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[var(--bg-main)]">
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
              >
                {isLoading && messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                    <Loader2 size={28} className="animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Loading...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-4">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                      <MessageSquare size={28} className="text-primary/30" />
                    </div>
                    <div>
                      <h4 className="text-base font-black italic text-[var(--text-p)] mb-1">
                        Hi, {user.name.split(' ')[0]}!
                      </h4>
                      <p className="text-xs font-bold text-[var(--text-s)] leading-relaxed">
                        How can we help you today?
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.senderRole === 'ADMIN' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs font-bold leading-relaxed ${
                          msg.senderRole === 'ADMIN'
                            ? 'bg-[var(--card-bg)] text-[var(--text-p)] border border-[var(--border-c)] rounded-tl-sm'
                            : 'bg-primary text-white rounded-tr-sm shadow-md shadow-primary/20'
                        }`}
                      >
                        {msg.content}
                        <div className={`text-[8px] mt-1 opacity-40 font-black ${
                          msg.senderRole === 'ADMIN' ? 'text-left' : 'text-right'
                        }`}>
                          {new Date(msg.sentAt).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 bg-[var(--card-bg)] border-t border-[var(--border-c)] flex-shrink-0">
              {sendError && (
                <div className="mb-2 px-3 py-2 bg-red/10 border border-red/20 rounded-xl text-[10px] font-black text-red uppercase tracking-tight">
                  {sendError}
                </div>
              )}
              <div className="flex gap-2 items-center bg-[var(--bg-main)] rounded-2xl border border-[var(--border-c)] px-3 py-2 focus-within:border-primary transition-colors">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1 bg-transparent py-2 text-xs font-bold outline-none text-[var(--text-p)] placeholder:text-[var(--text-s)]"
                  disabled={isSending}
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !inputText.trim()}
                  className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                >
                  {isSending
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send size={16} />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB toggle button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(prev => !prev)}
        className="w-14 h-14 sm:w-16 sm:h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={22} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge — only shown when there are real unread messages */}
        {unreadCount > 0 && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg-main)]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
