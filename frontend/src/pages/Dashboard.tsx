import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/store';
import { walletService, type TransactionResponse } from '../services/walletService';
import { orderService, type OrderResponse } from '../services/orderService';
import Navbar from '../components/Navbar';

const Dashboard: React.FC = () => {
  const { user } = useStore();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txns, ords] = await Promise.all([
          walletService.getTransactions(),
          orderService.getOrders(),
        ]);
        setTransactions(txns);
        setOrders(ords);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-5xl mx-auto pb-20">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-p)] mb-2 italic tracking-tighter">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="text-[var(--text-s)] font-bold">Here's your account overview.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Wallet Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] overflow-hidden shadow-xl shadow-primary/20"
            style={{
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Gura Wallet Balance
                </span>
                <Wallet size={26} color="rgba(255,255,255,0.5)" />
              </div>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.25rem', fontStyle: 'italic', letterSpacing: '-1px' }}>
                ${(user?.walletBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Available balance
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Link to="/wallet">
                <button style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.25)',
                  padding: '0.6rem 1.4rem',
                  borderRadius: '50px',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                }}>
                  View Wallet
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--card-bg)] border border-[var(--border-c)] rounded-[2rem] p-6 flex flex-col justify-center"
            >
              <ShoppingBag size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <span className="text-[var(--text-s)] text-xs font-black uppercase tracking-widest mb-1">Orders</span>
              {loading ? (
                <Loader2 size={20} className="animate-spin text-primary" />
              ) : (
                <h3 className="text-2xl font-black text-[var(--text-p)] italic">{orders.length}</h3>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[var(--card-bg)] border border-[var(--border-c)] rounded-[2rem] p-6 flex flex-col justify-center"
            >
              <History size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <span className="text-[var(--text-s)] text-xs font-black uppercase tracking-widest mb-1">Transactions</span>
              {loading ? (
                <Loader2 size={20} className="animate-spin text-primary" />
              ) : (
                <h3 className="text-2xl font-black text-[var(--text-p)] italic">{transactions.length}</h3>
              )}
            </motion.div>
          </div>
        </div>

        {/* Recent Transactions */}
        <section>
          <h2 className="text-xl font-black text-[var(--text-p)] mb-6 flex items-center gap-3 italic tracking-tighter">
            <History size={22} className="text-primary" /> Recent Transactions
          </h2>

          <div className="bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border-c)] overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 opacity-30">
                <History size={48} />
                <p className="font-black uppercase tracking-widest text-[10px] mt-4">No transactions yet</p>
              </div>
            ) : (
              transactions.slice(0, 5).map((t, i) => (
                <div
                  key={t.id}
                  className={`px-8 py-5 flex justify-between items-center hover:bg-[var(--hover-c)] transition-all ${
                    i !== Math.min(transactions.length, 5) - 1 ? 'border-b border-[var(--border-c)]' : ''
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        t.type === 'DEBIT'
                          ? 'bg-red/10 text-red'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {t.type === 'DEBIT' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[var(--text-p)]">
                        {t.description || (t.type === 'CREDIT' ? 'Wallet Top-up' : 'Order Payment')}
                      </h4>
                      <span className="text-[10px] font-bold text-[var(--text-s)]">
                        {new Date(t.timestamp).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-black text-base italic ${
                      t.type === 'DEBIT' ? 'text-red' : 'text-primary'
                    }`}
                  >
                    {t.type === 'DEBIT' ? '-' : '+'}${Number(t.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          {transactions.length > 5 && (
            <div className="text-center mt-6">
              <Link to="/wallet" className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline">
                View all transactions →
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
