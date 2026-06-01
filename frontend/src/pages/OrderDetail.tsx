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
    case 'PENDING':   return 0;
    case 'CONFIRMED': return 1;
    case 'DELIVERED': return 2;
    default:          return 0;
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
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center font-body px-4">
        <div className="text-center">
          <p className="text-2xl font-black text-[var(--text-p)] italic mb-4">{error || 'Order not found'}</p>
          <Link to="/orders" className="btn-primary px-8 py-3 rounded-full">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);
  const steps = [
    { title: 'Order Placed', icon: <ShoppingBag size={20} /> },
    { title: 'Confirmed',    icon: <CheckCircle2 size={20} /> },
    { title: 'Delivered',    icon: <Truck size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500 pb-20">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-[var(--text-s)] hover:text-primary transition-colors font-black text-xs uppercase tracking-widest mb-8"
        >
          <ChevronLeft size={18} /> Order History
        </Link>

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-p)] mb-2 italic tracking-tighter">
            Order Detail
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-[var(--text-s)] uppercase tracking-[0.2em]">
            <span>ID: #{order.id}</span>
            <span className="opacity-30">•</span>
            <span>
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* ── Status Timeline ── */}
        <section className="bg-[var(--card-bg)] p-6 sm:p-10 rounded-[2.5rem] border border-[var(--border-c)] shadow-sm mb-8 overflow-hidden">
          <h3 className="text-base font-black mb-8 flex items-center gap-3 italic">
            <Clock className="text-primary" size={20} /> Tracking Progress
          </h3>

          {/* Mobile: vertical stack */}
          <div className="flex flex-col sm:hidden gap-0">
            {steps.map((step, i) => {
              const completed = i <= currentStep;
              const active    = i === currentStep;
              return (
                <div key={i} className="flex items-start gap-4">
                  {/* dot + vertical line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 relative ${
                      completed ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-[var(--bg-main)] text-[var(--text-s)] border border-[var(--border-c)]'
                    }`}>
                      {active && <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />}
                      {React.cloneElement(step.icon as React.ReactElement<any>, { size: 18 })}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 rounded-full ${completed && i < currentStep ? 'bg-primary' : 'bg-[var(--border-c)]'}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <h4 className={`font-black text-sm uppercase tracking-tight mb-0.5 ${completed ? 'text-[var(--text-p)]' : 'text-[var(--text-s)]'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] font-bold text-[var(--text-s)] italic">
                      {i <= currentStep ? order.status : 'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: horizontal */}
          <div className="hidden sm:flex justify-between gap-4 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--border-c)]" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-1000"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((step, i) => {
              const completed = i <= currentStep;
              const active    = i === currentStep;
              return (
                <div key={i} className="flex flex-col items-center gap-4 relative z-10 flex-1 text-center">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 relative ${
                    completed ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-[var(--bg-main)] text-[var(--text-s)] border border-[var(--border-c)]'
                  }`}>
                    {active && <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />}
                    {React.cloneElement(step.icon as React.ReactElement<any>, { size: 20 })}
                  </div>
                  <div>
                    <h4 className={`font-black text-xs uppercase tracking-tight mb-0.5 ${completed ? 'text-[var(--text-p)]' : 'text-[var(--text-s)]'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] font-bold text-[var(--text-s)] italic">
                      {i <= currentStep ? order.status : 'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Items + Summary ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Order Items */}
          <div className="lg:col-span-2">
            <section className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-c)] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--border-c)] flex justify-between items-center bg-[var(--bg-main)]/50">
                <h3 className="text-sm font-black italic tracking-tight">Order Items</h3>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  {order.items.length} Unit{order.items.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="divide-y divide-[var(--border-c)]">
                {order.items.map((item) => (
                  <div key={item.id} className="p-5 sm:p-6 flex items-center gap-4 hover:bg-[var(--hover-c)] transition-all">
                    {/* Icon */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[var(--bg-main)] rounded-2xl flex items-center justify-center border border-[var(--border-c)] flex-shrink-0">
                      <Package size={22} className="text-primary/40" />
                    </div>

                    {/* Name + qty */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-[var(--text-p)] text-sm tracking-tight truncate">
                        {item.productName}
                      </h4>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                        Qty: {item.quantity} &nbsp;·&nbsp; ${Number(item.price).toFixed(2)} each
                      </span>
                    </div>

                    {/* Subtotal */}
                    <div className="font-mono-price font-black text-primary text-lg italic flex-shrink-0">
                      ${Number(item.subtotal).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Summary */}
          <div>
            <section className="bg-[var(--card-bg)] p-6 sm:p-8 rounded-[2.5rem] border border-[var(--border-c)] shadow-sm">
              <h3 className="text-lg font-black mb-6 italic">Summary</h3>

              <div className="space-y-3 mb-6 text-sm font-bold text-[var(--text-s)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[var(--text-p)]">${Number(order.totalPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery</span>
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                    Free
                  </span>
                </div>
              </div>

              <div className="h-px bg-[var(--border-c)] mb-5" />

              <div className="flex justify-between items-end mb-6">
                <span className="text-base font-black italic">Total</span>
                <span className="text-3xl font-mono-price font-black text-primary italic leading-none">
                  ${Number(order.totalPrice).toFixed(2)}
                </span>
              </div>

              {/* Payment method */}
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex items-center gap-4">
                <CreditCard className="text-primary flex-shrink-0" size={22} />
                <div>
                  <span className="text-[10px] font-black text-primary uppercase block tracking-tight">
                    Payment Method
                  </span>
                  <span className="text-sm font-black text-[var(--text-p)] italic">
                    {order.paymentMethod === 'PAY_LATER' ? 'Pay on Delivery' : 'Gura Wallet'}
                  </span>
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
