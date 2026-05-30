import React from 'react';
import { 
  LayoutGrid, ShoppingBag, Shirt, Heart, Laptop, 
  Search, SlidersHorizontal, Star, CheckCircle2,
  Clock, Truck, RotateCcw
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <aside className={`w-80 h-full p-10 flex flex-col gap-12 bg-[var(--bg-main)] border-r border-[var(--border-c)] overflow-y-auto custom-scrollbar transition-colors duration-500 ${className}`}>
      {/* Search Mini */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-s)] group-focus-within:text-primary transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Quick find..."
          className="w-full pl-12 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--border-c)] rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-sm text-[var(--text-p)]"
        />
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center gap-3 mb-8 text-primary uppercase tracking-[0.3em] font-black text-[10px]">
          <LayoutGrid size={14} /> Shop Categories
        </div>
        <div className="flex flex-col gap-2">
          {[
            { name: 'All Products', icon: <ShoppingBag size={18} />, active: true },
            { name: 'Electronics', icon: <Laptop size={18} /> },
            { name: 'Fashion', icon: <Shirt size={18} /> },
            { name: 'Lifestyle', icon: <Heart size={18} /> },
          ].map((cat, i) => (
            <button 
              key={i} 
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${cat.active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-[var(--text-s)] hover:bg-[var(--card-bg)] hover:text-[var(--text-p)]'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Price Filter */}
      <section>
        <div className="flex items-center justify-between mb-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">
          <div className="flex items-center gap-3 text-primary"><SlidersHorizontal size={14} /> Price Range</div>
          <span className="text-primary">$0 - $2k</span>
        </div>
        <div className="px-2">
          <div className="h-1.5 w-full bg-[var(--border-c)] rounded-full relative">
            <div className="absolute left-0 right-1/4 h-full bg-primary rounded-full shadow-[0_0_10px_rgba(76,175,80,0.5)]" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg cursor-pointer" />
            <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg cursor-pointer" />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="mt-auto pt-10 border-t border-[var(--border-c)]">
        <div className="space-y-6">
            {[
                { icon: <CheckCircle2 size={16} />, label: 'Verified Sellers' },
                { icon: <Truck size={16} />, label: 'Fast Logistics' },
                { icon: <RotateCcw size={16} />, label: 'Easy Returns' }
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-[10px] font-black text-[var(--text-s)] uppercase tracking-widest">
                    <div className="text-primary">{item.icon}</div>
                    {item.label}
                </div>
            ))}
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;
