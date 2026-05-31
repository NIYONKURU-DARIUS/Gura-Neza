import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, CreditCard, ShieldCheck, Wallet,
  ArrowRight, Loader2, ShoppingBag, AlertTriangle, Clock
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useStore } from '../context/store';
import { orderService, type PaymentMethod } from '../services/orderService';
import { walletService } from '../services/walletService';

const Checkout: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WALLET');
  // Live wallet balance fetched fresh from server — not from stale store
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const { cart, user, setUser, clearCart, fetchCart } = useStore();
  const navigate = useNavigate();

  // On mount: ensure cart is loaded AND fetch fresh wallet balance from server
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Always fetch cart to make sure it's current
      await fetchCart();

      // Fetch live wallet balance directly from wallet endpoint
      try {
        const wallet = await walletService.getWallet();
        if (!cancelled) {
          setLiveBalance(Number(wallet.balance));
          // Also sync the store so Navbar shows correct balance
          if (user) setUser({ ...user, walletBalance: Number(wallet.balance) });
        }
      } catch {
        // Fallback to store value if wallet fetch fails
        if (!cancelled) setLiveBalance(Number(user?.walletBalance ?? 0));
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = cart.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity, 0
  );

  // Use live balance if loaded, otherwise fall back to store
  const walletBalance = liveBalance !== null ? liveBalance : Number(user?.walletBalance ?? 0);
  const remainingBalance = walletBalance - total;
  const isWalletInsufficient = paymentMethod === 'WALLET' && walletBalance < total;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setError('');
    try {
      await orderService.checkout(paymentMethod);
      await clearCart();
      // Refresh wallet balance after successful order
      try {
        const wallet = await walletService.getWallet();
        const newBalance = Number(wallet.balance);
        setLiveBalance(newBalance);
        if (user) setUser({ ...user, walletBalance: newBalance });
      } catch { /* non-critical */ }
      setIsSuccess(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Failed to place order. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsProcessing(false);
    }
  };

  /* ── SUCCESS ──────────────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 font-body">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[var(--card-bg)] p-10 sm:p-16 rounded-[2.5rem] text-center shadow-2xl border border-primary/20 w-full max-w-lg relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(14)].map((_, i) => (
              <motion.div key={i}
                initial={{ y: -20, opacity: 1 }}
                animate={{ y: 700, opacity: 0, rotate: 360 }}
                transition={{ duration: 2.5, delay: Math.random() * 1.5, repeat: Infinity }}
                className="absolute w-2 h-3 bg-primary rounded-full"
                style={{ left: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary relative">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, delay: 0.2 }}>
              <CheckCircle2 size={48} />
            </motion.div>
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-p)] mb-3 italic tracking-tighter">
            Order Placed!
          </h2>
          <p className="text-sm text-[var(--text-s)] font-bold mb-4 max-w-sm mx-auto leading-relaxed">
            Your order has been submitted. Our team will confirm it shortly.
          </p>
          {paymentMethod === 'PAY_LATER' && (
            <div className="bg-amber/10 border border-amber/20 text-amber rounded-xl p-3 mb-5 text-xs font-black uppercase tracking-tight">
              Pay Later — payment collected on delivery
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/orders')} className="btn-primary px-8 py-4 rounded-xl text-sm">
              View My Orders
            </button>
            <button onClick={() => navigate('/products')}
              className="bg-[var(--bg-main)] text-[var(--text-p)] font-black px-8 py-4 rounded-xl text-sm border border-[var(--border-c)] hover:bg-[var(--hover-c)] transition-all">
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── EMPTY CART ───────────────────────────────────────────────────── */
  if (!balanceLoading && cart.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] font-body">
        <Navbar />
        <div className="pt-32 flex flex-col items-center justify-center px-4 text-center">
          <ShoppingBag size={56} className="text-[var(--text-s)] opacity-20 mb-5" />
          <h2 className="text-2xl font-black text-[var(--text-p)] italic mb-2">Your cart is empty</h2>
          <p className="text-[var(--text-s)] font-bold mb-6 text-sm">Add some items before checking out.</p>
          <Link to="/products" className="btn-primary px-8 py-4 rounded-xl text-sm">Browse Products</Link>
        </div>
      </div>
    );
  }

  /* ── LOADING ──────────────────────────────────────────────────────── */
  if (balanceLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] font-body">
        <Navbar />
        <div className="pt-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  /* ── MAIN ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500 pb-20">
      <Navbar />
      <main className="pt-28 px-4 sm:px-6 lg:px-[5%] max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-p)] mb-8 italic tracking-tighter">
          Checkout
        </h1>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">

          {/* ── LEFT ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-3 bg-red/10 border border-red/20 text-red p-4 rounded-2xl">
                  <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                  <span className="font-black text-xs leading-relaxed">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Payment method */}
            <section className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-c)] shadow-sm">
              <h3 className="text-sm font-black mb-4 italic flex items-center gap-2">
                <CreditCard size={18} className="text-primary" /> Payment Method
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPaymentMethod('WALLET')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'WALLET'
                      ? 'border-primary bg-primary/5'
                      : 'border-[var(--border-c)] hover:border-primary/40'
                  }`}>
                  <Wallet size={22} className={paymentMethod === 'WALLET' ? 'text-primary' : 'text-[var(--text-s)]'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Gura Wallet</span>
                  <span className="text-[9px] font-bold text-[var(--text-s)]">
                    Balance: ${walletBalance.toFixed(2)}
                  </span>
                  {paymentMethod === 'WALLET' && (
                    <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </button>

                <button onClick={() => setPaymentMethod('PAY_LATER')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'PAY_LATER'
                      ? 'border-amber bg-amber/5'
                      : 'border-[var(--border-c)] hover:border-amber/40'
                  }`}>
                  <Clock size={22} className={paymentMethod === 'PAY_LATER' ? 'text-amber' : 'text-[var(--text-s)]'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pay Later</span>
                  <span className="text-[9px] font-bold text-[var(--text-s)]">Pay on delivery</span>
                  {paymentMethod === 'PAY_LATER' && (
                    <span className="text-[8px] font-black text-amber uppercase bg-amber/10 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </button>
              </div>

              {/* Wallet breakdown */}
              {paymentMethod === 'WALLET' && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-c)]">
                    <span className="text-[10px] font-black uppercase text-[var(--text-s)] tracking-widest">Your Balance</span>
                    <span className="font-black text-sm text-[var(--text-p)]">${walletBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red/5 rounded-xl border border-red/10">
                    <span className="text-[10px] font-black uppercase text-red tracking-widest">Order Total</span>
                    <span className="font-black text-sm text-red">−${total.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-xl border ${
                    isWalletInsufficient ? 'bg-red/5 border-red/20' : 'bg-primary/5 border-primary/10'
                  }`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      isWalletInsufficient ? 'text-red' : 'text-primary'
                    }`}>After Payment</span>
                    <span className={`font-black text-sm ${isWalletInsufficient ? 'text-red' : 'text-primary'}`}>
                      ${remainingBalance.toFixed(2)}
                    </span>
                  </div>
                  {isWalletInsufficient && (
                    <div className="flex items-center gap-2 p-3 bg-red/10 rounded-xl border border-red/20">
                      <AlertTriangle size={14} className="text-red flex-shrink-0" />
                      <span className="text-[10px] font-black text-red leading-snug">
                        Insufficient balance — top up your wallet or switch to Pay Later
                      </span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'PAY_LATER' && (
                <div className="mt-4 p-3 bg-amber/5 rounded-xl border border-amber/20">
                  <p className="text-[10px] font-black text-amber leading-snug">
                    No payment now. Amount collected when your order is delivered.
                  </p>
                </div>
              )}
            </section>

            {/* Buyer protection */}
            <section className="bg-primary p-5 rounded-[2rem] text-white flex items-center gap-4 shadow-xl shadow-primary/20">
              <div className="p-2.5 bg-white/20 rounded-xl flex-shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black italic">Buyer Protection</h4>
                <p className="text-xs font-bold opacity-75 leading-snug mt-0.5">
                  Money-back guarantee if delivery fails within 48h.
                </p>
              </div>
            </section>
          </div>

          {/* ── RIGHT ─────────────────────────────────────────────────── */}
          <div>
            <section className="bg-[var(--card-bg)] p-6 sm:p-8 rounded-[2rem] border border-[var(--border-c)] shadow-sm">
              <h3 className="text-lg font-black mb-5 italic">Order Summary</h3>

              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-[var(--bg-main)] rounded-lg flex-shrink-0 overflow-hidden border border-[var(--border-c)]">
                        <img src={item.product.imageUrl} alt={item.product.name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <span className="text-xs font-bold text-[var(--text-s)] truncate">
                        {item.product.name}
                        <span className="text-[10px] font-black ml-1">×{item.quantity}</span>
                      </span>
                    </div>
                    <span className="font-black text-sm text-[var(--text-p)] flex-shrink-0">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-[var(--border-c)] mb-4" />

              <div className="flex justify-between items-center mb-5">
                <span className="text-base font-black italic tracking-tighter">Total</span>
                <span className="text-2xl font-black text-primary italic">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || isWalletInsufficient || cart.length === 0}
                className="w-full btn-primary py-5 rounded-2xl text-sm flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
              >
                {isProcessing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    {paymentMethod === 'PAY_LATER' ? 'Place Order — Pay Later' : 'Confirm & Pay'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-[var(--text-s)] font-bold text-[10px] uppercase tracking-widest mt-3 opacity-40">
                Encrypted &amp; Secure
              </p>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Checkout;
