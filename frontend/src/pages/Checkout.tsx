import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Wallet, ArrowRight, Loader2,
  ShoppingBag, AlertTriangle, Clock, Package,
  Lock, Truck, ShieldCheck, RotateCcw, ChevronLeft, Sparkles
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useStore } from '../context/store';
import { orderService, type PaymentMethod } from '../services/orderService';
import { walletService } from '../services/walletService';
import { sayOrderPlaced } from '../services/speechService';

const Checkout: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WALLET');
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const { cart, user, setUser, clearCart, fetchCart } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await fetchCart();
      try {
        const wallet = await walletService.getWallet();
        if (!cancelled) {
          setLiveBalance(Number(wallet.balance));
          if (user) setUser({ ...user, walletBalance: Number(wallet.balance) });
        }
      } catch {
        if (!cancelled) setLiveBalance(Number(user?.walletBalance ?? 0));
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = cart.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0);
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
      try {
        const wallet = await walletService.getWallet();
        const nb = Number(wallet.balance);
        setLiveBalance(nb);
        if (user) setUser({ ...user, walletBalance: nb });
      } catch { /* non-critical */ }
      sayOrderPlaced(user?.name);
      setIsSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to place order.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsProcessing(false);
    }
  };

  /* ─── SUCCESS ─────────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 font-body overflow-hidden">
        {/* Full-screen confetti */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div key={i}
              initial={{ y: -20, opacity: 1, x: `${Math.random() * 100}vw` }}
              animate={{ y: '110vh', opacity: 0, rotate: 720 * (Math.random() > 0.5 ? 1 : -1) }}
              transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 1.2, ease: 'easeIn' }}
              className="absolute top-0 rounded-sm"
              style={{
                width: `${6 + Math.random() * 10}px`,
                height: `${6 + Math.random() * 10}px`,
                background: ['#2E7D32','#4CAF50','#FFD700','#FF8F00','#66BB6A','#ffffff','#a5f3fc'][i % 7],
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 16, stiffness: 180 }}
          className="relative w-full max-w-lg z-10"
        >
          <div className="bg-[var(--card-bg)] rounded-[3rem] overflow-hidden shadow-2xl border border-[var(--border-c)]">
            {/* Green gradient header */}
            <div className="bg-gradient-to-br from-primary via-green-600 to-emerald-700 px-10 pt-14 pb-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                  <div className="relative w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 10, delay: 0.3 }}
                    >
                      <CheckCircle2 size={52} className="text-white" />
                    </motion.div>
                  </div>
                </div>
                <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2">Order Placed!</h2>
                <p className="text-white/70 font-bold text-base">
                  {user?.name ? `Thank you, ${user.name.split(' ')[0]}!` : 'Thank you!'}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-10 py-8">
              <p className="text-sm text-[var(--text-s)] font-bold text-center mb-6 leading-relaxed">
                Your order has been submitted successfully. Our team will review and confirm it shortly.
              </p>

              {paymentMethod === 'PAY_LATER' && (
                <div className="flex items-center gap-3 bg-amber/10 border border-amber/20 text-amber rounded-2xl px-5 py-4 mb-6">
                  <Clock size={18} className="flex-shrink-0" />
                  <p className="text-sm font-black">Payment will be collected on delivery.</p>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button onClick={() => navigate('/orders')}
                  className="w-full bg-primary text-white font-black py-5 rounded-[2rem] text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all">
                  <Package size={20} /> View My Orders
                </button>
                <button onClick={() => navigate('/products')}
                  className="w-full py-5 rounded-[2rem] text-base font-black border-2 border-[var(--border-c)] text-[var(--text-s)] hover:border-primary/40 hover:text-primary transition-all">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── EMPTY CART ──────────────────────────────────────────────── */
  if (!balanceLoading && cart.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] font-body">
        <Navbar />
        <div className="pt-32 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-32 h-32 bg-[var(--card-bg)] rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--border-c)] shadow-sm">
            <ShoppingBag size={48} className="text-[var(--text-s)] opacity-30" />
          </div>
          <h2 className="text-4xl font-black text-[var(--text-p)] italic tracking-tighter mb-3">Your cart is empty</h2>
          <p className="text-[var(--text-s)] font-bold mb-10 text-lg">Add some items before checking out.</p>
          <Link to="/products" className="btn-primary px-14 py-5 rounded-[2rem] text-xl italic shadow-2xl shadow-primary/30">Browse Products</Link>
        </div>
      </div>
    );
  }

  /* ─── LOADING ─────────────────────────────────────────────────── */
  if (balanceLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] font-body">
        <Navbar />
        <div className="pt-32 flex flex-col items-center justify-center gap-5">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Loading checkout...</p>
        </div>
      </div>
    );
  }

  /* ─── MAIN ────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar />

      <main className="pt-32 px-4 sm:px-[5%] max-w-[1600px] mx-auto pb-32">

        {/* ── Page header — mirrors Cart page ── */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/cart"
            className="group flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--border-c)] px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary transition-all shadow-sm">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronLeft size={18} />
            </div>
            Back to Cart
          </Link>

          <div className="hidden sm:flex items-center gap-3 bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
            <Lock size={12} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">SSL Encrypted &amp; Secure</span>
          </div>
        </div>

        {/* ── Big heading — mirrors Cart page ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 text-primary mb-3">
            <Sparkles size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Secure Checkout</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-[var(--text-p)] mb-4 flex items-center gap-6 italic tracking-tighter">
            Complete Order <span className="text-primary italic">/ 0{cart.length}</span>
          </h1>
          <p className="text-[var(--text-s)] font-bold text-lg">Choose your payment method and confirm your purchase.</p>
        </div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-red/10 border border-red/20 text-red p-5 rounded-2xl mb-10">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="font-black text-sm leading-relaxed">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col xl:flex-row gap-12 xl:gap-20">

          {/* ════ LEFT COLUMN ════ */}
          <div className="flex-1 space-y-8">

            {/* ── Payment method card ── */}
            <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-c)] shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-[var(--border-c)] flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Wallet size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-p)] italic tracking-tighter">Payment Method</h3>
                  <p className="text-[9px] font-bold text-[var(--text-s)] uppercase tracking-widest mt-0.5">Choose how to pay</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Payment option cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Wallet card */}
                  <button onClick={() => setPaymentMethod('WALLET')}
                    className={`relative text-left p-7 rounded-[2rem] border-2 transition-all duration-200 group ${
                      paymentMethod === 'WALLET'
                        ? 'border-primary bg-gradient-to-br from-primary/8 to-primary/3 shadow-xl shadow-primary/10'
                        : 'border-[var(--border-c)] hover:border-primary/40 hover:shadow-lg'
                    }`}>
                    {paymentMethod === 'WALLET' && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute top-5 right-5 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                        <CheckCircle2 size={15} className="text-white" />
                      </motion.div>
                    )}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all ${
                      paymentMethod === 'WALLET'
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-[var(--bg-main)] text-[var(--text-s)] group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      <Wallet size={26} />
                    </div>
                    <p className="text-base font-black text-[var(--text-p)] italic tracking-tighter mb-1">Gura Wallet</p>
                    <p className="text-xs font-bold text-[var(--text-s)] mb-4">Instant deduction at checkout</p>
                    <div className={`text-3xl font-black italic tracking-tighter ${paymentMethod === 'WALLET' ? 'text-primary' : 'text-[var(--text-p)]'}`}>
                      ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[9px] font-bold text-[var(--text-s)] mt-1 uppercase tracking-widest">Available Balance</p>
                  </button>

                  {/* Pay Later card */}
                  <button onClick={() => setPaymentMethod('PAY_LATER')}
                    className={`relative text-left p-7 rounded-[2rem] border-2 transition-all duration-200 group ${
                      paymentMethod === 'PAY_LATER'
                        ? 'border-amber bg-gradient-to-br from-amber/8 to-amber/3 shadow-xl shadow-amber/10'
                        : 'border-[var(--border-c)] hover:border-amber/40 hover:shadow-lg'
                    }`}>
                    {paymentMethod === 'PAY_LATER' && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute top-5 right-5 w-7 h-7 bg-amber rounded-full flex items-center justify-center shadow-lg shadow-amber/30">
                        <CheckCircle2 size={15} className="text-white" />
                      </motion.div>
                    )}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all ${
                      paymentMethod === 'PAY_LATER'
                        ? 'bg-amber text-white shadow-lg shadow-amber/30'
                        : 'bg-[var(--bg-main)] text-[var(--text-s)] group-hover:bg-amber/10 group-hover:text-amber'
                    }`}>
                      <Clock size={26} />
                    </div>
                    <p className="text-base font-black text-[var(--text-p)] italic tracking-tighter mb-1">Pay on Delivery</p>
                    <p className="text-xs font-bold text-[var(--text-s)] mb-4">No charge until delivered</p>
                    <div className="text-3xl font-black italic tracking-tighter text-[var(--text-s)]">$0.00</div>
                    <p className="text-[9px] font-bold text-[var(--text-s)] mt-1 uppercase tracking-widest">Due Now</p>
                  </button>
                </div>

                {/* Wallet breakdown / Pay Later note */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'WALLET' && (
                    <motion.div key="wallet-breakdown"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="bg-[var(--bg-main)] rounded-[2rem] p-7 space-y-4 border border-[var(--border-c)]">
                      <div className="flex justify-between items-center">
                        <span className="font-black uppercase text-[8px] tracking-[0.2em] text-[var(--text-s)]">Wallet Balance</span>
                        <span className="font-black text-lg text-[var(--text-p)] tracking-tighter">${walletBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-black uppercase text-[8px] tracking-[0.2em] text-[var(--text-s)]">Order Total</span>
                        <span className="font-black text-lg text-red tracking-tighter">− ${total.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-[var(--border-c)]" />
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-black italic tracking-tighter text-[var(--text-p)]">Remaining</span>
                        <span className={`font-black text-3xl italic tracking-tighter ${isWalletInsufficient ? 'text-red' : 'text-primary'}`}>
                          ${remainingBalance.toFixed(2)}
                        </span>
                      </div>
                      {isWalletInsufficient && (
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="flex items-start gap-3 bg-red/10 border border-red/20 rounded-2xl px-5 py-4">
                          <AlertTriangle size={18} className="text-red flex-shrink-0 mt-0.5" />
                          <p className="text-xs font-black text-red leading-snug">
                            Insufficient balance. Top up your wallet or switch to Pay on Delivery.
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                  {paymentMethod === 'PAY_LATER' && (
                    <motion.div key="paylater-note"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="flex items-start gap-4 bg-amber/8 border border-amber/20 rounded-[2rem] px-7 py-5">
                      <Clock size={20} className="text-amber flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-bold text-amber leading-snug">
                        No payment required now. The full amount of <strong>${total.toFixed(2)}</strong> will be collected when your order is delivered.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Trust badges ── */}
            <div className="grid grid-cols-3 gap-5">
              {[
                { icon: <ShieldCheck size={26} />, label: 'Buyer Protection', sub: 'Money-back guarantee' },
                { icon: <Truck size={26} />,       label: 'Fast Delivery',    sub: 'Within 48 hours' },
                { icon: <RotateCcw size={26} />,   label: 'Easy Returns',     sub: 'Hassle-free policy' },
              ].map((b, i) => (
                <div key={i} className="bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border-c)] p-6 flex flex-col items-center text-center gap-4 shadow-sm hover:shadow-lg transition-all duration-500">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--text-p)] italic tracking-tighter leading-tight mb-1">{b.label}</p>
                    <p className="text-[10px] font-bold text-[var(--text-s)] leading-tight">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════ RIGHT COLUMN — Order Summary ════ */}
          <div className="w-full xl:w-[420px]">
            <div className="bg-[var(--card-bg)] p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-[var(--border-c)] sticky top-32 transition-all duration-500">

              <h3 className="text-2xl font-black mb-8 italic tracking-tighter flex items-center gap-3">
                Order <span className="text-primary">Summary</span>
              </h3>

              {/* Items list */}
              <div className="space-y-4 mb-8 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-[var(--bg-main)] p-3 rounded-2xl border border-[var(--border-c)] hover:border-primary/20 transition-colors">
                    <div className="w-14 h-14 bg-[var(--card-bg)] rounded-xl flex-shrink-0 overflow-hidden border border-[var(--border-c)] flex items-center justify-center">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name}
                          className="w-full h-full object-contain p-1.5"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Package size={18} className="text-[var(--text-s)] opacity-30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-[var(--text-p)] truncate italic tracking-tighter">{item.product.name}</p>
                      <p className="text-[10px] font-bold text-[var(--text-s)] mt-0.5 uppercase tracking-widest">
                        ${Number(item.product.price).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-black text-sm text-primary italic flex-shrink-0">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-[var(--text-s)]">
                  <span className="font-black uppercase text-[8px] tracking-[0.2em]">Merchandise Subtotal</span>
                  <span className="text-lg font-black text-[var(--text-p)] tracking-tighter">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[var(--text-s)]">
                  <span className="font-black uppercase text-[10px] tracking-[0.2em]">Logistics &amp; Delivery</span>
                  <span className="text-primary font-black uppercase text-[10px] tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Complimentary</span>
                </div>

                <div className="h-px bg-[var(--border-c)] my-6" />

                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black italic tracking-tighter">Total Due</span>
                  <div className="text-right">
                    <span className="text-5xl font-black text-primary italic tracking-tighter leading-none block mb-1">
                      ${total.toFixed(2)}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Local taxes included</span>
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <motion.button
                onClick={handlePlaceOrder}
                disabled={isProcessing || isWalletInsufficient || cart.length === 0}
                whileHover={{ scale: isProcessing || isWalletInsufficient ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing || isWalletInsufficient ? 1 : 0.97 }}
                className={`w-full font-black py-8 text-2xl rounded-[2rem] flex items-center justify-center gap-5 disabled:grayscale disabled:opacity-30 shadow-3xl group active:scale-95 transition-all ${
                  paymentMethod === 'PAY_LATER'
                    ? 'bg-amber text-white shadow-amber/40 hover:shadow-amber/60'
                    : 'btn-primary shadow-primary/40'
                }`}
              >
                {isProcessing ? (
                  <><Loader2 size={28} className="animate-spin" /> Processing...</>
                ) : paymentMethod === 'PAY_LATER' ? (
                  <><Clock size={28} className="group-hover:rotate-12 transition-transform" /> Place Order — Pay Later <ArrowRight size={24} /></>
                ) : (
                  <><Lock size={28} className="group-hover:rotate-12 transition-transform" /> Confirm &amp; Pay <ArrowRight size={24} /></>
                )}
              </motion.button>

              <p className="text-center text-[var(--text-s)] font-bold text-[10px] uppercase tracking-widest mt-8 opacity-40">
                256-bit SSL · Encrypted &amp; Secure Payments
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Checkout;
