import React, { useState } from 'react';
import { 
  Search, ShoppingCart, User, Moon, Sun, 
  LogOut, Settings, Wallet, History, ChevronDown 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/store';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { user, cart, isDarkMode, toggleDarkMode, logout } = useStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearch?.(val);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[var(--navbar-bg)] border-b border-[var(--border-c)] h-20 px-4 sm:px-[5%] flex items-center justify-between transition-colors duration-500">
      {/* Logo & Navigation */}
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
             <span className="text-white font-black text-xl italic">G</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-primary tracking-tighter italic transition-all hidden sm:block">
            GURA NEZA
          </span>
        </Link>

        {/* Global Nav */}
        <div className="hidden lg:flex items-center gap-8">
           <Link to="/products" className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-s)] hover:text-primary transition-all px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-c)] rounded-xl shadow-sm">
             Marketplace
           </Link>
        </div>
      </div>

      {/* Search Bar - Center */}
      <div className="hidden md:flex relative w-full max-w-lg mx-8 group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-s)] group-focus-within:text-primary transition-colors">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search items..."
          value={searchVal}
          onChange={handleSearchChange}
          className="w-full bg-[var(--input-bg)] px-12 py-2.5 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-[var(--text-p)] border border-[var(--border-c)]"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-c)] text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Wallet Chip */}
        {user && user.role !== 'ADMIN' && (
          <Link to="/wallet" className="hidden sm:flex items-center gap-3 bg-[var(--input-bg)] px-4 py-2 rounded-xl border border-[var(--border-c)] shadow-sm hover:border-primary/30 transition-all">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-mono-price font-bold text-primary text-sm">
              ${user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </Link>
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
          
          {/* Avatar Dropdown */}
          <div className="relative border-l border-[var(--border-c)] pl-2 sm:pl-4">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black relative shadow-lg shadow-primary/20">
                {user?.name?.[0] || <User size={20} />}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[var(--bg-main)] rounded-full animate-pulse" />
              </div>
              <ChevronDown className={`text-[var(--text-s)] transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 bg-[var(--card-bg)] border border-[var(--border-c)] rounded-[2rem] shadow-2xl z-50 overflow-hidden p-3"
                  >
                    <div className="px-4 py-4 mb-2 border-b border-[var(--border-c)]">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{user?.role}</p>
                      <p className="text-sm font-black text-[var(--text-p)] truncate">{user?.name}</p>
                      <p className="text-[10px] text-[var(--text-s)] font-bold truncate">{user?.email}</p>
                    </div>

                    <div className="space-y-1">
                      {user?.role === 'ADMIN' ? (
                        <Link to="/admin" className="dropdown-item">
                           <History size={16} /> Admin Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link to="/dashboard" className="dropdown-item">
                            <User size={16} /> My Dashboard
                          </Link>
                          <Link to="/wallet" className="dropdown-item">
                            <Wallet size={16} /> Gura Wallet
                          </Link>
                          <Link to="/orders" className="dropdown-item">
                             <History size={16} /> My Orders
                          </Link>
                        </>
                      )}
                      <Link to="/settings" className="dropdown-item">
                        <Settings size={16} /> Settings
                      </Link>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[var(--border-c)]">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red hover:bg-red/5 transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <LogOut size={16} /> Logout Session
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
