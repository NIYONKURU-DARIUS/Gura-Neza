import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft,
  Plus, History, Loader2, X, CheckCircle2, Clock, XCircle, AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useStore } from '../context/store';
import { walletService, type TransactionResponse, type TopUpRequestDto } from '../services/walletService';

const STATUS_STYLES = {
  PENDING:  'bg-amber/10 text-amber border-amber/20',
  APPROVED: 'bg-primary/10 text-primary border-primary/20',
  REJECTED: 'bg-red/10 text-red border-red/20',
};

const STATUS_ICONS = {
  PENDING:  <Clock size={14} />,
  APPROVED: <CheckCircle2 size={14} />,
  REJECTED: <XCircle size={14} />,
};

const Wallet: React.FC = () => {
  const { user, setUser } = useStore();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [requests, setRequests] = useState<TopUpRequestDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-up modal state
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const [txns, reqs, wallet] = await Promise.all([
        walletService.getTransactions(),
        walletService.getMyRequests(),
        walletService.getWallet(),
      ]);
      setTransactions(txns);
      setRequests(reqs);
      // Sync wallet balance
      if (user) setUser({ ...user, walletBalance: Number(wallet.balance) });
    } catch (err) {
      console.error('Failed to fetch wallet data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequestTopUp = async () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setModalError('Please enter a valid amount greater than zero.');
      return;
    }
    setSubmitting(true);
    setModalError('');
    try {
      await walletService.requestTopUp(parsed);
      setModalSuccess(true);
      setAmount('');
      await fetchData();
      setTimeout(() => {
        setShowModal(false);
        setModalSuccess(false);
      }, 2000);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setAmount('');
    setModalError('');
    setModalSuccess(false);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-5xl mx-auto pb-20">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-[var(--text-p)] mb-2 italic tracking-tighter">My Wallet</h1>
          <p className="text-[var(--text-s)] font-bold">Secure digital payments and transaction history.</p>
        </header>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] p-8 sm:p-12 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden mb-10 group"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-white/70 font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">Available Balance</span>
                <h2 className="text-5xl sm:text-6xl font-black tracking-tighter drop-shadow-lg">
                  ${Number(user?.walletBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center border border-white/20">
                <WalletIcon size={32} className="text-white" />
              </div>
            </div>
            <button
              onClick={openModal}
              className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <Plus size={20} /> Request Top Up
            </button>
          </div>
        </motion.div>

        {/* Top-up Requests History */}
        {requests.length > 0 && (
          <section className="mb-10">
            <h3 className="text-xl font-black text-[var(--text-p)] mb-5 flex items-center gap-3 italic tracking-tighter">
              <Clock size={20} className="text-primary" /> Top-Up Requests
            </h3>
            <div className="bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border-c)] overflow-hidden shadow-sm">
              {requests.map((r, i) => (
                <div key={r.id} className={`px-6 py-4 flex items-center justify-between ${i !== requests.length - 1 ? 'border-b border-[var(--border-c)]' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${STATUS_STYLES[r.status]}`}>
                      {STATUS_ICONS[r.status]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[var(--text-p)]">Top-up Request</p>
                      <p className="text-[10px] font-bold text-[var(--text-s)]">
                        {new Date(Array.isArray(r.createdAt)
                          ? new Date((r.createdAt as any)[0], (r.createdAt as any)[1]-1, (r.createdAt as any)[2]).toISOString()
                          : r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-base text-[var(--text-p)]">${Number(r.amount).toFixed(2)}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Transaction History */}
        <section>
          <h3 className="text-xl font-black text-[var(--text-p)] mb-5 flex items-center gap-3 italic tracking-tighter">
            <History size={20} className="text-primary" /> Transactions
          </h3>
          <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-c)] shadow-sm overflow-hidden min-h-[200px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-16">
                <History size={48} />
                <p className="font-black uppercase tracking-widest text-[10px] mt-4">No transactions yet</p>
              </div>
            ) : (
              transactions.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-5 sm:p-6 flex items-center justify-between hover:bg-[var(--hover-c)] transition-all ${i !== transactions.length - 1 ? 'border-b border-[var(--border-c)]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${t.type === 'CREDIT' ? 'bg-primary/10 text-primary' : 'bg-red/10 text-red'}`}>
                      {t.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <h4 className="font-black text-[var(--text-p)] text-sm mb-0.5 truncate max-w-[200px] sm:max-w-sm">
                        {t.description || (t.type === 'CREDIT' ? 'Wallet Credit' : 'Order Payment')}
                      </h4>
                      <span className="text-[10px] font-bold text-[var(--text-s)]">
                        {new Date(Array.isArray(t.timestamp)
                          ? new Date((t.timestamp as any)[0], (t.timestamp as any)[1]-1, (t.timestamp as any)[2]).toISOString()
                          : t.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`font-black text-base italic ${t.type === 'CREDIT' ? 'text-primary' : 'text-[var(--text-p)]'}`}>
                    {t.type === 'CREDIT' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Top-up Request Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !submitting && setShowModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--card-bg)] w-full max-w-md rounded-[2rem] border border-[var(--border-c)] p-8 relative z-10 shadow-2xl">
              <button onClick={() => !submitting && setShowModal(false)}
                className="absolute top-5 right-5 text-[var(--text-s)] hover:text-red transition-colors">
                <X size={20} />
              </button>

              {modalSuccess ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={56} className="text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-black text-[var(--text-p)] italic mb-2">Request Submitted!</h3>
                  <p className="text-sm text-[var(--text-s)] font-bold">Your top-up request is pending admin review.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black italic tracking-tighter mb-2">Request Top Up</h2>
                  <p className="text-sm text-[var(--text-s)] font-bold mb-6">
                    Enter the amount you'd like to add to your wallet. An admin will review and approve your request.
                  </p>

                  <AnimatePresence>
                    {modalError && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-start gap-2 bg-red/10 border border-red/20 text-red p-3 rounded-xl mb-4">
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-black">{modalError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)] mb-2 block">
                        Amount (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--text-s)]">$</span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="0.00"
                          value={amount}
                          onChange={e => { setAmount(e.target.value); setModalError(''); }}
                          className="input-field pl-8 py-4 text-base font-black"
                          disabled={submitting}
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleRequestTopUp}
                      disabled={submitting || !amount || parseFloat(amount) <= 0}
                      className="w-full btn-primary py-4 rounded-2xl text-sm flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wallet;
