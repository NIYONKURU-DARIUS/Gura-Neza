import React, { useState } from 'react';
import { 
  LayoutGrid, ShoppingBag, SlidersHorizontal, Package,
  Zap, Utensils, Scissors, Sparkles, Trophy, 
  Layers, Heart
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className, onCategoryChange, selectedCategory = 'ALL' }) => {
  const categories = [
    { name: 'All Products', icon: <ShoppingBag size={18} />, value: 'ALL' },
    { name: 'Electronics', icon: <Zap size={18} />, value: 'ELECTRONICS' },
    { name: 'Food & Gourmet', icon: <Utensils size={18} />, value: 'FOOD' },
    { name: 'Clothing', icon: <Scissors size={18} />, value: 'CLOTHING' },
    { name: 'Beauty', icon: <Sparkles size={18} />, value: 'BEAUTY' },
    { name: 'Sports', icon: <Trophy size={18} />, value: 'SPORTS' },
    { name: 'Others', icon: <Layers size={18} />, value: 'OTHER' },
  ];

  return (
    <aside className={`w-80 h-full p-8 flex flex-col gap-10 bg-[var(--bg-main)] border-r border-[var(--border-c)] overflow-y-auto custom-scrollbar transition-colors duration-500 ${className}`}>
      <div className="px-2 mb-2">
        <div className="flex items-center gap-3 text-primary uppercase tracking-[0.3em] font-black text-[10px]">
          <LayoutGrid size={14} /> Ecosystem Control
        </div>
      </div>

      {/* Categories */}
      <section>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => onCategoryChange?.(cat.value)}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${
                selectedCategory === cat.value 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'text-[var(--text-s)] hover:bg-[var(--card-bg)] hover:text-primary'
              }`}
            >
              <div className={selectedCategory === cat.value ? 'text-white' : 'text-primary opacity-60'}>
                {cat.icon}
              </div>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Discovery Filters */}
      <section className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-c)]">
        <div className="flex items-center gap-3 text-primary uppercase tracking-[0.3em] font-black text-[10px] mb-6">
          <SlidersHorizontal size={14} /> Fine Tune
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3 text-[9px] font-black uppercase text-[var(--text-s)]">
              <span>Price Ceiling</span>
              <span className="text-primary font-mono">$2,000</span>
            </div>
            <div className="h-1 bg-[var(--border-c)] rounded-full overflow-hidden relative">
              <div className="absolute left-0 top-0 h-full w-2/3 bg-primary" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
             {[
               { icon: <Sparkles size={14} />, label: 'Trending First' },
               { icon: <Heart size={14} />, label: 'Highly Rated' },
             ].map((filter, i) => (
               <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded border-2 border-[var(--border-c)] group-hover:border-primary transition-colors flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-sm scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black text-[var(--text-s)] uppercase tracking-widest group-hover:text-[var(--text-p)]">{filter.label}</span>
               </label>
             ))}
          </div>
        </div>
      </section>

      <section className="mt-auto">
        <div className="bg-primary p-6 rounded-[2.5rem] text-white relative overflow-hidden group">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
           <Package className="mb-4 opacity-50" size={32} />
           <h4 className="text-xl font-black italic mb-2">Gura Prime</h4>
           <p className="text-[10px] font-bold opacity-80 leading-relaxed mb-6">Unlock zero delivery fees on all premium Rwandan crafts.</p>
           <button className="w-full bg-white text-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all">Join Pulse</button>
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;
