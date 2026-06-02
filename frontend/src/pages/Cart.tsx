import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronLeft, CreditCard, ShoppingBag, Plus, Minus, AlertTriangle, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useStore } from '../context/store';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, user } = useStore();
  
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const total = subtotal;
  const isInsufficient = (user?.walletBalance || 0) < total;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar />

      <main className="pt-32 px-4 sm:px-[5%] max-w-[1600px] mx-auto pb-32">
        <div className="flex items-center justify-between mb-12">
          <Link to="/products" className="group flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--border-c)] px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary transition-all shadow-sm">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronLeft size={18} />
            </div>
            Back to Marketplace
          </Link>
          
          <div className="hidden sm:flex items-center gap-3 bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary">Secure Checkout Guaranteed</span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-12 xl:gap-20">
          <div className="flex-1">
            <div className="mb-12">
               <h1 className="text-4xl sm:text-6xl font-black text-[var(--text-p)] mb-4 flex items-center gap-6 italic tracking-tighter">
                 Shopping Bag <span className="text-primary italic">/ 0{cart.length}</span>
               </h1>
               <p className="text-[var(--text-s)] font-bold text-lg">Review your selection before finalizing your orders.</p>
            </div>

            <AnimatePresence mode='popLayout'>
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="bg-[var(--card-bg)] p-16 sm:p-32 rounded-[4rem] text-center shadow-2xl border border-[var(--border-c)] flex flex-col items-center"
                >
                  <div className="w-32 h-32 bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-10 text-primary/30 border border-[var(--border-c)]">
                    <ShoppingBag size={64} />
                  </div>
                  <h3 className="text-4xl font-black mb-4 italic tracking-tighter">Your bag is currently empty</h3>
                  <p className="text-[var(--text-s)] mb-12 font-bold text-xl max-w-md mx-auto">Explore our premium collections and discover something extraordinary today.</p>
                  <Link to="/products" className="btn-primary py-6 px-16 rounded-[2rem] text-xl italic shadow-2xl shadow-primary/30">Explore Marketplace</Link>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {cart.map((item) => (
                    <motion.div 
                      layout
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[var(--card-bg)] border border-[var(--border-c)] p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 group relative overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-full md:w-32 h-32 bg-[var(--bg-main)] rounded-xl flex items-center justify-center p-4 flex-shrink-0 group-hover:scale-105 transition-transform duration-700 relative overflow-hidden border border-[var(--border-c)]">
                            <img 
                              src={item.product.imageUrl || 'https://via.placeholder.com/400'} 
                              className="w-full h-full object-contain drop-shadow-lg relative z-10" 
                              alt={item.product.name} 
                            />
                        </div>

                        <div className="flex-1 w-full min-w-0">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                                <span className="text-primary font-black uppercase tracking-[0.3em] text-[8px] mb-1 block">{item.product.category}</span>
                                <h4 className="font-black text-[var(--text-p)] text-lg sm:text-xl italic tracking-tighter leading-none mb-1">{item.product.name}</h4>
                             </div>
                             <button 
                               onClick={() => removeFromCart(item.id)} 
                               className="p-2.5 bg-red/5 text-red hover:bg-red hover:text-white rounded-lg transition-all shadow-sm"
                             >
                               <Trash2 size={14} />
                             </button>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-6 mt-4">
                             <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1.5 rounded-xl border border-[var(--border-c)] shadow-inner">
                                <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 rounded-lg bg-[var(--card-bg)] shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all text-[var(--text-p)] font-black">
                                  <Minus size={14} />
                                </button>
                                <span className="w-10 text-center font-black text-sm text-[var(--text-p)]">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-[var(--card-bg)] shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all text-[var(--text-p)] font-black">
                                  <Plus size={14} />
                                </button>
                             </div>

                             <div className="flex-1 flex justify-end items-center gap-2">
                                <span className="text-xl font-black text-primary italic tracking-tighter">
                                  RWF {(item.product.price * item.quantity).toLocaleString('en-RW')}
                                </span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="pt-6 flex justify-center">
                    <Link to="/products" className="text-primary font-black uppercase text-[10px] tracking-[0.4em] hover:tracking-[0.6em] transition-all flex items-center gap-3 group">
                       <div className="w-8 h-px bg-primary/30 group-hover:w-12 transition-all" /> Continue Shopping <div className="w-8 h-px bg-primary/30 group-hover:w-12 transition-all" />
                    </Link>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full xl:w-[380px]">
            <div className="bg-[var(--card-bg)] p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-[var(--border-c)] sticky top-32 transition-all duration-500">
              <h3 className="text-2xl font-black mb-8 italic tracking-tighter flex items-center gap-3">
                 Orders <span className="text-primary">Summary</span>
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-[var(--text-s)]">
                  <span className="font-black uppercase text-[8px] tracking-[0.2em]">Merchandise Subtotal</span>
                  <span className="text-lg font-black text-[var(--text-p)] tracking-tighter">RWF {subtotal.toLocaleString('en-RW')}</span>
                </div>
                <div className="flex justify-between items-center text-[var(--text-s)]">
                  <span className="font-black uppercase text-[10px] tracking-[0.2em]">Logistics & Delivery</span>
                  <span className="text-primary font-black uppercase text-[10px] tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Complimentary</span>
                </div>
                
                <div className="h-px bg-[var(--border-c)] my-10" />
                
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black italic tracking-tighter">Total Due</span>
                  <div className="text-right">
                    <span className="text-6xl font-black text-primary italic tracking-tighter leading-none block mb-1">
                        RWF {total.toLocaleString('en-RW')}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Local taxes included</span>
                  </div>
                </div>
              </div>

              {/* Wallet Integration Info */}
              <div className="bg-[var(--bg-main)] p-8 rounded-[2.5rem] border border-[var(--border-c)] mb-12 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-[var(--text-s)] flex items-center gap-3 uppercase tracking-widest">
                      <Wallet size={16} className="text-primary" /> Your Available Credit
                    </span>
                  </div>
                  <div className="text-3xl font-black text-primary italic tracking-tighter">
                    RWF {user?.walletBalance.toLocaleString('en-RW')}
                  </div>
                  
                  {isInsufficient && (
                    <motion.div 
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="flex items-center gap-3 text-[10px] font-black text-red uppercase mt-6 bg-red/10 p-4 rounded-2xl border border-red/20 shadow-lg shadow-red/10"
                    >
                      <AlertTriangle size={18} /> Additional funding required
                    </motion.div>
                  )}
                </div>
              </div>

              <Link to="/checkout" className="block">
                <button 
                  disabled={cart.length === 0 || isInsufficient}
                  className="w-full btn-primary py-8 text-2xl font-black rounded-[2rem] flex items-center justify-center gap-5 disabled:grayscale disabled:opacity-30 shadow-3xl shadow-primary/40 group active:scale-95 transition-all"
                >
                  <CreditCard size={32} className="group-hover:rotate-12 transition-transform" /> 
                  Checkout
                </button>
              </Link>
              
              <p className="text-center text-[var(--text-s)] font-bold text-[10px] uppercase tracking-widest mt-8 opacity-40">
                Encrypted & Secure Payments
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
