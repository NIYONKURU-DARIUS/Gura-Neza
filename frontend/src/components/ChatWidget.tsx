import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, X, ShieldCheck, Loader2,
  Pencil, Trash2, Check, XCircle, Mic, MicOff,
  Phone, PhoneOff, PhoneCall, Play, Pause, Volume2
} from 'lucide-react';
import { useStore } from '../context/store';
import { chatService, type ChatMessage, parseSentAt } from '../services/chatService';
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086/api';

/* ── Voice message player ─────────────────────────────────────────── */
const VoicePlayer: React.FC<{ src: string; isOwn: boolean }> = ({ src, isOwn }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl min-w-[160px] ${isOwn ? 'bg-primary/80' : 'bg-[var(--bg-main)]'}`}>
      <audio ref={audioRef}
        src={`${API_BASE.replace('/api', '')}${src}`}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button onClick={toggle} className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isOwn ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
        {playing ? <Pause size={13} /> : <Play size={13} />}
      </button>
      <div className="flex-1 flex flex-col gap-0.5">
        <div className={`h-1 rounded-full overflow-hidden ${isOwn ? 'bg-white/20' : 'bg-[var(--border-c)]'}`}>
          <div className={`h-full rounded-full transition-all ${isOwn ? 'bg-white' : 'bg-primary'}`}
            style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }} />
        </div>
        <span className={`text-[8px] font-black ${isOwn ? 'text-white/60' : 'text-[var(--text-s)]'}`}>
          {fmt(progress)} / {fmt(duration)}
        </span>
      </div>
      <Volume2 size={11} className={isOwn ? 'text-white/50' : 'text-[var(--text-s)]'} />
    </div>
  );
};

const ChatWidget: React.FC = () => {
  /* ── Chat state ── */
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMsgPreview, setNewMsgPreview] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(false);

  /* ── Edit state ── */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  /* ── Reply state ── */
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  /* ── Voice recording state ── */
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── WebRTC call state ── */
  type CallState = 'idle' | 'calling' | 'ringing' | 'active';
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const getStorageKey = () => `gura_chat_read_${userRef.current?.id ?? 'anon'}`;
  const getLastReadCount = (): number => {
    try { return parseInt(localStorage.getItem(getStorageKey()) ?? '0', 10) || 0; }
    catch { return 0; }
  };
  const saveLastReadCount = (count: number) => {
    try { localStorage.setItem(getStorageKey(), String(count)); } catch { /* ignore */ }
  };

  const bgPoll = useCallback(async () => {
    if (!token || !userRef.current || userRef.current.role === 'ADMIN') return;
    try {
      const history = await chatService.getHistory();
      const adminMsgs = history.filter(m => m.senderRole === 'ADMIN');
      const totalAdminCount = adminMsgs.length;
      const unread = Math.max(0, totalAdminCount - getLastReadCount());
      if (!isOpenRef.current) {
        setUnreadCount(unread);
        if (unread > 0) {
          setShowPulse(true);
          if (totalAdminCount > lastMsgCountRef.current && lastMsgCountRef.current > 0) {
            const latest = adminMsgs[adminMsgs.length - 1];
            setNewMsgPreview(latest.content);
            if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
            previewTimerRef.current = setTimeout(() => setNewMsgPreview(null), 5000);
          }
        } else { setShowPulse(false); }
      }
      if (isOpenRef.current) setMessages(history);
      lastMsgCountRef.current = totalAdminCount;
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    if (!token || !user || user.role === 'ADMIN') return;
    chatService.getHistory().then(history => {
      const adminMsgs = history.filter(m => m.senderRole === 'ADMIN');
      lastMsgCountRef.current = adminMsgs.length;
      const unread = Math.max(0, adminMsgs.length - getLastReadCount());
      if (unread > 0) { setUnreadCount(unread); setShowPulse(true); }
    }).catch(() => {});
    bgPollRef.current = setInterval(bgPoll, 5000);
    return () => { if (bgPollRef.current) clearInterval(bgPollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  const loadHistory = useCallback(async () => {
    try {
      const history = await chatService.getHistory();
      setMessages(history);
      const adminCount = history.filter(m => m.senderRole === 'ADMIN').length;
      lastMsgCountRef.current = adminCount;
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
        const exists = prev.some(m => (m.id && m.id === newMsg.id) || (m.sentAt === newMsg.sentAt && m.content === newMsg.content));
        if (exists) return prev;
        if (newMsg.senderRole === 'ADMIN') lastMsgCountRef.current += 1;
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
        // Subscribe to WebRTC call signals
        chatService.subscribeToCallSignal(uid, handleCallSignal);
      }
    });
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      chatService.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, token]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0); setNewMsgPreview(null); setShowPulse(false);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      saveLastReadCount(lastMsgCountRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  /* ── Text send ── */
  const handleSend = async () => {
    const content = inputText.trim();
    if (!content || isSending) return;
    setInputText(''); setIsSending(true); setSendError('');
    const replySnippet = replyingTo ? replyingTo.content.slice(0, 100) : undefined;
    setReplyingTo(null);
    try {
      const response = await api.post('/chat/send', { content, replyToContent: replySnippet });
      const sent: ChatMessage = { ...response.data, sentAt: parseSentAt(response.data.sentAt) };
      setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
    } catch (err: any) {
      setInputText(content);
      setSendError(err.response?.data?.message || err.message || 'Failed to send');
      setTimeout(() => setSendError(''), 4000);
    } finally { setIsSending(false); }
  };

  /* ── Edit handlers ── */
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingId(msg.id!); setEditText(msg.content);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };
  const handleCancelEdit = () => { setEditingId(null); setEditText(''); };
  const handleConfirmEdit = async () => {
    if (!editingId || !editText.trim() || isEditing) return;
    setIsEditing(true);
    try {
      const updated = await chatService.editMessage(editingId, editText.trim());
      setMessages(prev => prev.map(m => m.id === editingId ? updated : m));
      setEditingId(null); setEditText('');
    } catch { /* silent */ } finally { setIsEditing(false); }
  };
  const handleDelete = async (messageId: number) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch { /* silent */ }
  };

  /* ── Voice recording ── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const form = new FormData();
        form.append('file', blob, 'voice.webm');
        try {
          const res = await api.post('/chat/voice', form, { headers: { 'Content-Type': 'multipart/form-data' } });
          const sent: ChatMessage = { ...res.data, sentAt: parseSentAt(res.data.sentAt) };
          setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
        } catch { /* silent */ }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch { /* mic denied */ }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
    setRecordingSeconds(0);
  };

  const fmtSec = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /* ── WebRTC call ── */
  const createPeer = () => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.onicecandidate = e => {
      if (e.candidate && chatService.isConnected()) {
        chatService.sendCallSignal({ type: 'ICE', userId: user!.id, candidate: e.candidate, direction: 'to_admin' });
      }
    };
    pc.ontrack = e => {
      if (!remoteAudioRef.current) remoteAudioRef.current = new Audio();
      remoteAudioRef.current.srcObject = e.streams[0];
      remoteAudioRef.current.play().catch(() => {});
    };
    return pc;
  };

  const startCall = async () => {
    if (!user) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const pc = createPeer();
      peerRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      chatService.sendCallSignal({ type: 'CALL_INCOMING', userId: user.id, userName: user.name });
      chatService.sendCallSignal({ type: 'OFFER', userId: user.id, sdp: offer });
      setCallState('calling');
    } catch { /* mic denied */ }
  };

  const endCall = () => {
    peerRef.current?.close(); peerRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop()); localStreamRef.current = null;
    if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = null; remoteAudioRef.current = null; }
    if (callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null; }
    if (user) chatService.sendCallSignal({ type: 'CALL_ENDED', userId: user.id, direction: 'to_admin' });
    setCallState('idle'); setCallDuration(0);
  };

  const handleCallSignal = async (signal: any) => {
    if (signal.type === 'ANSWER' && peerRef.current) {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      setCallState('active');
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else if (signal.type === 'ICE' && peerRef.current) {
      try { await peerRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate)); } catch { /* ignore */ }
    } else if (signal.type === 'CALL_ENDED') {
      endCall();
    }
  };

  if (!user || user.role === 'ADMIN') return null;

  return (
    <>
      {/* ── New message toast ── */}
      <AnimatePresence>
        {newMsgPreview && !isOpen && (
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }} transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="fixed z-[198] font-body cursor-pointer"
            style={{ bottom: 'calc(3.5rem + 1.5rem + 16px)', right: '1rem', maxWidth: 'min(320px, calc(100vw - 2rem))' }}
            onClick={() => setIsOpen(true)}>
            <div className="bg-[var(--card-bg)] border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-emerald-400" />
              <div className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-[#1b5e20] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                  <ShieldCheck size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Gura Support</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-p)] leading-relaxed line-clamp-2">{newMsgPreview}</p>
                  <p className="text-[9px] font-black text-primary/70 uppercase tracking-widest mt-2">Tap to reply →</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setNewMsgPreview(null); setShowPulse(false); }}
                  className="p-1 rounded-lg text-[var(--text-s)] hover:text-[var(--text-p)] hover:bg-[var(--bg-main)] transition-all flex-shrink-0">
                  <X size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active call overlay ── */}
      <AnimatePresence>
        {(callState === 'calling' || callState === 'active') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed z-[201] bottom-24 left-1/2 -translate-x-1/2 font-body">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl border ${
              callState === 'active' ? 'bg-primary border-primary/30 text-white shadow-primary/30' : 'bg-[var(--card-bg)] border-[var(--border-c)] text-[var(--text-p)]'
            }`}>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <PhoneCall size={16} className={callState === 'active' ? 'text-white' : 'text-primary'} />
              </motion.div>
              <span className="text-xs font-black">
                {callState === 'calling' ? 'Calling support...' : `On call — ${fmtSec(callDuration)}`}
              </span>
              <button onClick={endCall}
                className="w-7 h-7 bg-red rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-md">
                <PhoneOff size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ type: 'spring', damping: 24, stiffness: 340 }}
            className="fixed z-[199] font-body"
            style={{ bottom: 'calc(3.5rem + 1.5rem + 12px)', right: '1rem', width: 'min(420px, calc(100vw - 2rem))', height: 'min(580px, calc(100vh - 120px))', transformOrigin: 'bottom right' } as React.CSSProperties}>
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
                      <h3 className="font-black italic text-sm tracking-tighter uppercase leading-none">Gura Support</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Call button */}
                    <button onClick={callState === 'idle' ? startCall : endCall}
                      title={callState === 'idle' ? 'Start voice call' : 'End call'}
                      className={`p-2 rounded-xl transition-all ${callState !== 'idle' ? 'bg-red text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                      {callState !== 'idle' ? <PhoneOff size={16} /> : <Phone size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                      <X size={18} />
                    </button>
                  </div>
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
                        <h4 className="text-base font-black italic text-[var(--text-p)] mb-1">Hi, {user.name.split(' ')[0]}!</h4>
                        <p className="text-xs font-bold text-[var(--text-s)] leading-relaxed">How can we help you today?</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isAdmin = msg.senderRole === 'ADMIN';
                      const isLastAdminMsg = isAdmin && i === messages.length - 1;
                      const isBeingEdited = editingId === msg.id;
                      const isVoice = msg.messageType === 'VOICE';
                      return (
                        <motion.div key={msg.id ?? i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'} group/msg`}>
                          {isAdmin && (i === 0 || messages[i - 1]?.senderRole !== 'ADMIN') && (
                            <div className="flex items-center gap-1.5 mb-1 ml-1">
                              <div className="w-4 h-4 bg-gradient-to-br from-primary to-[#1b5e20] rounded-md flex items-center justify-center">
                                <ShieldCheck size={9} className="text-white" />
                              </div>
                              <span className="text-[8px] font-black text-primary uppercase tracking-widest">Support</span>
                            </div>
                          )}
                          {isBeingEdited ? (
                            <div className="max-w-[85%] w-full bg-[var(--card-bg)] border-2 border-primary rounded-2xl rounded-tr-sm overflow-hidden shadow-lg shadow-primary/10">
                              <input ref={editInputRef} value={editText} onChange={e => setEditText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleConfirmEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
                                className="w-full bg-transparent px-3 py-2.5 text-xs font-bold text-[var(--text-p)] outline-none" />
                              <div className="flex items-center justify-end gap-1.5 px-3 pb-2">
                                <button onClick={handleCancelEdit} className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[var(--text-s)] hover:text-red transition-colors px-2 py-1 rounded-lg hover:bg-red/10">
                                  <XCircle size={11} /> Cancel
                                </button>
                                <button onClick={handleConfirmEdit} disabled={isEditing || !editText.trim()}
                                  className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-white bg-primary px-2 py-1 rounded-lg disabled:opacity-40 hover:bg-primary/90 transition-colors">
                                  {isEditing ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <div className={`rounded-2xl text-xs font-bold leading-relaxed ${
                                isAdmin ? 'bg-[var(--card-bg)] text-[var(--text-p)] border border-[var(--border-c)] rounded-tl-sm px-4 py-3'
                                        : isVoice ? 'rounded-tr-sm' : 'bg-primary text-white rounded-tr-sm shadow-md shadow-primary/20 px-4 py-3'
                              }`}>
                                {/* Reply preview strip */}
                                {msg.replyToContent && (
                                  <div className={`text-[9px] font-black mb-2 px-2 py-1.5 rounded-lg border-l-2 truncate ${
                                    isAdmin ? 'bg-[var(--bg-main)] border-primary/50 text-[var(--text-s)]' : 'bg-white/15 border-white/50 text-white/70'
                                  }`}>
                                    ↩ {msg.replyToContent}
                                  </div>
                                )}
                                {isVoice && msg.voiceUrl
                                  ? <VoicePlayer src={msg.voiceUrl} isOwn={!isAdmin} />
                                  : msg.content}
                                {!isVoice && (
                                  <div className={`flex items-center gap-1 mt-1 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                                    {msg.edited && <span className="text-[7px] font-black opacity-40 italic">edited</span>}
                                    <span className="text-[8px] opacity-40 font-black">
                                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Reply button — on admin messages */}
                              {isAdmin && (
                                <div className="absolute -right-9 top-1/2 -translate-y-1/2 hidden group-hover/msg:flex">
                                  <button
                                    onClick={() => { setReplyingTo(msg); setTimeout(() => document.getElementById('chat-input')?.focus(), 50); }}
                                    title="Reply to this message"
                                    className="w-6 h-6 bg-[var(--card-bg)] border border-[var(--border-c)] rounded-lg flex items-center justify-center text-[var(--text-s)] hover:text-primary hover:border-primary transition-all shadow-sm">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                                    </svg>
                                  </button>
                                </div>
                              )}
                              {!isAdmin && msg.id && !isVoice && (
                                <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden group-hover/msg:flex items-center gap-1">
                                  <button onClick={() => handleStartEdit(msg)} title="Edit"
                                    className="w-6 h-6 bg-[var(--card-bg)] border border-[var(--border-c)] rounded-lg flex items-center justify-center text-[var(--text-s)] hover:text-primary hover:border-primary transition-all shadow-sm">
                                    <Pencil size={10} />
                                  </button>
                                  <button onClick={() => handleDelete(msg.id!)} title="Delete"
                                    className="w-6 h-6 bg-[var(--card-bg)] border border-[var(--border-c)] rounded-lg flex items-center justify-center text-[var(--text-s)] hover:text-red hover:border-red transition-all shadow-sm">
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              )}
                              {!isAdmin && msg.id && isVoice && (
                                <div className="absolute -left-9 top-1/2 -translate-y-1/2 hidden group-hover/msg:flex">
                                  <button onClick={() => handleDelete(msg.id!)} title="Delete"
                                    className="w-6 h-6 bg-[var(--card-bg)] border border-[var(--border-c)] rounded-lg flex items-center justify-center text-[var(--text-s)] hover:text-red hover:border-red transition-all shadow-sm">
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {isLastAdminMsg && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-1 mt-1 ml-1">
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
                  <div className="mb-2 px-3 py-2 bg-red/10 border border-red/20 rounded-xl text-[10px] font-black text-red">{sendError}</div>
                )}
                {/* Reply preview bar */}
                {replyingTo && (
                  <div className="mb-2 flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                      <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                    </svg>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest flex-shrink-0">Replying to Support</span>
                    <span className="text-[9px] font-bold text-[var(--text-s)] truncate flex-1">{replyingTo.content}</span>
                    <button onClick={() => setReplyingTo(null)} className="text-[var(--text-s)] hover:text-red transition-colors flex-shrink-0">
                      <XCircle size={12} />
                    </button>
                  </div>
                )}
                {/* Recording indicator */}
                {isRecording && (
                  <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-red/10 border border-red/20 rounded-xl">
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                      className="w-2 h-2 bg-red rounded-full" />
                    <span className="text-[10px] font-black text-red uppercase tracking-widest">Recording {fmtSec(recordingSeconds)}</span>
                    <span className="text-[9px] text-red/60 font-bold ml-auto">Tap mic to send</span>
                  </div>
                )}
                <div className="flex gap-2 items-center bg-[var(--bg-main)] rounded-2xl border border-[var(--border-c)] px-3 py-1.5 focus-within:border-primary transition-colors">
                  <input type="text" placeholder="Type a message..." value={inputText} id="chat-input"
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="flex-1 bg-transparent py-2 text-xs font-bold outline-none text-[var(--text-p)] placeholder:text-[var(--text-s)]"
                    disabled={isSending || isRecording} />
                  {/* Mic button */}
                  <button onClick={isRecording ? stopRecording : startRecording}
                    title={isRecording ? 'Stop & send voice' : 'Record voice message'}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isRecording ? 'bg-red text-white animate-pulse' : 'bg-[var(--border-c)] text-[var(--text-s)] hover:bg-primary/10 hover:text-primary'
                    }`}>
                    {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
                  </button>
                  {/* Send button */}
                  <button onClick={handleSend} disabled={isSending || !inputText.trim() || isRecording}
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
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(prev => !prev)}
          className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/40 relative">
          <AnimatePresence mode="wait">
            {isOpen
              ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} /></motion.div>
              : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageSquare size={22} /></motion.div>
            }
          </AnimatePresence>
          {unreadCount > 0 && !isOpen && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg-main)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
          {showPulse && !isOpen && (
            <>
              <motion.div animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-2xl bg-primary pointer-events-none" />
              <motion.div animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 rounded-2xl bg-primary pointer-events-none" />
            </>
          )}
        </motion.button>
      </div>
    </>
  );
};

export default ChatWidget;
