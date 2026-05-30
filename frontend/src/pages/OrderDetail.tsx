import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Package, MapPin, 
  CreditCard, FileText, CheckCircle2, Truck, 
  ShoppingBag, Clock 
} from 'lucide-react';
import Navbar from '../components/Navbar';

const OrderDetail: React.FC = () => {
  const { id } = useParams();

  // Mock Data
  const order = {
    id: id || 'GN-4592',
    date: 'Oct 24, 2026',
    status: 'DELIVERED',
    items: [
      { name: 'Premium Emerald Watch', category: 'Accessories', price: 299.99, qty: 1, image: 'https://via.placeholder.com/100' },
      { name: 'Rwandan Organic Coffee', category: 'Food', price: 25.00, qty: 2, image: 'https://via.placeholder.com/100' }
    ],
    total: 349.99,
    walletDeduction: 349.99,
    address: 'Kigali Heights, Floor 3, Kigali, Rwanda'
  };

  const steps = [
    { title: 'Order Placed', date: 'Oct 24, 09:00', completed: true, active: false, icon: <ShoppingBag size={20} /> },
    { title: 'Confirmed', date: 'Oct 24, 10:30', completed: true, active: false, icon: <CheckCircle2 size={20} /> },
    { title: 'Processing', date: 'Oct 24, 14:00', completed: true, active: false, icon: <Package size={20} /> },
    { title: 'Out for Delivery', date: 'Oct 24, 16:20', completed: true, active: true, icon: <Truck size={20} /> },
    { title: 'Delivered', date: 'Oct 24, 18:00', completed: false, active: false, icon: <CheckCircle2 size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500 pb-20">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-5xl mx-auto">
        <Link to="/orders" className="inline-flex items-center gap-2 text-[var(--text-s)] hover:text-primary transition-colors font-black text-xs uppercase tracking-widest mb-8">
          <ChevronLeft size={18} /> Order History
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-[var(--text-p)] mb-2 italic tracking-tighter">Order Detail</h1>
            <div className="flex items-center gap-4 text-[10px] font-black text-[var(--text-s)] uppercase tracking-[0.2em]">
               <span>ID: {order.id}</span>
               <span className="opacity-30">•</span>
               <span>Placed on {order.date}</span>
            </div>
          </div>
          <button className="btn-primary py-4 px-8 rounded-2xl flex items-center gap-3 italic">
             <FileText size={20} /> Download Receipt
          </button>
        </div>

        {/* Status Timeline */}
        <section className="bg-[var(--card-bg)] p-8 sm:p-12 rounded-[3rem] border border-[var(--border-c)] shadow-sm mb-12 relative overflow-hidden transition-colors duration-500">
           <h3 className="text-xl font-black mb-12 flex items-center gap-4 italic">
             <Clock className="text-primary" /> Tracking Progress
           </h3>
           
           <div className="flex flex-col lg:flex-row justify-between gap-12 relative">
              {/* Connector Lines */}
              <div className="absolute top-6 left-6 lg:left-0 lg:right-0 lg:h-1 lg:w-full bg-[var(--border-c)] hidden lg:block" />
              <div className="absolute top-6 left-6 lg:left-0 lg:right-0 lg:h-1 bg-primary hidden lg:block transition-all duration-1000" style={{ width: '75%' }} />
              
              {steps.map((step, i) => (
                <div key={i} className="flex lg:flex-col items-center gap-6 relative z-10 lg:text-center flex-1 group">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative ${
                       step.completed || step.active 
                       ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                       : 'bg-[var(--bg-main)] text-[var(--text-s)]'
                   }`}>
                      {step.active && (
                          <div className="absolute inset-0 bg-primary rounded-2xl animate-ping opacity-20" />
                      )}
                      {React.cloneElement(step.icon as React.ReactElement<any>, { size: 24 })}
                   </div>
                   <div>
                      <h4 className={`font-black text-xs sm:text-sm uppercase tracking-tighter mb-1 transition-colors ${
                          step.completed || step.active ? 'text-[var(--text-p)]' : 'text-[var(--text-s)]'
                      }`}>{step.title}</h4>
                      <p className="text-[10px] font-bold text-[var(--text-s)] italic">{step.date}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-6">
              <section className="bg-[var(--card-bg)] rounded-[3rem] border border-[var(--border-c)] shadow-sm overflow-hidden flex flex-col transition-colors duration-500">
                 <div className="p-8 border-b border-[var(--border-c)] flex justify-between items-center bg-[var(--bg-main)]/50">
                    <h3 className="text-lg font-black italic tracking-tight">Order Items</h3>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{order.items.length} Units</span>
                 </div>
                 <div className="flex flex-col">
                    {order.items.map((item, i) => (
                       <div key={i} className={`p-8 flex items-center justify-between group hover:bg-[var(--hover-c)] transition-all ${i !== order.items.length - 1 ? 'border-b border-[var(--border-c)]' : ''}`}>
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 sm:w-20 h-20 bg-[var(--bg-main)] rounded-2xl p-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt={item.name} />
                             </div>
                             <div>
                                <h4 className="font-black text-[var(--text-p)] text-base sm:text-lg tracking-tight mb-1">{item.name}</h4>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.category}</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] font-black text-[var(--text-s)] uppercase mb-1">Qty: {item.qty}</div>
                             <div className="font-mono-price font-black text-primary text-xl italic">${item.price.toFixed(2)}</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>

              <section className="bg-[var(--card-bg)] p-8 sm:p-10 rounded-[3rem] border border-[var(--border-c)] shadow-sm flex items-center gap-8 transition-colors duration-500">
                 <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <MapPin size={32} />
                 </div>
                 <div>
                    <h3 className="text-[10px] font-black text-[var(--text-s)] uppercase mb-2 tracking-[0.2em]">Delivery Address</h3>
                    <p className="font-black text-[var(--text-p)] text-lg leading-tight italic">{order.address}</p>
                 </div>
              </section>
           </div>

           <div className="space-y-6">
              <section className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-c)] shadow-sm transition-colors duration-500">
                 <h3 className="text-2xl font-black mb-10 italic">Checkout Summary</h3>
                 <div className="space-y-4 mb-10 text-sm font-bold text-[var(--text-s)]">
                    <div className="flex justify-between">
                       <span>Subtotal</span>
                       <span className="text-[var(--text-p)]">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Delivery</span>
                       <span className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Free</span>
                    </div>
                 </div>
                 <div className="h-px bg-[var(--border-c)] mb-8" />
                 <div className="flex justify-between items-end mb-12">
                    <span className="text-xl font-black italic tracking-tighter">Total</span>
                    <span className="text-4xl font-mono-price font-black text-primary italic leading-none">${order.total.toFixed(2)}</span>
                 </div>
                 <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/20 flex items-center gap-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                    <CreditCard className="text-primary relative z-10" size={28} />
                    <div className="relative z-10">
                       <span className="text-[10px] font-black text-primary uppercase block tracking-tighter">Payment Strategy</span>
                       <span className="text-sm font-black text-[var(--text-p)] italic">Gura Wallet Debit</span>
                    </div>
                 </div>
              </section>
           </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetail;
