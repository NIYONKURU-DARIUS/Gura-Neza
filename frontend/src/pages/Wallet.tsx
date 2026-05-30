import React from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, History, ChevronRight, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useStore } from '../context/store';

const Wallet: React.FC = () => {
  const { user } = useStore();
  
  const transactions = [
    { id: 1, type: 'DEBIT', amount: 299.99, title: 'Premium Emerald Watch', date: 'Oct 24, 2026', time: '14:20' },
    { id: 2, type: 'CREDIT', amount: 1500.00, title: 'Wallet Top-up via Mobile Money', date: 'Oct 22, 2026', time: '09:45' },
    { id: 3, type: 'DEBIT', amount: 45.50, title: 'Fresh Food Basket', date: 'Oct 20, 2026', time: '18:12' },
    { id: 4, type: 'DEBIT', amount: 1299.00, title: 'MacBook Pro M3 Mock', date: 'Oct 15, 2026', time: '11:05' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-5xl mx-auto pb-20">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-[var(--text-p)] mb-2 italic tracking-tighter">My Wallet</h1>
          <p className="text-[var(--text-s)] font-bold">Secure digital payments and transaction history.</p>
        </header>

        {/* Balance Card Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] p-8 sm:p-12 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden mb-16 group"
        >
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse-slow pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-16">
              <div>
                <span className="text-white/70 font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">Available Gura Balance</span>
                <h2 className="text-5xl sm:text-7xl font-mono-price font-black tracking-tighter drop-shadow-lg scale-100 group-hover:scale-105 transition-transform duration-700">
                  ${user?.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="w-16 h-16 sm:w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-3xl border border-white/20 shadow-2xl">
                <WalletIcon size={36} className="text-white" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-8 pt-4">
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none bg-white text-primary px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-110 active:scale-95 transition-all shadow-xl">
                  <Plus size={24} /> Top Up
                </button>
                <button className="flex-1 sm:flex-none bg-black/20 text-white border border-white/30 px-8 py-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                  Send Money
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-right">
                <div className="hidden sm:block">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Verified Identity</div>
                  <div className="font-black text-sm tracking-tighter italic">{user?.name.toUpperCase()}</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                   {user?.name?.[0] || <User size={28} />}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transaction History Section */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-black text-[var(--text-p)] flex items-center gap-4 italic tracking-tight">
              <History className="text-primary" /> Transactions
            </h3>
            <button className="text-xs font-black text-primary flex items-center gap-1 hover:underline uppercase tracking-widest">
              View Analytics <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-[var(--card-bg)] rounded-[3rem] border border-[var(--border-c)] shadow-sm overflow-hidden transition-colors duration-500">
            <div className="flex flex-col">
              {transactions.map((t, i) => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 sm:p-8 flex items-center justify-between hover:bg-[var(--hover-c)] transition-all cursor-pointer group ${i !== transactions.length - 1 ? 'border-b border-[var(--border-c)]' : ''}`}
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className={`w-12 h-12 sm:w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${t.type === 'CREDIT' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-red/10 text-red group-hover:bg-red group-hover:text-white'}`}>
                      {t.type === 'CREDIT' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                    </div>
                    <div>
                      <h4 className="font-black text-[var(--text-p)] text-base sm:text-lg mb-1 tracking-tight">{t.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] font-black text-[var(--text-s)] uppercase tracking-widest">
                        <span>{t.date}</span>
                        <span className="opacity-30">•</span>
                        <span>{t.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl sm:text-2xl font-mono-price font-black italic ${t.type === 'CREDIT' ? 'text-primary' : 'text-[var(--text-p)]'}`}>
                      {t.type === 'CREDIT' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] font-black uppercase text-[var(--text-s)] mt-1 opacity-60 tracking-tighter">SUCCESS</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Wallet;
