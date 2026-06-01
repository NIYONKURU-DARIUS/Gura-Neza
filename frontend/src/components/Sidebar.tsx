import React from 'react';
import {
  LayoutGrid, ShoppingBag, SlidersHorizontal, Package,
  Zap, Utensils, Scissors, Sparkles, Trophy,
  Layers, Heart, TrendingUp, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  className?: string;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
  maxPrice?: number;
  onMaxPriceChange?: (value: number) => void;
  trendingFirst?: boolean;
  onTrendingFirstChange?: (value: boolean) => void;
  highlyRated?: boolean;
  onHighlyRatedChange?: (value: boolean) => void;
  absoluteMaxPrice?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  onCategoryChange,
  selectedCategory = 'ALL',
  maxPrice = 2000,
  onMaxPriceChange,
  trendingFirst = false,
  onTrendingFirstChange,
  highlyRated = false,
  onHighlyRatedChange,
  absoluteMaxPrice = 2000,
}) => {
  const categories = [
    { name: 'All Products',   icon: <ShoppingBag size={18} />, value: 'ALL' },
    { name: 'Electronics',    icon: <Zap size={18} />,         value: 'ELECTRONICS' },
    { name: 'Food & Gourmet', icon: <Utensils size={18} />,    value: 'FOOD' },
    { name: 'Clothing',       icon: <Scissors size={18} />,    value: 'CLOTHING' },
    { name: 'Beauty',         icon: <Sparkles size={18} />,    value: 'BEAUTY' },
    { name: 'Sports',         icon: <Trophy size={18} />,      value: 'SPORTS' },
    { name: 'Others',         icon: <Layers size={18} />,      value: 'OTHER' },
  ];

  // Percentage fill for the range track
  const fillPct = absoluteMaxPrice > 0 ? (maxPrice / absoluteMaxPrice) * 100 : 100;

  return (
    <aside className={`w-80 h-full p-8 flex flex-col gap-10 bg-[var(--bg-main)] border-r border-[var(--border-c)] overflow-y-auto custom-scrollbar transition-colors duration-500 ${className}`}>
      <div className="px-2 mb-2">
        <div className="flex items-center gap-3 text-primary uppercase tracking-[0.3em] font-black text-[10px]">
          <LayoutGrid size={14} /> Ecosystem Control
        </div>
      </div>

      {/* ── Categories ── */}
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

      {/* ── Fine Tune ── */}
      <section className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-c)]">
        <div className="flex items-center gap-3 text-primary uppercase tracking-[0.3em] font-black text-[10px] mb-6">
          <SlidersHorizontal size={14} /> Fine Tune
        </div>

        <div className="space-y-6">
          {/* Price ceiling slider */}
          <div>
            <div className="flex justify-between items-center mb-3 text-[9px] font-black uppercase text-[var(--text-s)]">
              <span>Price Ceiling</span>
              <span className="text-primary font-mono">${maxPrice.toLocaleString()}</span>
            </div>
            <div className="relative h-5 flex items-center">
              {/* Track background */}
              <div className="absolute w-full h-1 bg-[var(--border-c)] rounded-full" />
              {/* Filled portion */}
              <div
                className="absolute h-1 bg-primary rounded-full pointer-events-none"
                style={{ width: `${fillPct}%` }}
              />
              {/* Range input */}
              <input
                type="range"
                min={0}
                max={absoluteMaxPrice}
                step={10}
                value={maxPrice}
                onChange={e => onMaxPriceChange?.(Number(e.target.value))}
                className="relative w-full appearance-none bg-transparent cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:shadow-primary/40
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-primary
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-white
                  [&::-moz-range-thumb]:shadow-md"
              />
            </div>
            <div className="flex justify-between text-[8px] font-black text-[var(--text-s)] mt-1 opacity-50">
              <span>$0</span>
              <span>${absoluteMaxPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Sort toggles */}
          <div className="flex flex-col gap-3">
            {/* Trending First */}
            <button
              onClick={() => onTrendingFirstChange?.(!trendingFirst)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                trendingFirst
                  ? 'bg-primary/10 border border-primary/30'
                  : 'border border-[var(--border-c)] hover:border-primary/30 hover:bg-primary/5'
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                trendingFirst ? 'bg-primary border-primary' : 'border-[var(--border-c)] group-hover:border-primary'
              }`}>
                {trendingFirst && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <TrendingUp size={13} className={trendingFirst ? 'text-primary' : 'text-[var(--text-s)] group-hover:text-primary'} />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                trendingFirst ? 'text-primary' : 'text-[var(--text-s)] group-hover:text-[var(--text-p)]'
              }`}>Trending First</span>
            </button>

            {/* Highly Rated */}
            <button
              onClick={() => onHighlyRatedChange?.(!highlyRated)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                highlyRated
                  ? 'bg-primary/10 border border-primary/30'
                  : 'border border-[var(--border-c)] hover:border-primary/30 hover:bg-primary/5'
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                highlyRated ? 'bg-primary border-primary' : 'border-[var(--border-c)] group-hover:border-primary'
              }`}>
                {highlyRated && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <Star size={13} className={highlyRated ? 'text-primary' : 'text-[var(--text-s)] group-hover:text-primary'} />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                highlyRated ? 'text-primary' : 'text-[var(--text-s)] group-hover:text-[var(--text-p)]'
              }`}>Highly Rated</span>
            </button>
          </div>

          {/* Active filter summary */}
          {(trendingFirst || highlyRated || maxPrice < absoluteMaxPrice) && (
            <div className="pt-3 border-t border-[var(--border-c)] flex flex-wrap gap-1.5">
              {maxPrice < absoluteMaxPrice && (
                <span className="text-[8px] font-black bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                  ≤ ${maxPrice.toLocaleString()}
                </span>
              )}
              {trendingFirst && (
                <span className="text-[8px] font-black bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                  Trending
                </span>
              )}
              {highlyRated && (
                <span className="text-[8px] font-black bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                  Top Rated
                </span>
              )}
              <button
                onClick={() => {
                  onMaxPriceChange?.(absoluteMaxPrice);
                  onTrendingFirstChange?.(false);
                  onHighlyRatedChange?.(false);
                }}
                className="text-[8px] font-black text-[var(--text-s)] hover:text-red px-2 py-1 rounded-full border border-[var(--border-c)] hover:border-red/30 transition-all"
              >
                Clear all ×
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured banner ── */}
      <section className="mt-auto">
        <div className="bg-primary p-6 rounded-[2.5rem] text-white relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <Package className="mb-4 opacity-50" size={32} />
          <h4 className="text-xl font-black italic mb-2">Featured Picks</h4>
          <p className="text-[10px] font-bold opacity-80 leading-relaxed mb-6">
            Hand-picked premium products from top Rwandan sellers.
          </p>
          <button
            onClick={() => onCategoryChange?.('ALL')}
            className="w-full bg-white text-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all"
          >
            Browse Featured
          </button>
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;
