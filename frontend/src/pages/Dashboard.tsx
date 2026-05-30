import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, ShoppingBag, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const balance = 1250.00;
  
  const transactions = [
    { id: 1, type: 'DEBIT', amount: 299.99, title: 'Premium Emerald Watch', date: '2026-05-28' },
    { id: 2, type: 'CREDIT', amount: 500.00, title: 'Wallet Top-up', date: '2026-05-25' },
    { id: 3, type: 'DEBIT', amount: 45.50, title: 'Delivery Fee', date: '2026-05-24' }
  ];

  return (
    <div className="dashboard-page" style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Sidebar / Nav */}
      <nav className="glass" style={{
        padding: '1.5rem 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <Link to="/" style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.5rem' }}>GURA NEZA</Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/products" style={{ fontWeight: 600 }}>Shop</Link>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={20} />
          </div>
        </div>
      </nav>

      <main style={{ padding: '0 5% 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Wallet Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card" 
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #065f46 100%)', 
              color: 'white', 
              padding: '2.5rem',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '240px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <span style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: 500 }}>Gura Wallet Balance</span>
                <Wallet size={32} opacity={0.5} />
              </div>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>${balance.toLocaleString()}</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)', padding: '0.6rem 1.25rem' }}>Top Up</button>
              <button className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.6rem 1.25rem' }}>Send</button>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <ShoppingBag size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Recent Orders</span>
              <h3 style={{ fontSize: '1.5rem' }}>12</h3>
            </div>
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <History size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Transactions</span>
              <h3 style={{ fontSize: '1.5rem' }}>48</h3>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <section style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <History size={24} /> Recent Transactions
          </h2>
          <div className="card" style={{ padding: '0' }}>
            {transactions.map((t, i) => (
              <div key={t.id} style={{ 
                padding: '1.25rem 2rem', 
                borderBottom: i === transactions.length - 1 ? 'none' : '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: t.type === 'DEBIT' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: t.type === 'DEBIT' ? '#ef4444' : 'var(--primary)'
                  }}>
                    {t.type === 'DEBIT' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem' }}>{t.title}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.date}</span>
                  </div>
                </div>
                <span style={{ 
                  fontWeight: 700, 
                  color: t.type === 'DEBIT' ? '#ef4444' : 'var(--primary)',
                  fontSize: '1.1rem'
                }}>
                  {t.type === 'DEBIT' ? '-' : '+'}${t.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
