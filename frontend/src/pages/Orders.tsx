import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronRight, FileText, Calendar, ShoppingBag, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderService, type OrderResponse } from '../services/orderService';

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'DELIVERED': return 'bg-primary/10 text-primary border-primary/20';
    case 'CONFIRMED': return 'bg-blue-100 text-blue-600 border-blue-200';
    case 'PENDING': return 'bg-amber/10 text-amber border-amber/20';
    case 'CANCELLED': return 'bg-red/10 text-red border-red/20';
    default: return 'bg-[var(--card-bg)] text-[var(--text-s)] border-[var(--border-c)]';
  }
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-5xl mx-auto pb-20">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-p)] mb-2 italic tracking-tighter">Order History</h1>
          <p className="text-sm sm:text-base text-[var(--text-s)] font-bold">Track and manage your past purchases.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red/5 rounded-[3rem] border border-dashed border-red/20">
            <p className="text-xl font-black text-red italic">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-40 px-6">
            <div className="w-24 h-24 bg-[var(--card-bg)] rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--border-c)]">
              <Clock size={48} className="text-[var(--text-s)] opacity-40" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-4 italic">No orders yet</h2>
            <p className="text-[var(--text-s)] font-bold mb-10 max-w-sm mx-auto text-sm sm:text-base">
              When you process your first purchase, it will appear here in your timeline history.
            </p>
            <Link to="/products" className="btn-primary inline-flex px-10 py-4 rounded-2xl">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-6 relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[34px] top-0 bottom-0 w-1 bg-[var(--border-c)] hidden sm:block" />

            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative lg:pl-28"
              >
                {/* Timeline dot */}
                <div className="absolute left-[26px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-[var(--border-c)] bg-[var(--bg-main)] hidden sm:block z-10" />

                <div className="bg-[var(--card-bg)] p-6 sm:p-8 rounded-[2rem] border border-[var(--border-c)] shadow-sm flex flex-col items-stretch md:flex-row md:items-center justify-between gap-8 group hover:shadow-xl transition-all duration-300">
                  {/* Info */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 grow text-center sm:text-left">
                    <div className="w-16 h-16 bg-[var(--bg-main)] rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0 border border-[var(--border-c)]">
                      <Package size={28} />
                    </div>
                    <div className="grow">
                      <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 sm:mb-1">
                        <h3 className="text-xl font-black text-[var(--text-p)] uppercase tracking-tighter italic">
                          Order #{order.id}
                        </h3>
                        <span className={`text-[10px] font-black px-3 py-0.5 rounded-full border uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs font-bold text-[var(--text-s)] uppercase">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingBag size={14} /> {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-row md:flex-row items-center justify-between gap-8 md:gap-12 border-t md:border-t-0 border-[var(--border-c)] pt-6 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-black text-[var(--text-s)] uppercase tracking-widest block mb-1">Paid Total</span>
                      <span className="text-2xl font-mono-price font-black text-primary italic leading-none">
                        ${Number(order.totalPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2">
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
        )}
      </main>
    </div>
  );
};

export default Orders;
