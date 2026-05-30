import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, ChevronLeft, Image as ImageIcon, CheckCheck, Smile } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: string;
  isRead: boolean;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'admin', text: 'Hello! 👋 How can we help you with Gura Neza today?', timestamp: '10:00 AM', isRead: true },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Mock admin response
    setTimeout(() => {
      const adminReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'admin',
        text: 'Thanks for your message! Our team will get back to you shortly. 🍃',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true
      };
      setMessages(prev => [...prev, adminReply]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-body">
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="absolute bottom-20 right-0 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-[var(--card-bg)] border border-[var(--border-c)] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-colors duration-500"
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <User size={24} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-primary rounded-full" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">Support Admin</h3>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold">Usually replies in 1h</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[var(--bg-main)]/30">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold shadow-sm relative ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-[var(--card-bg)] text-[var(--text-p)] border border-[var(--border-c)] rounded-tl-none'
                  }`}>
                    {msg.text}
                    <div className={`text-[10px] mt-2 flex items-center gap-1 ${
                      msg.sender === 'user' ? 'text-white/60' : 'text-[var(--text-s)]'
                    }`}>
                      {msg.timestamp}
                      {msg.sender === 'user' && <CheckCheck size={12} className={msg.isRead ? 'text-white' : 'text-white/40'} />}
                    </div>
                    {/* Shadow Glow for Dark Mode */}
                    <div className={`absolute inset-0 rounded-2xl opacity-0 dark:opacity-20 blur-lg transition-opacity ${
                      msg.sender === 'user' ? 'bg-primary' : 'bg-transparent'
                    }`} />
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-6 bg-[var(--card-bg)] border-t border-[var(--border-c)] flex flex-col gap-4 transition-colors duration-500">
               <div className="flex items-center justify-between opacity-50 px-2">
                 <div className="flex gap-4">
                    <button type="button"><ImageIcon size={18} /></button>
                    <button type="button"><Smile size={18} /></button>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Supports Files</span>
               </div>
               <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-[var(--bg-main)] border border-[var(--border-c)] rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-primary transition-all text-[var(--text-p)]"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:grayscale disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
