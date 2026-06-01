import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, ShieldCheck, Loader2, Bell } from 'lucide-react';
import { useStore } from '../context/store';
import { chatService, type ChatMessage, parseSentAt } from '../services/chatService';
import api from '../services/api';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMsgPreview, setNewMsgPreview] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(false);

  const user = useStore(s => s.user);
  const token = useStore(s => s.token);
  const setUser = useStore(s => s.setUser);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userRef = useRef(user);
  const isOpenRef = useRef(isOpen);
  const lastMsgCountRef = useRef(0);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  // ── Persist the last-read admin message count per user in localStorage ──
  const getStorageKey = () => `gura_chat_read_${userRef.current?.id ?? 'anon'}`;

  const getLastReadCount = (): number => {
    try { return parseInt(localStorage.getItem(getStorageKey()) ?? '0', 10) || 0; }
    catch { return 0; }
  };

  const saveLastReadCount = (count: number) => {
    try { localStorage.setItem(getStorageKey(), String(count)); }
    catch { /* ignore */ }
  };

  // ── Background poll: runs always when logged in, detects new admin messages ──
  const bgPoll = useCallback(async () => {
    if (!token || !userRef.current || userRef.current.role === 'ADMIN') return;
    try {
      const history = await chatService.getHistory();
      const adminMsgs = history.filter(m => m.senderRole === 'ADMIN');
      const totalAdminCount = adminMsgs.length;
      const readCount = getLastReadCount();
      const unread = Math.max(0, totalAdminCount - readCount);

      // Update badge to reflect actual unread count
      if (!isOpenRef.current) {
        setUnreadCount(unread);
        if (unread > 0) {
          setShowPulse(true);
          // Show preview only when a genuinely new message just arrived
          if (totalAdminCount > lastMsgCountRef.current && lastMsgCountRef.current > 0) {
            const latest = adminMsgs[adminMsgs.length - 1];
            setNewMsgPreview(latest.content);
            if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
            previewTimerRef.current = setTimeout(() => {
              setNewMsgPreview(null);
            }, 5000);
          }
        } else {
          setShowPulse(false);
        }
      }

      // Sync message list if chat is open
      if (isOpenRef.current) {
        setMessages(history);
      }

      lastMsgCountRef.current = totalAdminCount;
    } catch { /* silent */ }
  }, [token]);

  // Start background poll as soon as user is logged in
  useEffect(() => {
    if (!token || !user || user.role === 'ADMIN') return;

    // Initial fetch — compute unread immediately from localStorage baseline
    chatService.getHistory().then(history => {
      const adminMsgs = history.filter(m => m.senderRole === 'ADMIN');
      lastMsgCountRef.current = adminMsgs.length;
      const readCount = getLastReadCount();
      const unread = Math.max(0, adminMsgs.length - readCount);
      if (unread > 0) {
        setUnreadCount(unread);
        setShowPulse(true);
      }
    }).catch(() => {});

    bgPollRef.current = setInterval(bgPoll, 5000);
    return () => {
      if (bgPollRef.current) clearInterval(bgPollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  const loadHistory = useCallback(async () => {
    try {
      const history = await chatService.getHistory();
      setMessages(history);
      const adminCount = history.filter(m => m.senderRole === 'ADMIN').length;
      lastMsgCountRef.current = adminCount;
      // Mark all as read since the chat is open
      saveLastReadCount(adminCount);
    } catch { /* silent */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isOpen || !token || !user) return;

    setIsLoading(true);
    loadHistory().finally(() => setIsLoading(false));
    pollRef.current = setInterval(loadHistory, 4000);

    chatService.connect(token, (newMsg) => {
      setMessages(prev => {
        const exists = prev.some(
          m => (m.id && m.id === newMsg.id) ||
               (m.sentAt === newMsg.sentAt && m.content === newMsg.content)
        );
        if (exists) return prev;
        if (newMsg.senderRole === 'ADMIN') {
          lastMsgCountRef.current += 1;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, token]);

  // Clear unread + preview when chat opens, and persist read position
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setNewMsgPreview(null);
      setShowPulse(false);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      // Persist that the user has read up to the current count
      saveLastReadCount(lastMsgCountRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
      const sent: ChatMessage = { ...response.data, sentAt: parseSentAt(response.data.sentAt) };
      setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
    } catch (err: any) {
      setInputText(content);
      setSendError(err.response?.data?.message || err.message || 'Failed to send');
      setTimeout(() => setSendError(''), 4000);
    } finally {
      setIsSending(false);
    }
  };

  if (!user || user.role === 'ADMIN') return null;

  return (
    <>
      {/* ── Floating new-message preview toast ── */}
      <AnimatePresence>
        {newMsgPreview && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="fixed z-[198] font-body cursor-pointer"
            style={{ bottom: 'calc(3.5rem + 1.5rem + 16px)', right: '1rem', maxWidth: 'min(320px, calc(100vw - 2rem))' }}
            onClick={() => setIsOpen(true)}
          >
            <div className="bg-[var(--card-bg)] border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden">
              {/* Green accent bar */}
              <div className="h-1 bg-gradient-to-r from-primary to-emerald-400" />
              <div className="p-4 flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-[#1b5e20] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                  <ShieldCheck size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Gura Support</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-p)] leading-relaxed line-clamp-2">
                    {newMsgPreview}
                  </p>
                  <p className="text-[9px] font-black text-primary/70 uppercase tracking-widest mt-2">
                    Tap to reply →
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setNewMsgPreview(null); setShowPulse(false); }}
                  className="p-1 rounded-lg text-[var(--text-s)] hover:text-[var(--text-p)] hover:bg-[var(--bg-main)] transition-all flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 340 }}
            className="fixed z-[199] font-body"
            style={{
              bottom: 'calc(3.5rem + 1.5rem + 12px)',
              right: '1rem',
              width: 'min(420px, calc(100vw - 2rem))',
              height: 'min(560px, calc(100vh - 120px))',
              transformOrigin: 'bottom right',
            } as React.CSSProperties}
          >
            <div className="w-full h-full bg-[var(--card-bg)] rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-[var(--border-c)] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="relative p-5 bg-gradient-to-br from-primary to-[#1B5E20] text-white overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/10">
                      <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-black italic text-sm tracking-tighter uppercase leading-none">
                        Gura Support
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Online</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsOpen(false)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden flex flex-col bg-[var(--bg-main)]">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
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
                    messages.map((msg, i) => {
                      const isAdmin = msg.senderRole === 'ADMIN';
                      // Mark last admin message with a "new" indicator if it's the most recent
                      const isLastAdminMsg = isAdmin && i === messages.length - 1;
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                          {/* Admin label on first admin message or after a user message */}
                          {isAdmin && (i === 0 || messages[i - 1]?.senderRole !== 'ADMIN') && (
                            <div className="flex items-center gap-1.5 mb-1 ml-1">
                              <div className="w-4 h-4 bg-gradient-to-br from-primary to-[#1b5e20] rounded-md flex items-center justify-center">
                                <ShieldCheck size={9} className="text-white" />
                              </div>
                              <span className="text-[8px] font-black text-primary uppercase tracking-widest">Support</span>
                            </div>
                          )}
                          <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs font-bold leading-relaxed ${
                            isAdmin
                              ? 'bg-[var(--card-bg)] text-[var(--text-p)] border border-[var(--border-c)] rounded-tl-sm'
                              : 'bg-primary text-white rounded-tr-sm shadow-md shadow-primary/20'
                          }`}>
                            {msg.content}
                            <div className={`text-[8px] mt-1 opacity-40 font-black ${isAdmin ? 'text-left' : 'text-right'}`}>
                              {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {/* "New reply" pill on the latest admin message */}
                          {isLastAdminMsg && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-1 mt-1 ml-1"
                            >
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">New reply</span>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Input */}
              <div className="p-3 bg-[var(--card-bg)] border-t border-[var(--border-c)] flex-shrink-0">
                {sendError && (
                  <div className="mb-2 px-3 py-2 bg-red/10 border border-red/20 rounded-xl text-[10px] font-black text-red">
                    {sendError}
                  </div>
                )}
                <div className="flex gap-2 items-center bg-[var(--bg-main)] rounded-2xl border border-[var(--border-c)] px-3 py-1.5 focus-within:border-primary transition-colors">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="flex-1 bg-transparent py-2 text-xs font-bold outline-none text-[var(--text-p)] placeholder:text-[var(--text-s)]"
                    disabled={isSending}
                  />
                  <button onClick={handleSend} disabled={isSending || !inputText.trim()}
                    className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95 transition-all disabled:opacity-40">
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ── */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[200]">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(prev => !prev)}
          className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/40 relative"
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

          {/* Unread badge */}
          {unreadCount > 0 && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg-main)]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}

          {/* Pulse ring when there are unread messages */}
          {showPulse && !isOpen && (
            <>
              <motion.div
                animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-2xl bg-primary pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 rounded-2xl bg-primary pointer-events-none"
              />
            </>
          )}
        </motion.button>
      </div>
    </>
  );
};

export default ChatWidget;
