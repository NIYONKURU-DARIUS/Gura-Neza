import React from 'react';
import { Search, ShoppingCart, User, Bell, Sun, Moon, SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/store';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const { user, cart, isDarkMode, toggleDarkMode } = useStore();
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-[var(--navbar-bg)] border-b border-[var(--border-c)] h-20 px-4 sm:px-[5%] flex items-center justify-between transition-colors duration-500">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
           <span className="text-white font-black text-xl italic">G</span>
        </div>
        <span className="text-xl sm:text-2xl font-black text-primary tracking-tighter font-headers italic group-hover:shadow-primary/20 transition-all">
          GURA NEZA
        </span>
      </Link>

      {/* Search Bar - Center */}
      <div className="hidden md:flex relative w-full max-w-lg mx-8 group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-s)] group-focus-within:text-primary transition-colors">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search items..."
          className="w-full bg-[var(--input-bg)] px-12 py-2.5 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-[var(--text-p)] border border-[var(--border-c)]"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[var(--bg-main)] px-2 py-0.5 rounded text-[10px] font-black text-[var(--text-s)] border border-[var(--border-c)]">
          ⌘ K
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Dark Mode Toggle */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-c)] text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {/* Wallet Chip */}
        {user && (
          <div className="hidden sm:flex items-center gap-3 bg-[var(--input-bg)] px-4 py-2 rounded-xl border border-[var(--border-c)] shadow-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-mono-price font-bold text-primary text-sm">
              ${user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Icons */}
        <div className="flex items-center gap-2 sm:gap-5">
          <Link to="/cart" className="relative p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-c)] text-[var(--text-p)] hover:text-primary transition-all shadow-sm group">
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                {cart.length}
              </span>
            )}
          </Link>
          
          {/* Avatar */}
          <Link to="/dashboard" className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-[var(--border-c)] group">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black relative shadow-lg shadow-primary/20">
              {user?.name?.[0] || <User size={20} />}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[var(--bg-main)] rounded-full animate-pulse" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
