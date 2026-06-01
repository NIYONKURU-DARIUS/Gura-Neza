import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Coffee, Smartphone, Shirt, Heart,
  ShoppingCart, Menu, Package, MessageSquare,
  Wallet, Shield, Zap, Star, ChevronDown,
  X, TrendingUp, Users, Globe, Sun, Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/store';

/* ─── DATA ─────────────────────────────────────────────────────────────── */
const categories = [
  {
    name: 'Food & Gourmet',
    tag: 'FOOD',
    icon: <Coffee />,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
    accent: '#16a34a',
    count: '240+ items',
  },
  {
    name: 'Electronics',
    tag: 'TECH',
    icon: <Smartphone />,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800',
    accent: '#2563eb',
    count: '180+ items',
  },
  {
    name: 'Fashion',
    tag: 'STYLE',
    icon: <Shirt />,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800',
    accent: '#9333ea',
    count: '320+ items',
  },
  {
    name: 'Home & Living',
    tag: 'HOME',
    icon: <Heart />,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    accent: '#dc2626',
    count: '150+ items',
  },
];

const stats = [
  { value: '12K+', label: 'Happy Customers', icon: <Users size={20} /> },
  { value: '890+', label: 'Products Listed', icon: <Package size={20} /> },
  { value: '99.2%', label: 'Satisfaction Rate', icon: <Star size={20} /> },
  { value: '48h', label: 'Avg. Delivery', icon: <Zap size={20} /> },
];

const features = [
  {
    icon: <Wallet size={28} />,
    title: 'Gura Wallet',
    desc: 'One secure digital wallet for all your purchases. Top up, pay, and track every transaction in real time.',
    color: 'from-emerald-500 to-green-700',
  },
  {
    icon: <Shield size={28} />,
    title: 'Buyer Protection',
    desc: 'Every order is covered. Money-back guarantee if delivery fails within 48 hours — no questions asked.',
    color: 'from-blue-500 to-indigo-700',
  },
  {
    icon: <MessageSquare size={28} />,
    title: 'Live Concierge',
    desc: 'Real-time chat support with our team. Get answers, track orders, and resolve issues instantly.',
    color: 'from-violet-500 to-purple-700',
  },
  {
    icon: <Globe size={28} />,
    title: 'Global & Local',
    desc: 'Rwandan craftsmanship meets global quality. Curated collections from local artisans and top brands.',
    color: 'from-amber-500 to-orange-600',
  },
];

