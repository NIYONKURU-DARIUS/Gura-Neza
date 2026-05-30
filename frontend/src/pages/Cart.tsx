import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronLeft, CreditCard, ShoppingBag, Plus, Minus, AlertTriangle, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useStore } from '../context/store';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, user, isDarkMode } = useStore();
  
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const total = subtotal;
  const isInsufficient = (user?.walletBalance || 0) < total;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-7xl mx-auto pb-20">
        <Link to="/products" className="inline-flex items-center gap-2 text-[var(--text-s)] hover:text-primary transition-colors font-black uppercase text-xs tracking-widest mb-8">
          <ChevronLeft size={18} /> Continue Shopping
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-p)] mb-10 flex items-center gap-5 italic tracking-tighter">
              <ShoppingBag size={36} className="text-primary" /> Your Cart <span className="text-primary/50 text-2xl font-headers">({cart.length})</span>
            </h1>

            <AnimatePresence mode='popLayout'>
              {cart.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--card-bg)] p-12 sm:p-20 rounded-[3rem] text-center shadow-sm border border-[var(--border-c)] transition-colors">
                  <div className="w-24 h-24 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--text-s)]">
                    <ShoppingBag size={48} />
                  </div>
                  <h3 className="text-2xl font-black mb-2 italic">Your cart is empty</h3>
                  <p className="text-[var(--text-s)] mb-10 font-bold">Explore our catalog and find something amazing.</p>
                  <Link to="/products" className="btn-primary py-4 px-12 rounded-2xl text-lg">Browse Catalog</Link>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="hidden md:grid grid-cols-12 px-10 py-5 text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-[var(--card-bg)] rounded-[1.5rem] border border-[var(--border-c)] shadow-sm">
                    <div className="col-span-6">Product Details</div>
                    <div className="col-span-3 text-center">Quantity</div>
                    <div className="col-span-3 text-right">Subtotal</div>
                  </div>
                  
                  {cart.map((item) => (
                    <motion.div 
                      layout
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="bg-[var(--card-bg)] border border-[var(--border-c)] p-6 sm:p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group"
                    >
                      <div className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-8">
                        <div className="md:col-span-6 flex items-center gap-6">
                          <div className="w-20 h-20 sm:w-24 h-24 bg-[var(--bg-main)] rounded-2xl flex items-center justify-center p-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                            <img src={item.product.image} className="w-full h-full object-contain mix-blend-multiply" alt={item.product.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-[var(--text-p)] text-lg sm:text-xl truncate tracking-tight">{item.product.name}</h4>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.product.category}</span>
                            <div className="mt-3 md:hidden flex justify-between items-center">
                               <span className="font-mono-price font-black text-primary text-lg">${item.product.price.toFixed(2)}</span>
                               <button onClick={() => removeFromCart(item.id)} className="text-red hover:bg-red/10 p-2 rounded-lg transition-all">
                                 <Trash2 size={20} />
                               </button>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-3 flex justify-center md:block">
                          <div className="flex items-center justify-between md:justify-center gap-6 bg-[var(--bg-main)] p-2 rounded-2xl border border-[var(--border-c)] w-full md:w-fit mx-auto lg:mx-0">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 rounded-xl bg-[var(--card-bg)] shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all text-[var(--text-p)]">
                              <Minus size={18} />
                            </button>
                            <span className="w-10 text-center font-black text-lg text-[var(--text-p)]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 rounded-xl bg-[var(--card-bg)] shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all text-[var(--text-p)]">
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="hidden md:flex md:col-span-3 items-center justify-end gap-8">
                          <span className="text-2xl font-mono-price font-black text-primary italic">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <button onClick={() => removeFromCart(item.id)} className="p-2 text-[var(--text-s)] hover:text-red transition-all scale-100 hover:scale-125">
                            <Trash2 size={22} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full lg:w-[450px]">
            <div className="bg-[var(--card-bg)] p-10 sm:p-12 rounded-[3.5rem] shadow-2xl border border-primary/10 sticky top-28 transition-colors duration-500">
              <h3 className="text-3xl font-black mb-10 italic tracking-tighter">Order Summary</h3>
              
              <div className="space-y-5 mb-10">
                <div className="flex justify-between text-[var(--text-s)] font-black uppercase text-xs tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-[var(--text-p)]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-s)] font-black uppercase text-xs tracking-widest">
                  <span>Estimated Delivery</span>
                  <span className="text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded text-[10px]">FREE</span>
                </div>
                <div className="h-px bg-[var(--border-c)] my-6" />
                <div className="flex justify-between items-end">
                  <span className="text-xl font-black italic tracking-tighter">Grand Total</span>
                  <div className="text-right">
                    <span className="text-5xl font-mono-price font-black text-primary leading-none transition-all dark:drop-shadow-[0_0_15px_rgba(76,175,80,0.5)]">
                        ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Integration Info */}
              <div className="bg-[var(--bg-main)] p-8 rounded-[2.5rem] border border-[var(--border-c)] mb-10 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-primary flex items-center gap-2 uppercase tracking-[0.2em]">
                    <Wallet size={16} /> Gura Wallet
                  </span>
                  <span className="text-lg font-black text-primary italic">
                    ${user?.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {isInsufficient && (
                  <motion.div 
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity }}
                    className="flex items-center gap-3 text-[10px] font-black text-red uppercase mt-6 bg-red/10 p-4 rounded-xl border border-red/20 shadow-[0_0_20px_rgba(255,0,0,0.1)]"
                  >
                    <AlertTriangle size={16} /> Insufficient Balance
                  </motion.div>
                )}
              </div>

              <Link to="/checkout" className="block">
                <button 
                  disabled={cart.length === 0 || isInsufficient}
                  className="w-full btn-primary py-6 text-2xl font-black rounded-2xl flex items-center justify-center gap-4 disabled:grayscale disabled:opacity-50 shadow-2xl shadow-primary/30"
                >
                  <CreditCard size={28} /> Complete Payment
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
