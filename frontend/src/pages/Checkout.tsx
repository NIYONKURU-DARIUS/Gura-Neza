import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, CreditCard, ChevronRight, Wallet, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useStore } from '../context/store';

const Checkout: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { cart, user, clearCart } = useStore();
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const remainingBalance = (user?.walletBalance || 0) - total;

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 font-body">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[var(--card-bg)] p-12 sm:p-20 rounded-[3.5rem] text-center shadow-2xl border border-primary/20 max-w-2xl relative overflow-hidden"
        >
          {/* Confetti Animation Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <motion.div 
                    key={i}
                    initial={{ y: -20, x: Math.random() * 400 - 200, opacity: 1 }}
                    animate={{ y: 600, opacity: 0, rotate: 360 }}
                    transition={{ duration: 2, delay: Math.random() * 2, repeat: Infinity }}
                    className="absolute w-2 h-4 bg-primary rounded-full"
                    style={{ left: `${Math.random() * 100}%` }}
                />
            ))}
          </div>

          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-10 text-primary relative">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: 'spring', damping: 10 }}
             >
               <CheckCircle2 size={80} />
             </motion.div>
             <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-[var(--text-p)] mb-6 italic tracking-tighter transition-colors">Success!</h2>
          <p className="text-xl text-[var(--text-s)] font-bold mb-12 max-w-md mx-auto">Your order has been placed successfully using Gura Wallet. Prepare for excellence.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button onClick={() => navigate('/orders')} className="btn-primary px-10 py-4 rounded-xl text-lg">View My Orders</button>
            <button onClick={() => navigate('/products')} className="bg-[var(--bg-main)] text-[var(--text-p)] font-black px-10 py-4 rounded-xl text-lg border border-[var(--border-c)] hover:bg-[var(--hover-c)] transition-all">Back to Home</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500 pb-20">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-p)] mb-12 italic tracking-tighter">Checkout.</h1>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Payment Section */}
          <div className="space-y-8">
            <section className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-c)] shadow-sm group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2" />
               <h3 className="text-2xl font-black mb-10 italic flex items-center gap-3">
                 <CreditCard className="text-primary" /> Gura Wallet
               </h3>
               
               <div className="space-y-6">
                 <div className="flex justify-between items-center p-6 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-c)]">
                    <span className="text-[10px] font-black uppercase text-[var(--text-s)] tracking-widest">Current Balance</span>
                    <span className="font-mono-price font-black text-xl text-[var(--text-p)]">${user?.walletBalance.toFixed(2)}</span>
                 </div>
                 
                 <div className="flex justify-between items-center p-6 bg-red/5 rounded-2xl border border-red/10">
                    <span className="text-[10px] font-black uppercase text-red tracking-widest">Deduction</span>
                    <span className="font-mono-price font-black text-xl text-red">-${total.toFixed(2)}</span>
                 </div>

                 <div className="h-px bg-[var(--border-c)] mx-4" />

                 <div className="flex justify-between items-center p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">Remaining</span>
                    <div className="text-right">
                        <span className="font-mono-price font-black text-xl text-primary block">${remainingBalance.toFixed(2)}</span>
                        <span className="text-[8px] font-black text-primary/50 uppercase tracking-tighter">Secured by Gura Neza</span>
                    </div>
                 </div>
               </div>
            </section>

            <section className="bg-primary p-10 rounded-[3rem] text-white flex items-center gap-8 shadow-2xl shadow-primary/30">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h4 className="text-2xl font-black italic">Buyer Protection</h4>
                    <p className="text-sm font-bold opacity-80 leading-snug">Money back guarantee if delivery fails within 48h.</p>
                </div>
            </section>
          </div>

          {/* Side Summary */}
          <div className="flex flex-col gap-8">
             <section className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-c)] shadow-sm transition-colors">
                <h3 className="text-xl font-black mb-8 italic">Order Summary</h3>
                <div className="space-y-4 mb-8">
                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-[var(--text-s)] font-bold truncate max-w-[150px]">{item.product.name} <span className="text-[10px] font-black ml-1">x{item.quantity}</span></span>
                            <span className="font-mono-price font-black text-[var(--text-p)]">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="h-px bg-[var(--border-c)] mb-8" />
                <div className="flex justify-between items-center mb-10">
                    <span className="text-2xl font-black italic tracking-tighter">Total Price</span>
                    <span className="text-3xl font-mono-price font-black text-primary italic">${total.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full btn-primary py-6 rounded-2xl text-xl flex items-center justify-center gap-4 group overflow-hidden relative"
                >
                  <AnimatePresence mode="wait">
                    {isProcessing ? (
                        <motion.div key="loader" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Loader2 size={24} />
                        </motion.div>
                    ) : (
                        <motion.div key="text" className="flex items-center gap-3">
                             Confirm & Pay <ArrowRight size={20} className="group-hover:translate-x-2 transition-all" />
                        </motion.div>
                    )}
                  </AnimatePresence>
                </button>
             </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