const testimonials = [
  {
    name: 'Amina K.',
    role: 'Regular Shopper',
    text: 'Gura Neza changed how I shop. The wallet system is seamless and delivery is always on time.',
    rating: 5,
    avatar: 'A',
  },
  {
    name: 'Jean-Pierre M.',
    role: 'Business Owner',
    text: 'I source all my office supplies here. The product quality and customer support are unmatched.',
    rating: 5,
    avatar: 'J',
  },
  {
    name: 'Claudine U.',
    role: 'Fashion Enthusiast',
    text: 'The fashion collection is incredible. I find pieces here I cannot find anywhere else in Kigali.',
    rating: 5,
    avatar: 'C',
  },
];

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
const Welcome: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const { token } = useStore();
  const heroRef = useRef<HTMLDivElement>(null);

  // Shorthand helpers
  const bg = darkMode ? 'bg-[#080808]' : 'bg-white';
  const bgAlt = darkMode ? 'bg-[#0d0d0d]' : 'bg-gray-50';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const textMuted = darkMode ? 'text-white/40' : 'text-gray-500';
  const textFaint = darkMode ? 'text-white/20' : 'text-gray-400';
  const textDim = darkMode ? 'text-white/30' : 'text-gray-400';
  const textSub = darkMode ? 'text-white/60' : 'text-gray-600';
  const border = darkMode ? 'border-white/5' : 'border-gray-200';
  const cardBg = darkMode ? 'bg-white/[0.03]' : 'bg-white';
  const cardBorder = darkMode ? 'border-white/5 hover:border-white/10' : 'border-gray-200 hover:border-gray-300';



  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex flex-col min-h-screen ${bg} overflow-x-hidden transition-colors duration-300`}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        isScrolled
          ? darkMode
            ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/50'
            : 'bg-white/90 backdrop-blur-2xl border-b border-gray-200 shadow-lg shadow-gray-200/50'
          : 'bg-transparent'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all group-hover:scale-110">
              <span className="text-white font-black text-lg italic">G</span>
            </div>
            <span className={`text-lg font-black tracking-tighter italic ${text}`}>GURA NEZA</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Categories', href: '#categories' },
              { label: 'Features', href: '#features' },
              { label: 'Reviews', href: '#reviews' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${textMuted} hover:${text} transition-colors`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full border transition-all ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                  : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {!token ? (
              <>
                <Link to="/login">
                  <button className={`hidden sm:flex text-[10px] font-black uppercase tracking-widest ${textMuted} hover:${text} transition-colors px-4 py-2`}>
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all">
                    Get Started
                  </button>
                </Link>
              </>
            ) : (
              <Link to="/products">
                <button className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-all">
                  Go to Shop
                </button>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-2 ${textMuted} hover:${text} transition-colors`}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[200] ${darkMode ? 'bg-black/95' : 'bg-white/98'} backdrop-blur-2xl flex flex-col p-10`}
          >
            <div className="flex justify-between items-center mb-16">
              <span className={`text-xl font-black italic ${text} tracking-tighter`}>GURA NEZA</span>
              <button onClick={() => setMobileMenuOpen(false)} className={`${textMuted} hover:${text}`}>
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {['Categories', 'Features', 'Reviews'].map(item => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-3xl font-black italic ${textMuted} hover:${text} transition-colors tracking-tighter`}
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className={`w-full border ${darkMode ? 'border-white/20 text-white hover:bg-white/5' : 'border-gray-300 text-gray-900 hover:bg-gray-50'} font-black py-4 rounded-full text-sm uppercase tracking-widest transition-all`}>
                  Sign In
                </button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full bg-primary text-white font-black py-4 rounded-full text-sm uppercase tracking-widest shadow-xl shadow-primary/30">
                  Create Account
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: darkMode
            ? 'linear-gradient(135deg, #0a0a0a 0%, #0d1a0d 40%, #0a1a10 100%)'
            : 'linear-gradient(135deg, #f0faf2 0%, #e8f5e9 40%, #f1f8f2 100%)',
        }}
      >
        {/* Radial glow — top right */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: darkMode
              ? 'radial-gradient(circle at 80% 20%, rgba(46,125,50,0.18) 0%, transparent 65%)'
              : 'radial-gradient(circle at 80% 20%, rgba(46,125,50,0.12) 0%, transparent 65%)',
          }}
        />
        {/* Radial glow — bottom left */}
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background: darkMode
              ? 'radial-gradient(circle at 20% 80%, rgba(76,175,80,0.10) 0%, transparent 60%)'
              : 'radial-gradient(circle at 20% 80%, rgba(46,125,50,0.08) 0%, transparent 60%)',
          }}
        />

        {/* Subtle dot-grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: darkMode
              ? 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(46,125,50,0.10) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 pt-28 pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-0">

          {/* ── LEFT: Text content ── */}
          <div className="flex-1 flex flex-col justify-center lg:pr-12">

            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 mb-6 self-start"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className={`text-[9px] font-black uppercase tracking-[0.35em] ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                Rwanda's #1 Digital Marketplace
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className={`font-black italic tracking-tighter leading-[0.88] uppercase mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
            >
              Shop The
              <br />
              <span className="text-primary">BEST</span>
              <br />
              <span className={darkMode ? 'text-white/80' : 'text-gray-800'}>WITH US!</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`font-bold leading-relaxed mb-10 max-w-sm ${darkMode ? 'text-white/40' : 'text-gray-500'}`}
              style={{ fontSize: 'clamp(0.72rem, 1.2vw, 0.85rem)' }}
            >
              Curated collections, a seamless digital wallet, and real-time support —
              all in one place built for Rwanda and beyond.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 }}
              className="flex items-center gap-4 mb-12"
            >
              <Link to={token ? '/products' : '/register'}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center gap-3 bg-primary text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all"
                  style={{ fontSize: '0.65rem' }}
                >
                  Start Shopping
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className={`font-black uppercase tracking-widest px-8 py-4 rounded-2xl border transition-all ${
                    darkMode
                      ? 'border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5'
                      : 'border-primary/30 text-primary hover:border-primary hover:bg-primary/5'
                  }`}
                  style={{ fontSize: '0.65rem' }}
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>

            {/* Social proof row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex items-center gap-6"
            >
              <div className="flex -space-x-2">
                {['A', 'J', 'C', 'M'].map((l, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-[9px] ${
                      darkMode
                        ? 'bg-primary/20 border-[#0d1a0d] text-primary'
                        : 'bg-primary/15 border-[#f0faf2] text-primary'
                    }`}
                    style={{ zIndex: 4 - i }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className={`font-black text-[9px] uppercase tracking-widest ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                  12,000+ happy shoppers
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Blob + circular image ── */}
          <div className="flex-1 relative flex items-center justify-center min-h-[420px] lg:min-h-[560px]">

            {/* Large primary blob */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
              className="absolute"
              style={{ top: '0%', right: '5%', width: '72%', height: '72%' }}
            >
              <svg viewBox="0 0 400 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path
                  d="M320 40 C380 40 400 100 390 160 C380 220 340 240 300 280 C260 320 220 370 160 360 C100 350 40 300 20 240 C0 180 20 100 70 60 C120 20 180 10 240 20 C280 28 300 40 320 40Z"
                  fill={darkMode ? '#1a3a1a' : '#2E7D32'}
                  opacity={darkMode ? 0.9 : 1}
                />
                <circle cx="370" cy="55" r="22" fill={darkMode ? '#2E7D32' : '#4CAF50'} opacity="0.7" />
                <circle cx="80" cy="320" r="8" fill={darkMode ? '#2E7D32' : '#4CAF50'} opacity="0.5" />
                <circle cx="60" cy="340" r="5" fill={darkMode ? '#2E7D32' : '#4CAF50'} opacity="0.3" />
                <line x1="80" y1="320" x2="60" y2="340" stroke={darkMode ? '#4CAF50' : '#2E7D32'} strokeWidth="1.5" opacity="0.3" />
                <circle cx="350" cy="290" r="6" fill={darkMode ? '#2E7D32' : '#4CAF50'} opacity="0.4" />
                <circle cx="370" cy="310" r="4" fill={darkMode ? '#2E7D32' : '#4CAF50'} opacity="0.25" />
                <line x1="350" y1="290" x2="370" y2="310" stroke={darkMode ? '#4CAF50' : '#2E7D32'} strokeWidth="1.5" opacity="0.25" />
              </svg>
            </motion.div>

            {/* Circular product image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              className="relative z-10"
              style={{ width: 'clamp(280px, 44vw, 420px)', height: 'clamp(280px, 44vw, 420px)' }}
            >
              <div
                className="absolute inset-[-16px] rounded-full border-2 border-dashed opacity-20"
                style={{ borderColor: darkMode ? '#4CAF50' : '#2E7D32' }}
              />
              <div className={`w-full h-full rounded-full overflow-hidden shadow-2xl shadow-primary/20 ${darkMode ? 'border-4 border-white/10' : 'border-4 border-white'}`}>
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop"
                  alt="Marketplace"
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className={`absolute -top-4 -right-4 rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2 ${darkMode ? 'bg-white/10 backdrop-blur-md border border-white/10' : 'bg-white border border-gray-100'}`}
              >
                <ShoppingCart size={13} className="text-primary" />
                <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>890+ Items</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-primary rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2"
              >
                <Zap size={13} className="text-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Fast Delivery</span>
              </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 ${darkMode ? 'text-white/20' : 'text-primary/30'}`}
            >
              <span className="text-[7px] font-black uppercase tracking-[0.4em]">Scroll</span>
              <ChevronDown size={14} />
            </motion.div>
          </div>
        </div>

        {/* ── WAVE SEPARATOR — bottom edge ── */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="w-full h-16 sm:h-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill={darkMode ? '#0d0d0d' : '#f9fafb'}
            />
          </svg>
        </div>
      </section>

      {/* ── STATS TICKER ───────────────────────────────────────────────── */}
      <section className="bg-primary py-5 overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          className="flex gap-16 whitespace-nowrap"
        >
          {[...stats, ...stats, ...stats, ...stats].map((s, i) => (
            <div key={i} className="flex items-center gap-3 flex-shrink-0">
              <span className="text-white/60">{s.icon}</span>
              <span className="text-white font-black text-sm italic tracking-tighter">{s.value}</span>
              <span className="text-white/50 font-bold text-[10px] uppercase tracking-widest">{s.label}</span>
              <span className="text-white/20 mx-4 text-lg">·</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────────────── */}
      <section id="categories" className={`py-32 px-4 sm:px-10 ${bg} transition-colors duration-300`}>
        <div className="max-w-[1400px] mx-auto">
          {/* Section header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-8 h-px bg-primary" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Collections</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`text-4xl sm:text-6xl font-black ${text} italic tracking-tighter leading-[0.9]`}
              >
                Shop by
                <br />
                <span className="text-primary">Category.</span>
              </motion.h2>
            </div>
            <Link to={token ? '/products' : '/login'}>
              <motion.button
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className={`flex items-center gap-2 ${textMuted} hover:${text} transition-colors font-black text-[10px] uppercase tracking-widest group`}
              >
                View All
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative cursor-pointer"
              >
                <Link to={token ? '/products' : '/login'}>
                  {/* Pill-shaped tall card — no border, pure shadow */}
                  <div className="relative h-[360px] rounded-[3rem] overflow-hidden shadow-xl shadow-black/10 group-hover:shadow-2xl group-hover:shadow-black/20 transition-all duration-500">
                    <img
                      src={cat.image}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={cat.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at 50% 100%, ${cat.accent}, transparent 70%)` }}
                    />
                    <div className="absolute inset-0 p-7 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full">
                          {cat.tag}
                        </span>
                        {/* Circle icon — no more square */}
                        <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:bg-white/25 transition-all">
                          {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 16 })}
                        </div>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{cat.count}</p>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-3">{cat.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                          style={{ color: cat.accent }}>
                          Browse <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section id="features" className={`py-32 px-4 sm:px-10 ${bgAlt} transition-colors duration-300`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-5"
            >
              <div className="w-8 h-px bg-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Why Gura Neza</span>
              <div className="w-8 h-px bg-primary" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-4xl sm:text-6xl font-black ${text} italic tracking-tighter leading-[0.9]`}
            >
              Built for the
              <br />
              <span className="text-primary">Modern Shopper.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`group relative ${cardBg} rounded-[2.5rem] p-8 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl`}
              >
                {/* Gradient glow on hover — no border */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-8 transition-opacity duration-500 bg-gradient-to-br ${f.color} rounded-[2.5rem]`} />
                {/* Circle icon */}
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-6 shadow-xl`}>
                  {f.icon}
                </div>
                <h3 className={`text-lg font-black ${text} italic tracking-tighter mb-3`}>{f.title}</h3>
                <p className={`${textMuted} font-bold text-xs leading-relaxed`}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT CTA BANNER ───────────────────────────────────────────── */}
      <section className={`py-8 px-4 sm:px-10 ${bg} transition-colors duration-300`}>
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary via-green-700 to-emerald-900 p-12 sm:p-20"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                  <TrendingUp size={16} className="text-white/60" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60">Limited Time</span>
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter leading-[0.9] mb-4">
                  Join 12,000+
                  <br />
                  Smart Shoppers.
                </h2>
                <p className="text-white/60 font-bold text-sm max-w-md">
                  Create your free account today and get instant access to exclusive deals, wallet rewards, and priority support.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-primary font-black text-sm uppercase tracking-widest px-10 py-5 rounded-full shadow-2xl hover:shadow-white/20 transition-all"
                  >
                    Create Free Account
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-sm uppercase tracking-widest px-10 py-5 rounded-full hover:bg-white/20 transition-all"
                  >
                    Sign In
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────── */}
      <section id="reviews" className={`py-32 px-4 sm:px-10 ${bg} transition-colors duration-300`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-5"
            >
              <div className="w-8 h-px bg-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Testimonials</span>
              <div className="w-8 h-px bg-primary" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-4xl sm:text-6xl font-black ${text} italic tracking-tighter leading-[0.9]`}
            >
              Loved by
              <br />
              <span className="text-primary">Real People.</span>
            </motion.h2>
          </div>

          {/* Testimonial cards — pill/bubble style, no border */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative rounded-[2.5rem] p-8 transition-all duration-500 ${
                  activeTestimonial === i
                    ? 'bg-primary/8 shadow-2xl shadow-primary/10 scale-[1.02]'
                    : `${cardBg} shadow-md hover:shadow-xl`
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className={`${textSub} font-bold text-sm leading-relaxed mb-8 italic`}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4">
                  {/* Circle avatar — no more square */}
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className={`${text} font-black text-sm tracking-tight`}>{t.name}</p>
                    <p className={`${textDim} font-bold text-[10px] uppercase tracking-widest`}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-10">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all duration-300 ${
                  activeTestimonial === i ? 'w-8 h-2 bg-primary' : `w-2 h-2 ${darkMode ? 'bg-white/20 hover:bg-white/40' : 'bg-gray-300 hover:bg-gray-400'}`
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ──────────────────────────────────────────────── */}
      <section className={`py-24 px-4 sm:px-10 ${bgAlt} border-y ${border} transition-colors duration-300`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                  {s.icon}
                </div>
                <h3 className={`text-4xl font-black ${text} italic tracking-tighter mb-1`}>{s.value}</h3>
                <p className={`${textDim} font-black text-[10px] uppercase tracking-widest`}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className={`py-20 px-4 sm:px-10 ${bg} transition-colors duration-300`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16">
            {/* Brand */}
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-white font-black text-lg italic">G</span>
                </div>
                <span className={`text-xl font-black italic ${text} tracking-tighter`}>GURA NEZA</span>
              </div>
              <p className={`${textDim} font-bold text-sm leading-relaxed`}>
                Redefining commerce in Rwanda. Local authenticity meets world-class digital innovation.
              </p>
              {/* Social links placeholder */}
              <div className="flex gap-3 mt-8">
                {['TW', 'IG', 'FB', 'LI'].map(s => (
                  <div key={s} className={`w-9 h-9 ${darkMode ? 'bg-white/5 border-white/10 text-white/30 hover:text-white hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-200'} border rounded-full flex items-center justify-center transition-all cursor-pointer text-[9px] font-black`}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
              {[
                {
                  title: 'Discover',
                  links: [
                    { label: 'Marketplace', to: '/products' },
                    { label: 'Categories', href: '#categories' },
                    { label: 'Trending', to: '/products' },
                  ],
                },
                {
                  title: 'Account',
                  links: [
                    { label: 'Sign In', to: '/login' },
                    { label: 'Register', to: '/register' },
                    { label: 'My Orders', to: '/orders' },
                  ],
                },
                {
                  title: 'Support',
                  links: [
                    { label: 'Help Center', href: '#' },
                    { label: 'Track Order', href: '#' },
                    { label: 'Returns', href: '#' },
                  ],
                },
              ].map(col => (
                <div key={col.title}>
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-5">{col.title}</h4>
                  <ul className="flex flex-col gap-3">
                    {col.links.map(link => (
                      <li key={link.label}>
                        {'to' in link ? (
                          <Link to={link.to} className={`${textDim} hover:${text} transition-colors font-bold text-[11px] uppercase tracking-widest`}>
                            {link.label}
                          </Link>
                        ) : (
                          <a href={link.href} className={`${textDim} hover:${text} transition-colors font-bold text-[11px] uppercase tracking-widest`}>
                            {link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className={`pt-8 border-t ${border} flex flex-col sm:flex-row justify-between items-center gap-4`}>
            <p className={`${textFaint} text-[9px] font-black uppercase tracking-[0.4em]`}>
              &copy; 2026 Gura Neza Global. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <a key={item} href="#" className={`${textFaint} hover:${textDim} transition-colors text-[9px] font-black uppercase tracking-widest`}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Welcome;
