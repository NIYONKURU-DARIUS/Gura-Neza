import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Package, CreditCard,
  CheckCircle2, Truck, ShoppingBag, Clock, Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { orderService, type OrderResponse } from '../services/orderService';

const getStatusStep = (status: string): number => {
  switch (status) {
    case 'PENDING': return 0;
    case 'CONFIRMED': return 1;
    case 'DELIVERED': return 2;
    default: return 0;
  }
};

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(Number(id));
        setOrder(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center font-body">
        <div className="text-center">
          <p className="text-2xl font-black text-[var(--text-p)] italic mb-4">{error || 'Order not found'}</p>
          <Link to="/orders" className="btn-primary px-8 py-3 rounded-xl">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);

  const steps = [
    { title: 'Order Placed', icon: <ShoppingBag size={20} /> },
    { title: 'Confirmed', icon: <CheckCircle2 size={20} /> },
    { title: 'Delivered', icon: <Truck size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500 pb-20">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-5xl mx-auto">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-[var(--text-s)] hover:text-primary transition-colors font-black text-xs uppercase tracking-widest mb-8"
        >
          <ChevronLeft size={18} /> Order History
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-[var(--text-p)] mb-2 italic tracking-tighter">Order Detail</h1>
            <div className="flex items-center gap-4 text-[10px] font-black text-[var(--text-s)] uppercase tracking-[0.2em]">
              <span>ID: #{order.id}</span>
              <span className="opacity-30">•</span>
              <span>
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <section className="bg-[var(--card-bg)] p-8 sm:p-12 rounded-[3rem] border border-[var(--border-c)] shadow-sm mb-12 relative overflow-hidden transition-colors duration-500">
          <h3 className="text-xl font-black mb-12 flex items-center gap-4 italic">
            <Clock className="text-primary" /> Tracking Progress
          </h3>

          <div className="flex flex-col lg:flex-row justify-between gap-12 relative">
            {/* Connector line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-[var(--border-c)] hidden lg:block" />
            <div
              className="absolute top-6 left-0 h-1 bg-primary hidden lg:block transition-all duration-1000"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, i) => {
              const completed = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={i} className="flex lg:flex-col items-center gap-6 relative z-10 lg:text-center flex-1">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative ${
                      completed
                        ? 'bg-primary text-white shadow-xl shadow-primary/30'
                        : 'bg-[var(--bg-main)] text-[var(--text-s)] border border-[var(--border-c)]'
                    }`}
                  >
                    {active && (
                      <div className="absolute inset-0 bg-primary rounded-2xl animate-ping opacity-20" />
                    )}
                    {React.cloneElement(step.icon as React.ReactElement<any>, { size: 24 })}
                  </div>
                  <div>
                    <h4
                      className={`font-black text-xs sm:text-sm uppercase tracking-tighter mb-1 transition-colors ${
                        completed ? 'text-[var(--text-p)]' : 'text-[var(--text-s)]'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[10px] font-bold text-[var(--text-s)] italic">
                      {completed ? order.status : 'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[var(--card-bg)] rounded-[3rem] border border-[var(--border-c)] shadow-sm overflow-hidden flex flex-col transition-colors duration-500">
              <div className="p-8 border-b border-[var(--border-c)] flex justify-between items-center bg-[var(--bg-main)]/50">
                <h3 className="text-lg font-black italic tracking-tight">Order Items</h3>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  {order.items.length} Unit{order.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-col">
                {order.items.map((item, i) => (
                  <div
                    key={item.id}
                    className={`p-8 flex items-center justify-between group hover:bg-[var(--hover-c)] transition-all ${
                      i !== order.items.length - 1 ? 'border-b border-[var(--border-c)]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-[var(--bg-main)] rounded-2xl flex items-center justify-center border border-[var(--border-c)]">
                        <Package size={28} className="text-primary/40" />
                      </div>
                      <div>
                        <h4 className="font-black text-[var(--text-p)] text-base sm:text-lg tracking-tight mb-1">
                          {item.productName}
                        </h4>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-[var(--text-s)] uppercase mb-1">
                        ${Number(item.price).toFixed(2)} each
                      </div>
                      <div className="font-mono-price font-black text-primary text-xl italic">
                        ${Number(item.subtotal).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <section className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-c)] shadow-sm transition-colors duration-500">
              <h3 className="text-2xl font-black mb-10 italic">Checkout Summary</h3>
              <div className="space-y-4 mb-10 text-sm font-bold text-[var(--text-s)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[var(--text-p)]">${Number(order.totalPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                    Free
                  </span>
                </div>
              </div>
              <div className="h-px bg-[var(--border-c)] mb-8" />
              <div className="flex justify-between items-end mb-12">
                <span className="text-xl font-black italic tracking-tighter">Total</span>
                <span className="text-4xl font-mono-price font-black text-primary italic leading-none">
                  ${Number(order.totalPrice).toFixed(2)}
                </span>
              </div>
              <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/20 flex items-center gap-5 relative overflow-hidden">
                <CreditCard className="text-primary relative z-10" size={28} />
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-primary uppercase block tracking-tighter">
                    Payment Strategy
                  </span>
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
