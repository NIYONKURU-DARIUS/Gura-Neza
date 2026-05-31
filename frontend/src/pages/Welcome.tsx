import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Coffee, Smartphone, Shirt, Heart,
  ShoppingCart, Menu, Package, MessageSquare,
  Wallet, Shield, Zap, Star, ChevronDown,
  X, TrendingUp, Users, Globe, Sparkles
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
  const { scrollY } = useScroll();
  const { token } = useStore();
  const heroRef = useRef<HTMLDivElement>(null);

  const heroY = useTransform(scrollY, [0, 600], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.08]);

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
    <div className="flex flex-col min-h-screen bg-[#080808] overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/50'
          : 'bg-transparent'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all group-hover:scale-110">
              <span className="text-white font-black text-lg italic">G</span>
            </div>
            <span className="text-lg font-black tracking-tighter italic text-white">GURA NEZA</span>
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
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <Link to="/login">
                  <button className="hidden sm:flex text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors px-4 py-2">
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all">
                    Get Started
                  </button>
                </Link>
              </>
            ) : (
              <Link to="/products">
                <button className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 hover:scale-105 transition-all">
                  Go to Shop
                </button>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
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
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col p-10"
          >
            <div className="flex justify-between items-center mb-16">
              <span className="text-xl font-black italic text-white tracking-tighter">GURA NEZA</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {['Categories', 'Features', 'Reviews'].map(item => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl font-black italic text-white/30 hover:text-white transition-colors tracking-tighter"
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full border border-white/20 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:bg-white/5 transition-all">
                  Sign In
                </button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full bg-primary text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest shadow-xl shadow-primary/30">
                  Create Account
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-black">
        {/* Background image with parallax */}
        <motion.div
          style={{ scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070"
            className="w-full h-full object-cover opacity-30"
            alt="hero"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        </motion.div>

        {/* Animated grid lines */}
        <div className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60">
              Rwanda's #1 Digital Marketplace
            </span>
            <Sparkles size={12} className="text-primary/60" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.88] mb-8 uppercase"
          >
            Shop Smarter.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-400 to-emerald-300">
              Live Better.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg text-white/40 font-bold mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Curated collections, a seamless digital wallet, and real-time support —
            all in one place built for Rwanda and beyond.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={token ? '/products' : '/register'}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 bg-primary text-white font-black text-sm uppercase tracking-widest px-10 py-5 rounded-2xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all"
              >
                Start Shopping
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black text-sm uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-white/10 transition-all"
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/20"
        >
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">Scroll</span>
          <ChevronDown size={16} />
        </motion.div>
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
      <section id="categories" className="py-32 px-4 sm:px-10 bg-[#080808]">
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
                className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter leading-[0.9]"
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
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest group"
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
                whileHover={{ y: -6 }}
                className="group relative cursor-pointer"
              >
                <Link to={token ? '/products' : '/login'}>
                  <div className="relative h-[340px] rounded-3xl overflow-hidden border border-white/5">
                    {/* Image */}
                    <img
                      src={cat.image}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={cat.name}
                    />
                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    {/* Glow on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at 50% 100%, ${cat.accent}, transparent 70%)` }}
                    />
                    {/* Content */}
                    <div className="absolute inset-0 p-7 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                          {cat.tag}
                        </span>
                        <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white/20 transition-all">
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
      <section id="features" className="py-32 px-4 sm:px-10 bg-[#0d0d0d]">
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
              className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter leading-[0.9]"
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
                whileHover={{ y: -4 }}
                className="group relative bg-white/[0.03] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all duration-500 overflow-hidden"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${f.color}`} />
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-6 shadow-xl`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-black text-white italic tracking-tighter mb-3">{f.title}</h3>
                <p className="text-white/40 font-bold text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT CTA BANNER ───────────────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-10 bg-[#080808]">
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
                    className="bg-white text-primary font-black text-sm uppercase tracking-widest px-10 py-5 rounded-2xl shadow-2xl hover:shadow-white/20 transition-all"
                  >
                    Create Free Account
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-sm uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-white/20 transition-all"
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
      <section id="reviews" className="py-32 px-4 sm:px-10 bg-[#080808]">
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
              className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter leading-[0.9]"
            >
              Loved by
              <br />
              <span className="text-primary">Real People.</span>
            </motion.h2>
          </div>

          {/* Testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative bg-white/[0.03] border rounded-3xl p-8 transition-all duration-500 ${
                  activeTestimonial === i
                    ? 'border-primary/40 bg-primary/5 shadow-xl shadow-primary/10'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/60 font-bold text-sm leading-relaxed mb-8 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-sm border border-primary/20">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm tracking-tight">{t.name}</p>
                    <p className="text-white/30 font-bold text-[10px] uppercase tracking-widest">{t.role}</p>
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
                  activeTestimonial === i ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-10 bg-[#0d0d0d] border-y border-white/5">
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
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
                  {s.icon}
                </div>
                <h3 className="text-4xl font-black text-white italic tracking-tighter mb-1">{s.value}</h3>
                <p className="text-white/30 font-black text-[10px] uppercase tracking-widest">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="py-20 px-4 sm:px-10 bg-[#080808]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16">
            {/* Brand */}
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-white font-black text-lg italic">G</span>
                </div>
                <span className="text-xl font-black italic text-white tracking-tighter">GURA NEZA</span>
              </div>
              <p className="text-white/30 font-bold text-sm leading-relaxed">
                Redefining commerce in Rwanda. Local authenticity meets world-class digital innovation.
              </p>
              {/* Social links placeholder */}
              <div className="flex gap-3 mt-8">
                {['TW', 'IG', 'FB', 'LI'].map(s => (
                  <div key={s} className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-[9px] font-black">
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
                          <Link to={link.to} className="text-white/30 hover:text-white transition-colors font-bold text-[11px] uppercase tracking-widest">
                            {link.label}
                          </Link>
                        ) : (
                          <a href={link.href} className="text-white/30 hover:text-white transition-colors font-bold text-[11px] uppercase tracking-widest">
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
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">
              &copy; 2026 Gura Neza Global. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <a key={item} href="#" className="text-white/20 hover:text-white/50 transition-colors text-[9px] font-black uppercase tracking-widest">
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
