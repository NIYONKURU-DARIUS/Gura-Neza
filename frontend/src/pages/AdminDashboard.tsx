import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShoppingCart, Package, BarChart3, MessageSquare,
  LogOut, Check, Clock, Loader2, Plus, X, DollarSign,
  Send, Truck, Ban, Eye, Edit2, ChevronDown, AlertTriangle
} from 'lucide-react';
import { useStore } from '../context/store';
import { adminService, type AdminStats } from '../services/adminService';
import { orderService, type OrderResponse, type OrderStatus } from '../services/orderService';
import { productService, type Product } from '../services/productService';
import { userService, type UserProfile } from '../services/userService';
import { walletService } from '../services/walletService';
import { chatService, type ChatInboxItem, type ChatMessage } from '../services/chatService';

type Section = 'dash' | 'prod' | 'ord' | 'user' | 'chat';

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber/10 text-amber border-amber/20',
  CONFIRMED: 'bg-blue-100 text-blue-600 border-blue-200',
  DELIVERED: 'bg-primary/10 text-primary border-primary/20',
  CANCELLED: 'bg-red/10 text-red border-red/20',
};

const AdminDashboard: React.FC = () => {
  const { logout, token } = useStore();
  const [activeSection, setActiveSection] = useState<Section>('dash');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  // Order filters
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  // Chat
  const [inbox, setInbox] = useState<ChatInboxItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const activeChatIdRef = useRef<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

  // Product form
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const emptyProduct = { name: '', description: '', price: 0, stock: 0, category: 'ELECTRONICS', imageUrl: '', isFeatured: false };
  const [productForm, setProductForm] = useState(emptyProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, o, p, u, i] = await Promise.all([
        adminService.getStats(),
        orderService.getAllOrders(),
        productService.getAllProducts(),
        userService.getAllUsers(),
        chatService.getAdminInbox(),
      ]);
      setStats(s); setOrders(o); setProducts(p); setUsers(u); setInbox(i);
    } catch (err) { console.error('Failed to fetch admin data', err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    if (token) {
      chatService.connect(token, (newMsg) => {
        setMessages(prev => {
          if (newMsg.userId !== activeChatIdRef.current) return prev;
          return [...prev, newMsg];
        });
        chatService.getAdminInbox().then(setInbox);
      });
      chatService.subscribeToInbox(() => chatService.getAdminInbox().then(setInbox));
    }
    return () => chatService.disconnect();
  }, [token]);

  useEffect(() => {
    if (activeSection === 'chat' && activeChatId) {
      chatService.subscribeToThread(activeChatId.toString());
      chatService.getThread(activeChatId).then(setMessages);
    }
  }, [activeSection, activeChatId]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages]);

  const doAction = async (label: string, fn: () => Promise<any>) => {
    setActionError('');
    try { await fn(); await fetchData(); }
    catch (err: any) { setActionError(err.response?.data?.message || `Failed: ${label}`); }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeChatId) return;
    chatService.adminReply(activeChatId, replyText);
    setReplyText('');
  };

  const openAddModal = () => { setEditProduct(null); setProductForm(emptyProduct); setShowAddModal(true); };
  const openEditModal = (p: Product) => {
    setEditProduct(p);
    setProductForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, imageUrl: p.imageUrl, isFeatured: p.isFeatured });
    setShowAddModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      if (editProduct) await productService.updateProduct(editProduct.id, productForm);
      else await productService.createProduct(productForm);
      setShowAddModal(false); setProductForm(emptyProduct); setEditProduct(null);
      await fetchData();
    } catch { alert('Failed to save product.'); }
    finally { setIsSubmitting(false); }
  };

  const filteredOrders = orderFilter === 'ALL' ? orders : orders.filter(o => o.status === orderFilter);

  const navItems = [
    { id: 'dash', name: 'Dashboard', icon: <BarChart3 /> },
    { id: 'prod', name: 'Products', icon: <Package /> },
    { id: 'ord',  name: 'Orders',   icon: <ShoppingCart />, badge: orders.filter(o => o.status === 'PENDING').length },
    { id: 'user', name: 'Users',    icon: <Users /> },
    { id: 'chat', name: 'Support',  icon: <MessageSquare />, badge: inbox.reduce((a, c) => a + c.unreadCount, 0) },
  ];

  if (loading && !stats) return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="font-black text-primary uppercase tracking-widest text-xs">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 bg-[var(--card-bg)] border-r border-[var(--border-c)] flex flex-col py-6 px-3 fixed h-full z-20">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black italic text-sm shadow-lg shadow-primary/30">G</div>
          <div>
            <p className="text-xs font-black text-[var(--text-p)] italic tracking-tighter leading-none">GURA NEZA</p>
            <p className="text-[7px] font-black text-primary uppercase tracking-[0.3em] mt-0.5">Admin</p>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id as Section)}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all ${
                activeSection === item.id ? 'bg-primary text-white shadow-md' : 'text-[var(--text-s)] hover:bg-primary/5'
              }`}>
              <div className="flex items-center gap-2.5">
                {React.cloneElement(item.icon as any, { size: 15 })}
                <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
              </div>
              {(item.badge ?? 0) > 0 && (
                <span className="bg-red text-white text-[8px] min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full font-black">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red hover:bg-red/5 transition-all w-full mt-2">
          <LogOut size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
        </button>
      </aside>

      <main className="flex-1 ml-52 p-6 h-screen overflow-y-auto">
        {/* Global error */}
        <AnimatePresence>
          {actionError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 flex items-center gap-3 bg-red/10 border border-red/20 text-red p-3 rounded-2xl">
              <AlertTriangle size={16} />
              <span className="text-xs font-black">{actionError}</span>
              <button onClick={() => setActionError('')} className="ml-auto"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-6">
          <h1 className="text-lg font-black text-[var(--text-p)] italic tracking-tighter uppercase">
            {navItems.find(n => n.id === activeSection)?.name}
          </h1>
        </header>

        <AnimatePresence mode="wait">
          {/* ── DASHBOARD ─────────────────────────────────────────────── */}
          {activeSection === 'dash' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Today Revenue', value: `$${Number(stats?.todayRevenue ?? 0).toFixed(2)}`, icon: <DollarSign /> },
                  { label: 'Pending Orders', value: stats?.pendingOrdersCount ?? 0, icon: <ShoppingCart /> },
                  { label: 'Total Users', value: stats?.totalUsersCount ?? 0, icon: <Users /> },
                  { label: 'Support Queue', value: inbox.filter(i => i.unreadCount > 0).length, icon: <MessageSquare /> },
                ].map((kpi, i) => (
                  <div key={i} className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-c)] shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary mb-3">
                      {React.cloneElement(kpi.icon as any, { size: 16 })}
                    </div>
                    <p className="text-[8px] font-black text-[var(--text-s)] uppercase tracking-widest mb-0.5">{kpi.label}</p>
                    <h3 className="text-xl font-black text-[var(--text-p)] italic tracking-tighter">{kpi.value}</h3>
                  </div>
                ))}
              </div>
              {/* Recent orders preview */}
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-c)] flex justify-between items-center">
                  <h3 className="font-black italic uppercase text-xs">Recent Orders</h3>
                  <button onClick={() => setActiveSection('ord')} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
                </div>
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="px-4 py-3 flex items-center justify-between border-b border-[var(--border-c)] last:border-0 hover:bg-primary/5 transition-colors">
                    <div>
                      <p className="text-xs font-black text-[var(--text-p)] italic">Order #{o.id} — {o.userName}</p>
                      <p className="text-[10px] text-[var(--text-s)] font-bold">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-primary text-sm">${Number(o.totalPrice).toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── PRODUCTS ──────────────────────────────────────────────── */}
          {activeSection === 'prod' && (
            <motion.div key="prod" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border-c)] flex justify-between items-center">
                  <h3 className="font-black italic uppercase text-xs">Products ({products.length})</h3>
                  <button onClick={openAddModal} className="btn-primary py-1.5 px-3 rounded-lg text-[8px] flex items-center gap-1.5">
                    <Plus size={11} /> Add Product
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-primary/5 text-[8px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="p-3">Product</th><th className="p-3">Category</th>
                        <th className="p-3">Price</th><th className="p-3">Stock</th>
                        <th className="p-3">Status</th><th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-[var(--border-c)]">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-primary/5 transition-colors">
                          <td className="p-3 font-black max-w-[160px] truncate">{p.name}</td>
                          <td className="p-3 text-[var(--text-s)] font-bold">{p.category}</td>
                          <td className="p-3 font-mono font-black">${Number(p.price).toFixed(2)}</td>
                          <td className="p-3 font-bold">{p.stock}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${p.stock > 0 ? 'bg-primary/10 text-primary' : 'bg-red/10 text-red'}`}>
                              {p.stock > 0 ? (p.stock < 10 ? 'Low' : 'In Stock') : 'Out'}
                            </span>
                          </td>
                          <td className="p-3 flex items-center gap-2">
                            <button onClick={() => openEditModal(p)} className="p-1.5 text-[var(--text-s)] hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => doAction('delete', () => productService.deleteProduct(p.id))}
                              className="p-1.5 text-[var(--text-s)] hover:text-red hover:bg-red/10 rounded-lg transition-colors">
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ORDERS ────────────────────────────────────────────────── */}
          {activeSection === 'ord' && (
            <motion.div key="ord" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Filter tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const).map(f => (
                  <button key={f} onClick={() => setOrderFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      orderFilter === f ? 'bg-primary text-white shadow-md' : 'bg-[var(--card-bg)] text-[var(--text-s)] border border-[var(--border-c)] hover:border-primary/40'
                    }`}>
                    {f} {f !== 'ALL' && `(${orders.filter(o => o.status === f).length})`}
                  </button>
                ))}
              </div>

              <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] overflow-hidden shadow-sm">
                <div className="divide-y divide-[var(--border-c)]">
                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center opacity-30">
                      <p className="text-xs font-black uppercase">No orders found</p>
                    </div>
                  ) : filteredOrders.map(o => (
                    <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-primary/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${STATUS_STYLES[o.status]}`}>
                          {o.status === 'PENDING' && <Clock size={16} />}
                          {o.status === 'CONFIRMED' && <Check size={16} />}
                          {o.status === 'DELIVERED' && <Truck size={16} />}
                          {o.status === 'CANCELLED' && <Ban size={16} />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-[var(--text-p)] italic">
                            Order #{o.id} — {o.userName || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-[var(--text-s)] font-bold">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </p>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                            {o.paymentMethod === 'PAY_LATER' && (
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">Pay Later</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-primary text-sm">${Number(o.totalPrice).toFixed(2)}</span>
                        <button onClick={() => setSelectedOrder(o)} className="p-1.5 text-[var(--text-s)] hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Eye size={14} />
                        </button>
                        {o.status === 'PENDING' && (
                          <button onClick={() => doAction('confirm', () => orderService.confirmOrder(o.id))}
                            className="btn-primary py-1 px-2.5 rounded-lg text-[8px] flex items-center gap-1">
                            <Check size={11} /> Confirm
                          </button>
                        )}
                        {o.status === 'CONFIRMED' && (
                          <button onClick={() => doAction('deliver', () => orderService.deliverOrder(o.id))}
                            className="bg-blue-500 text-white py-1 px-2.5 rounded-lg text-[8px] font-black flex items-center gap-1 hover:bg-blue-600 transition-colors">
                            <Truck size={11} /> Deliver
                          </button>
                        )}
                        {(o.status === 'PENDING' || o.status === 'CONFIRMED') && (
                          <button onClick={() => { if (confirm(`Cancel Order #${o.id}?`)) doAction('cancel', () => orderService.cancelOrder(o.id)); }}
                            className="bg-red/10 text-red py-1 px-2.5 rounded-lg text-[8px] font-black flex items-center gap-1 hover:bg-red/20 transition-colors border border-red/20">
                            <Ban size={11} /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── USERS ─────────────────────────────────────────────────── */}
          {activeSection === 'user' && (
            <motion.div key="user" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border-c)]">
                  <h3 className="font-black italic uppercase text-xs">Users ({users.length})</h3>
                </div>
                <div className="divide-y divide-[var(--border-c)]">
                  {users.map(u => (
                    <div key={u.id} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black italic text-sm flex-shrink-0">
                          {u.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[var(--text-p)] truncate">{u.name}</p>
                          <p className="text-[10px] text-[var(--text-s)] font-bold truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-black text-primary text-sm">${Number(u.walletBalance).toFixed(2)}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          u.role === 'ADMIN' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-[var(--bg-main)] text-[var(--text-s)] border-[var(--border-c)]'
                        }`}>{u.role}</span>
                        {u.role === 'USER' && (
                          <button onClick={() => {
                            const amount = prompt(`Top up wallet for ${u.name} (e.g. 500):`);
                            if (amount && !isNaN(Number(amount))) {
                              doAction('topup', () => walletService.topUp(u.id, parseFloat(amount)));
                            }
                          }} className="btn-primary py-1 px-2.5 rounded-lg text-[8px]">
                            Top Up
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── CHAT ──────────────────────────────────────────────────── */}
          {activeSection === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex h-[calc(100vh-180px)] gap-4">
              {/* Inbox */}
              <div className="w-72 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] flex flex-col overflow-hidden flex-shrink-0">
                <div className="p-4 border-b border-[var(--border-c)] bg-primary text-white">
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Inbox</h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-c)] custom-scrollbar">
                  {inbox.length === 0 ? (
                    <div className="p-8 text-center opacity-30"><p className="text-[10px] font-black uppercase">Empty</p></div>
                  ) : inbox.map(item => (
                    <button key={item.userId} onClick={() => setActiveChatId(item.userId)}
                      className={`w-full p-4 text-left hover:bg-primary/5 transition-all ${activeChatId === item.userId ? 'bg-primary/10 border-r-2 border-primary' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-black text-[var(--text-p)]">{item.userName}</span>
                        {item.unreadCount > 0 && <span className="bg-red text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">{item.unreadCount}</span>}
                      </div>
                      <p className="text-[10px] text-[var(--text-s)] truncate font-bold">{item.lastMessage}</p>
                    </button>
                  ))}
                </div>
              </div>
              {/* Thread */}
              <div className="flex-1 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] flex flex-col overflow-hidden">
                {activeChatId ? (
                  <>
                    <div className="p-4 border-b border-[var(--border-c)] flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm">
                        {inbox.find(i => i.userId === activeChatId)?.userName[0]}
                      </div>
                      <h3 className="text-sm font-black italic">{inbox.find(i => i.userId === activeChatId)?.userName}</h3>
                    </div>
                    <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.senderRole === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs font-bold leading-relaxed ${
                            m.senderRole === 'ADMIN' ? 'bg-primary text-white rounded-tr-sm' : 'bg-[var(--bg-main)] text-[var(--text-p)] rounded-tl-sm border border-[var(--border-c)]'
                          }`}>
                            {m.content}
                            <div className={`text-[8px] mt-1 opacity-40 ${m.senderRole === 'ADMIN' ? 'text-right' : 'text-left'}`}>
                              {new Date(m.sentAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-[var(--border-c)]">
                      <div className="flex gap-3">
                        <input type="text" placeholder="Type a reply..." value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                          className="flex-1 bg-[var(--bg-main)] border border-[var(--border-c)] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                        <button onClick={handleSendReply} className="bg-primary text-white p-3 rounded-xl hover:scale-105 transition-transform">
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                    <MessageSquare size={80} strokeWidth={1} />
                    <p className="font-black uppercase tracking-widest text-[10px] mt-3">Select a conversation</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── ORDER DETAIL MODAL ──────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--card-bg)] w-full max-w-md rounded-[2rem] border border-[var(--border-c)] p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-5 right-5 text-[var(--text-s)] hover:text-red"><X size={20} /></button>
              <h2 className="text-xl font-black italic tracking-tighter mb-1">Order #{selectedOrder.id}</h2>
              <div className="flex items-center gap-2 mb-5">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[selectedOrder.status]}`}>{selectedOrder.status}</span>
                {selectedOrder.paymentMethod === 'PAY_LATER' && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">Pay Later</span>
                )}
              </div>
              <div className="space-y-2 mb-5 text-xs">
                <div className="flex justify-between"><span className="text-[var(--text-s)] font-bold">Customer</span><span className="font-black">{selectedOrder.userName}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-s)] font-bold">Email</span><span className="font-black text-[10px]">{selectedOrder.userEmail}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-s)] font-bold">Date</span><span className="font-black">{new Date(selectedOrder.createdAt).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-s)] font-bold">Payment</span><span className="font-black">{selectedOrder.paymentMethod}</span></div>
              </div>
              <div className="border-t border-[var(--border-c)] pt-4 mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)] mb-3">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[var(--text-s)] truncate max-w-[180px]">{item.productName} <span className="font-black">×{item.quantity}</span></span>
                      <span className="font-black text-[var(--text-p)]">${Number(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-[var(--border-c)] pt-4">
                <span className="font-black italic text-base">Total</span>
                <span className="font-black text-primary text-xl">${Number(selectedOrder.totalPrice).toFixed(2)}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PRODUCT MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--card-bg)] w-full max-w-lg rounded-[2rem] border border-[var(--border-c)] p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowAddModal(false)} className="absolute top-5 right-5 text-[var(--text-s)] hover:text-red"><X size={20} /></button>
              <h2 className="text-2xl font-black italic tracking-tighter mb-6">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Name</label>
                    <input required className="input-field py-2.5 text-xs" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Category</label>
                    <select required className="input-field py-2.5 text-xs" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                      {['ELECTRONICS','FOOD','CLOTHING','BEAUTY','SPORTS','OTHER'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Price ($)</label>
                    <input type="number" step="0.01" required className="input-field py-2.5 text-xs" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Stock</label>
                    <input type="number" required className="input-field py-2.5 text-xs" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Image URL</label>
                  <input className="input-field py-2.5 text-xs" value={productForm.imageUrl} onChange={e => setProductForm({...productForm, imageUrl: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Description</label>
                  <textarea rows={3} className="input-field py-2.5 text-xs" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={productForm.isFeatured} onChange={e => setProductForm({...productForm, isFeatured: e.target.checked})} className="w-4 h-4 accent-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Featured Product</span>
                </label>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  {isSubmitting ? 'Saving...' : (editProduct ? 'Save Changes' : 'Create Product')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
