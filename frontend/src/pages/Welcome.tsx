import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, ArrowRight, Zap, ShieldCheck, Heart, Coffee, Smartphone, Shirt, ShoppingCart, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroMarket from '../assets/hero_market.png';

const categories = [
  { 
    name: 'Food', 
    icon: <Coffee />, 
    color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600'
  },
  { 
    name: 'Electronics', 
    icon: <Smartphone />, 
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600'
  },
  { 
    name: 'Fashion', 
    icon: <Shirt />, 
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=600'
  },
  { 
    name: 'Home', 
    icon: <Heart />, 
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600'
  },
];

const Welcome: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const y = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-main)] transition-colors duration-500 overflow-x-hidden">
      
      {/* Custom Landing Header (Replacing standard Navbar) */}
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 sm:px-[5%] h-24 flex items-center justify-between ${
        isScrolled ? 'bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--border-c)] shadow-lg' : 'bg-transparent'
      }`}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-all shadow-xl shadow-primary/20">
             <span className="text-white font-black text-2xl italic">G</span>
          </div>
          <span className={`text-2xl font-black tracking-tighter font-headers italic transition-colors ${
            isScrolled ? 'text-primary' : 'text-white drop-shadow-md'
          }`}>GURA NEZA</span>
        </Link>

        {/* Desktop Nav */}
        <div className={`hidden md:flex items-center gap-10 font-black text-sm uppercase tracking-widest transition-colors ${
          isScrolled ? 'text-[var(--text-p)]' : 'text-white'
        }`}>
          <a href="#categories" className="hover:text-primary transition-colors">Categories</a>
          <Link to="/products" className="hover:text-primary transition-colors">Marketplace</Link>
          <Link to="/login" className="hover:text-primary transition-colors">Support</Link>
        </div>

        <div className="flex items-center gap-4">
           <Link to="/login">
              <button className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                isScrolled 
                ? 'bg-primary text-white shadow-lg hover:bg-primary/90' 
                : 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20'
              }`}>
                Sign In
              </button>
           </Link>
           <button className={`p-3 rounded-2xl md:hidden ${isScrolled ? 'text-primary' : 'text-white'}`}>
             <Menu size={24} />
           </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Full-width Hero Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroMarket} 
            className="w-full h-full object-cover brightness-[0.4] dark:brightness-[0.25] transition-all duration-1000"
            alt="Rwandan Market"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-main)]" />
        </div>

        <motion.div style={{ opacity, y }} className="relative z-10 max-w-4xl text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-primary/20 backdrop-blur-md px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.4em] mb-8 border border-white/10"
          >
            <Star size={16} fill="#FFD700" className="text-yellow-400" /> Rwanda's Premium Digital Hub
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-8xl font-black leading-[0.9] mb-10 italic tracking-tighter"
          >
            Buy Smart. <br/>
            <span className="text-primary italic">Live Better.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-2xl text-white/80 mb-16 max-w-2xl mx-auto font-bold leading-relaxed"
          >
            Connect with the best Rwandan markets and global essentials in one beautiful, secure platform.
          </motion.p>

          {/* Primary CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link to="/products">
              <button className="btn-primary px-12 py-6 rounded-[2rem] text-xl flex items-center justify-center gap-4 group shadow-2xl shadow-primary/40 relative overflow-hidden italic">
                 <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                 Start Shopping <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
            <Link to="/login">
              <button className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-12 py-6 rounded-[2rem] text-xl font-black italic hover:bg-white/20 transition-all shadow-2xl">
                 Create Account
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
           animate={{ y: [0, 10, 0] }}
           transition={{ repeat: Infinity, duration: 2 }}
           className="absolute bottom-10 z-10 text-white/30 flex flex-col items-center gap-2"
        >
           <span className="text-[10px] font-black uppercase tracking-widest">Scroll to explore</span>
           <div className="w-px h-12 bg-white/20 relative">
              <div className="absolute top-0 w-full h-1/2 bg-primary" />
           </div>
        </motion.div>
      </section>

      {/* Categories Section - Redesigned for Premium Appeal */}
      <section id="categories" className="py-40 px-4 sm:px-[5%] bg-[var(--bg-main)] relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12 relative z-10">
              <div className="max-w-2xl text-left">
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4"
                   >
                     Curated Experience
                   </motion.div>
                   <h2 className="text-5xl sm:text-7xl font-black text-[var(--text-p)] mb-8 italic tracking-tighter leading-[1.1]">
                     Crafted for <br/> <span className="text-primary">Excellence.</span>
                   </h2>
                   <p className="text-[var(--text-s)] text-xl font-bold leading-relaxed max-w-lg">
                     Navigate through our specialized departments, each designed to bring you the finest Rwandan and global products.
                   </p>
              </div>
              <Link to="/products" className="group">
                  <button className="flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--border-c)] px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary transition-all shadow-sm hover:shadow-xl">
                      Explore All Marketplace <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><ArrowRight size={18} /></div>
                  </button>
              </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {categories.map((cat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-[320px] bg-[var(--card-bg)] border border-[var(--border-c)] rounded-[2.5rem] overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500">
                   {/* Background Image */}
                   <div className="absolute inset-0 z-0">
                      <img src={cat.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={cat.name} />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
                   </div>

                   <div className="relative z-10 h-full p-8 flex flex-col justify-between text-white">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 transition-all ${cat.color.split(' ')[0]}`}>
                        {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 20 })}
                      </div>
                      
                      <div>
                         <h3 className="text-2xl font-black mb-2 italic tracking-tight">{cat.name}</h3>
                         <p className="text-white/70 font-bold text-xs mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
                            Explore premium curated collections.
                         </p>
                         <div className="flex items-center gap-3 text-primary font-black text-[9px] uppercase tracking-widest">
                           Browse <ArrowRight size={12} />
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Shop Now Button with Pulse (Fixed Mobile Friendly) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 sm:left-auto sm:right-10 sm:translate-x-0 z-[60]">
         <Link to="/products">
            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="btn-primary px-10 py-5 rounded-3xl shadow-2xl flex items-center gap-4 text-xl italic group relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-white/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
               <ShoppingCart size={24} /> Shop Now
               <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 border-4 border-white/30 rounded-3xl"
               />
            </motion.button>
         </Link>
      </div>

      {/* Benefits Section */}
      <section className="py-32 px-4 sm:px-[8%] bg-[var(--card-bg)] transition-colors duration-500 rounded-[4rem] sm:rounded-[8rem] mx-4 sm:mx-8 mb-20 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="grid md:grid-cols-3 gap-16 relative z-10">
          {[
            { icon: <Zap />, title: "Instant Logistics", desc: "Our localized delivery network ensures products reach you in record time." },
            { icon: <ShieldCheck />, title: "Locked Security", desc: "Every transaction is shielded by Gura's advanced encryption standards." },
            { icon: <ShoppingCart />, title: "One-Stop Market", desc: "From groceries to high-end electronics, we have it all under one roof." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-6 p-4">
              <div className="text-primary p-5 bg-primary/10 w-fit rounded-3xl shadow-inner">
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 40 })}
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter">{item.title}</h3>
              <p className="text-[var(--text-s)] font-bold leading-relaxed text-lg">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-4 sm:px-[10%] bg-[var(--bg-main)]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="max-w-md">
            <div className="text-3xl font-black text-primary mb-8 italic tracking-tighter">GURA NEZA</div>
            <p className="text-[var(--text-s)] font-bold leading-loose text-lg italic">
              Redefining the shopping experience in Rwanda. We combine local authenticity with world-class digital innovation.
            </p>
          </div>
          <div className="flex flex-wrap gap-24">
            <div>
              <h4 className="font-black mb-8 uppercase tracking-[0.3em] text-[10px] text-primary">Discover</h4>
              <ul className="flex flex-col gap-5 text-[var(--text-s)] font-black text-xs uppercase tracking-widest">
                <li><Link to="/products" className="hover:text-primary transition-colors">Marketplace</Link></li>
                <li><Link to="/products" className="hover:text-primary transition-colors">Trending Now</Link></li>
                <li><Link to="/products" className="hover:text-primary transition-colors">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-8 uppercase tracking-[0.3em] text-[10px] text-primary">Service</h4>
              <ul className="flex flex-col gap-5 text-[var(--text-s)] font-black text-xs uppercase tracking-widest">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-12 border-t border-[var(--border-c)] text-center text-[var(--text-s)] text-[10px] font-black uppercase tracking-[0.4em]">
          &copy; 2026 GURA NEZA GLOBAL. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
