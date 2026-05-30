import React from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronRight, FileText, Calendar, ShoppingBag, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const orders = [
  { id: 'GN-4592', date: 'Oct 24, 2026', total: 345.99, status: 'DELIVERED', items: 3 },
  { id: 'GN-3810', date: 'Oct 22, 2026', total: 1299.00, status: 'CONFIRMED', items: 1 },
  { id: 'GN-2294', date: 'Oct 20, 2026', total: 85.50, status: 'PENDING', items: 5 },
  { id: 'GN-1025', date: 'Oct 15, 2026', total: 450.00, status: 'CANCELLED', items: 2 },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'DELIVERED': return 'bg-primary/10 text-primary border-primary/20';
    case 'CONFIRMED': return 'bg-blue-100 text-blue-600 border-blue-200';
    case 'PENDING': return 'bg-amber/10 text-amber border-amber/20';
    case 'CANCELLED': return 'bg-red/10 text-red border-red/20';
    default: return 'bg-fresh text-medium-gray border-fresh';
  }
};

const Orders: React.FC = () => {
  return (
    <div className="min-h-screen bg-fresh/30 font-body">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-5xl mx-auto pb-20">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-charcoal mb-2">Order History</h1>
          <p className="text-sm sm:text-base text-medium-gray font-bold">Track and manage your past purchases.</p>
        </header>

        <div className="space-y-6 relative">
          {/* Vertical Line for Timeline (Desktop Only) */}
          <div className="absolute left-[34px] top-0 bottom-0 w-1 bg-fresh hidden sm:block" />

          {orders.map((order, i) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative lg:pl-28"
            >
              {/* Timeline Indicator (Desktop Only) */}
              <div className="absolute left-[26px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-fresh bg-white hidden sm:block z-10" />
              
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-fresh shadow-sm flex flex-col items-stretch md:flex-row md:items-center justify-between gap-8 group hover:shadow-xl transition-all duration-300">
                {/* Info Part */}
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 grow text-center sm:text-left">
                  <div className="w-16 h-16 bg-fresh rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                    <Package size={28} />
                  </div>
                  <div className="grow">
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 sm:mb-1">
                      <h3 className="text-xl font-black text-charcoal uppercase tracking-tighter">{order.id}</h3>
                      <span className={`text-[10px] font-black px-3 py-0.5 rounded-full border uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs font-bold text-medium-gray uppercase">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {order.date}</span>
                      <span className="flex items-center gap-1"><ShoppingBag size={14} /> {order.items} items</span>
                    </div>
                  </div>
                </div>

                {/* Status & Price Part */}
                <div className="flex flex-row md:flex-row items-center justify-between gap-8 md:gap-12 border-t md:border-t-0 pt-6 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-black text-medium-gray uppercase tracking-widest block mb-1">Paid Total</span>
                    <span className="text-2xl font-mono-price font-black text-primary italic leading-none">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-fresh rounded-xl text-charcoal hover:bg-primary hover:text-white transition-all cursor-pointer">
                      <FileText size={20} />
                    </button>
                    <Link to={`/order/${order.id}`}>
                      <button className="btn-primary py-3 px-6 rounded-xl text-sm font-black flex items-center gap-2">
                        Details <ChevronRight size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="text-center py-40 px-6">
            <div className="w-24 h-24 sm:w-32 h-32 bg-fresh rounded-full flex items-center justify-center mx-auto mb-8">
              <Clock size={48} className="text-medium-gray" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-4">No orders yet</h2>
            <p className="text-medium-gray font-bold mb-10 max-w-sm mx-auto text-sm sm:text-base">When you process your first purchase, it will appear here in your timeline history.</p>
            <Link to="/products" className="btn-primary inline-flex px-10 py-4 rounded-2xl">Start Shopping</Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
