import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShoppingCart, Package, BarChart3, MessageSquare,
  LogOut, Check, Clock, Loader2, Plus, X, DollarSign,
  Send, Truck, Ban, Eye, Edit2, AlertTriangle, TrendingUp,
  Star, Heart, Menu, Search, Wallet, Trash2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useStore } from '../context/store';
import { adminService, type AdminStats } from '../services/adminService';
import { orderService, type OrderResponse, type OrderStatus } from '../services/orderService';
import { productService, type Product } from '../services/productService';
import { userService, type UserProfile } from '../services/userService';
import { walletService } from '../services/walletService';
import type { TopUpRequestDto } from '../services/walletService';
import { chatService, type ChatInboxItem, type ChatMessage } from '../services/chatService';
import { getStockInfo, LOW_STOCK_THRESHOLD } from '../services/stockUtils';

type Section = 'dash' | 'prod' | 'ord' | 'user' | 'chat' | 'topup' | 'likes';

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber/10 text-amber border-amber/20',
  CONFIRMED: 'bg-blue-100 text-blue-600 border-blue-200',
  DELIVERED: 'bg-primary/10 text-primary border-primary/20',
  CANCELLED: 'bg-red/10 text-red border-red/20',
};

const PIE_COLORS = ['#FF8F00', '#2563eb', '#2E7D32', '#C62828'];

const AdminDashboard: React.FC = () => {
  const { logout, token } = useStore();
  const [activeSection, setActiveSection] = useState<Section>('dash');
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile overlay
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse

  // Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [topUpRequests, setTopUpRequests] = useState<TopUpRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  // Filters
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [topUpFilter, setTopUpFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [likesTab, setLikesTab] = useState<'likes' | 'ratings'>('likes');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  // Chat
  const [inbox, setInbox] = useState<ChatInboxItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const activeChatIdRef = useRef<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [adminReplyTo, setAdminReplyTo] = useState<ChatMessage | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
      const [s, o, p, u, i, tr] = await Promise.all([
        adminService.getStats(),
        orderService.getAllOrders(),
        productService.getAllProducts(),
        userService.getAllUsers(),
        chatService.getAdminInbox(),
        walletService.getAllRequests(),
      ]);
      setStats(s); setOrders(o); setProducts(p); setUsers(u); setInbox(i); setTopUpRequests(tr);
    } catch (err) { console.error('Failed to fetch admin data', err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    if (token) {
      chatService.connect(token, (newMsg) => {
        setMessages(prev => {
          if (newMsg.userId !== activeChatIdRef.current) return prev;
          return prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg];
        });
        chatService.getAdminInbox().then(setInbox);
      });
      chatService.subscribeToInbox(() => chatService.getAdminInbox().then(setInbox));
    }
    const inboxPoll = setInterval(() => chatService.getAdminInbox().then(setInbox), 5000);
    return () => { chatService.disconnect(); clearInterval(inboxPoll); };
  }, [token]);

  useEffect(() => {
    if (activeSection === 'chat' && activeChatId) {
      setMessages([]);
      chatService.subscribeToThread(activeChatId.toString());
      chatService.getThread(activeChatId).then(setMessages).catch(console.error);
      if (chatPollRef.current) clearInterval(chatPollRef.current);
      chatPollRef.current = setInterval(() => {
        if (activeChatIdRef.current) chatService.getThread(activeChatIdRef.current).then(setMessages).catch(() => {});
        chatService.getAdminInbox().then(setInbox).catch(() => {});
      }, 3000);
    } else {
      if (chatPollRef.current) clearInterval(chatPollRef.current);
    }
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, [activeSection, activeChatId]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages]);

  const doAction = async (label: string, fn: () => Promise<any>) => {
    setActionError('');
    try { await fn(); await fetchData(); }
    catch (err: any) { setActionError(err.response?.data?.message || `Failed: ${label}`); }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeChatId || isSendingReply) return;
    const text = replyText;
    const replySnippet = adminReplyTo ? adminReplyTo.content.slice(0, 100) : undefined;
    setReplyText(''); setAdminReplyTo(null); setIsSendingReply(true); setReplyError('');
    try {
      const sent = await chatService.adminReply(activeChatId, text, replySnippet);
      setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
      chatService.getAdminInbox().then(setInbox);
    } catch (err: any) {
      setReplyText(text);
      setReplyError(err.response?.data?.message || 'Failed to send reply');
      setTimeout(() => setReplyError(''), 4000);
    } finally { setIsSendingReply(false); }
  };

  const handleAdminDelete = async (messageId: number) => {
    try {
      await chatService.adminDeleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch { /* silent */ }
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
      // Ensure numeric fields are numbers, not strings from input fields
      // Also send 'featured' not 'isFeatured' — Jackson drops 'is' prefix for booleans
      const payload = {
        name: productForm.name,
        description: productForm.description || '',
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        category: productForm.category,
        imageUrl: productForm.imageUrl || '',
        featured: productForm.isFeatured === true,
      };
      if (editProduct) await productService.updateProduct(editProduct.id, payload);
      else await productService.createProduct(payload);
      setShowAddModal(false); setProductForm(emptyProduct); setEditProduct(null);
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to save product';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    finally { setIsSubmitting(false); }
  };

  const filteredOrders = orderFilter === 'ALL' ? orders : orders.filter(o => o.status === orderFilter);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));

  const navItems = [
    { id: 'dash',  name: 'Dashboard',    icon: <BarChart3 size={16} /> },
    { id: 'prod',  name: 'Products',     icon: <Package size={16} />, badge: products.filter(p => p.stock < LOW_STOCK_THRESHOLD).length },
    { id: 'ord',   name: 'Orders',       icon: <ShoppingCart size={16} />, badge: orders.filter(o => o.status === 'PENDING').length },
    { id: 'user',  name: 'Users',        icon: <Users size={16} /> },
    { id: 'likes', name: 'Likes & Ratings', icon: <Heart size={16} /> },
    { id: 'topup', name: 'Top-Up Req',   icon: <Wallet size={16} />, badge: topUpRequests.filter(r => r.status === 'PENDING').length },
    { id: 'chat',  name: 'Support',      icon: <MessageSquare size={16} />, badge: inbox.reduce((a, c) => a + c.unreadCount, 0) },
  ];

  if (loading && !stats) return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center gap-6">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="relative"
      >
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-[1.5rem] border-2 border-primary/40"
        />
        <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/30"
          style={{ background: 'linear-gradient(135deg, #2E7D32, #1b5e20)' }}>
          <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
            <text x="3" y="30" fontFamily="Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="28" fill="white" letterSpacing="-1">G</text>
          </svg>
        </div>
      </motion.div>
      {/* Dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.16 }}
          />
        ))}
      </div>
      <p className="font-black text-primary uppercase tracking-widest text-[10px]">Loading Admin Portal...</p>
    </div>
  );

  const SidebarContent = () => (
    <>
      <div className={`mb-6 flex items-center gap-3 ${sidebarCollapsed && !sidebarOpen ? 'justify-center px-0' : 'px-1'}`}>
        {/* Creative logo mark */}
        <div className="relative w-9 h-9 flex-shrink-0">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            <rect x="3" y="3" width="34" height="34" rx="10" fill="url(#sideGrad)" />
            <rect x="3" y="3" width="34" height="17" rx="10" fill="url(#sideShine)" />
            <text x="7" y="30" fontFamily="Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="24" fill="white" letterSpacing="-1">G</text>
            <circle cx="33" cy="9" r="3" fill="#4ade80" opacity="0.9" />
            <defs>
              <linearGradient id="sideGrad" x1="3" y1="3" x2="37" y2="37" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2E7D32" />
                <stop offset="100%" stopColor="#1b5e20" />
              </linearGradient>
              <linearGradient id="sideShine" x1="3" y1="3" x2="3" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {(!sidebarCollapsed || sidebarOpen) && (
          <div className="min-w-0">
            <p className="text-sm font-black text-[var(--text-p)] italic tracking-tighter leading-none truncate">GURA NEZA</p>
            <p className="text-[7px] font-black text-primary uppercase tracking-[0.3em] mt-0.5">Admin Portal</p>
          </div>
        )}
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => (
          <button key={item.id}
            onClick={() => { setActiveSection(item.id as Section); setSidebarOpen(false); }}
            title={sidebarCollapsed && !sidebarOpen ? item.name : undefined}
            className={`relative flex items-center w-full px-3 py-2.5 rounded-xl transition-all ${
              activeSection === item.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-[var(--text-s)] hover:bg-primary/5 hover:text-[var(--text-p)]'
            } ${sidebarCollapsed && !sidebarOpen ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center min-w-0 ${sidebarCollapsed && !sidebarOpen ? 'justify-center' : 'gap-2.5'}`}>
              <span className="flex-shrink-0">{item.icon}</span>
              {(!sidebarCollapsed || sidebarOpen) && (
                <span className="text-[11px] font-black uppercase tracking-wide truncate">{item.name}</span>
              )}
            </div>
            {(!sidebarCollapsed || sidebarOpen) && (item.badge ?? 0) > 0 && (
              <span className="bg-red text-white text-[8px] min-w-[18px] h-4 px-1 flex items-center justify-center rounded-full font-black flex-shrink-0 ml-1">{item.badge}</span>
            )}
            {(sidebarCollapsed && !sidebarOpen) && (item.badge ?? 0) > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red rounded-full" />
            )}
          </button>
        ))}
      </nav>
      <div className="mt-4 pt-4 border-t border-[var(--border-c)]">
        <button onClick={logout}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red hover:bg-red/5 transition-all w-full ${sidebarCollapsed && !sidebarOpen ? 'justify-center' : ''}`}>
          <LogOut size={15} />
          {(!sidebarCollapsed || sidebarOpen) && <span className="text-[11px] font-black uppercase tracking-wide">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body flex">

      {/* ── MOBILE OVERLAY ─────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 bg-[var(--card-bg)] border-r border-[var(--border-c)] flex flex-col py-6 px-4 z-40 lg:hidden shadow-2xl">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────── */}
      <aside className={`hidden lg:flex flex-col py-6 px-4 fixed h-full z-20 bg-[var(--card-bg)] border-r border-[var(--border-c)] transition-all duration-300 ${sidebarCollapsed ? 'w-[76px]' : 'w-72'}`}>
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[76px]' : 'lg:ml-72'} min-h-screen`}>

        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--border-c)] px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile open */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-[var(--text-s)] hover:bg-primary/5 hover:text-primary transition-all">
              <Menu size={20} />
            </button>
            {/* Desktop collapse toggle — always fully visible in the top bar */}
            <button
              onClick={() => setSidebarCollapsed(c => !c)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={16} />
            </button>
            <h1 className="text-sm font-black text-[var(--text-p)] italic tracking-tighter uppercase">
              {navItems.find(n => n.id === activeSection)?.name ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="p-2 rounded-xl text-[var(--text-s)] hover:bg-primary/5 hover:text-primary transition-all" title="Refresh">
              <Loader2 size={16} className={loading ? 'animate-spin text-primary' : ''} />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {/* Global error */}
          <AnimatePresence>
            {actionError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 flex items-center gap-3 bg-red/10 border border-red/20 text-red p-3 rounded-2xl">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span className="text-xs font-black flex-1">{actionError}</span>
                <button onClick={() => setActionError('')}><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ─────────────────────────────────────────── */}
            {activeSection === 'dash' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* KPI row */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: 'Today Revenue', value: `RWF ${Number(stats?.todayRevenue ?? 0).toLocaleString('en-RW')}`, sub: 'confirmed orders', icon: <DollarSign size={18} />, color: 'text-primary bg-primary/10' },
                    { label: 'Total Revenue', value: `RWF ${Number(stats?.totalRevenue ?? 0).toLocaleString('en-RW')}`, sub: 'all time', icon: <TrendingUp size={18} />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Total Orders', value: stats?.totalOrdersCount ?? 0, sub: `${stats?.pendingOrdersCount ?? 0} pending`, icon: <ShoppingCart size={18} />, color: 'text-amber bg-amber/10' },
                    { label: 'Total Users', value: stats?.totalUsersCount ?? 0, sub: `${stats?.totalProductsCount ?? 0} products`, icon: <Users size={18} />, color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20' },
                  ].map((kpi, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="bg-[var(--card-bg)] p-4 sm:p-5 rounded-2xl border border-[var(--border-c)] shadow-sm hover:shadow-md transition-shadow">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>{kpi.icon}</div>
                      <p className="text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest mb-1">{kpi.label}</p>
                      <h3 className="text-xl sm:text-2xl font-black text-[var(--text-p)] italic tracking-tighter leading-none mb-1">{kpi.value}</h3>
                      <p className="text-[9px] text-[var(--text-s)] font-bold">{kpi.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Order status pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Pending',   value: stats?.pendingOrdersCount ?? 0,   c: 'bg-amber/10 text-amber border-amber/20' },
                    { label: 'Confirmed', value: stats?.confirmedOrdersCount ?? 0, c: 'bg-blue-100 text-blue-600 border-blue-200' },
                    { label: 'Delivered', value: stats?.deliveredOrdersCount ?? 0, c: 'bg-primary/10 text-primary border-primary/20' },
                    { label: 'Cancelled', value: stats?.cancelledOrdersCount ?? 0, c: 'bg-red/10 text-red border-red/20' },
                  ].map((s, i) => (
                    <div key={i} className={`p-3 rounded-xl border text-center cursor-pointer hover:opacity-80 transition-opacity ${s.c}`}
                      onClick={() => { setOrderFilter(s.label.toUpperCase() as any); setActiveSection('ord'); }}>
                      <p className="text-2xl font-black italic">{s.value}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Low stock alert */}
                {(stats?.lowStockCount ?? 0) > 0 && (
                  <div className="flex items-center gap-3 bg-amber/10 border border-amber/20 text-amber p-3 rounded-2xl">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    <span className="text-xs font-black">{stats?.lowStockCount} product{(stats?.lowStockCount ?? 0) !== 1 ? 's' : ''} running low on stock</span>
                    <button onClick={() => setActiveSection('prod')} className="ml-auto text-[9px] font-black uppercase tracking-widest hover:underline">View →</button>
                  </div>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black italic text-sm text-[var(--text-p)]">Revenue — Last 7 Days</h3>
                        <p className="text-[9px] text-[var(--text-s)] font-bold uppercase tracking-widest mt-0.5">Daily earnings</p>
                      </div>
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><TrendingUp size={15} /></div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={stats?.revenueChart ?? []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--text-s)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: 'var(--text-s)' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-c)', borderRadius: 10, fontSize: 11 }} formatter={(v: any) => [`RWF ${Number(v).toLocaleString('en-RW')}`, 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={2.5} fill="url(#rg)" dot={{ fill: '#2E7D32', r: 3 }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black italic text-sm text-[var(--text-p)]">Orders by Status</h3>
                        <p className="text-[9px] text-[var(--text-s)] font-bold uppercase tracking-widest mt-0.5">Distribution</p>
                      </div>
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><ShoppingCart size={15} /></div>
                    </div>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={Object.entries(stats?.ordersByStatus ?? {}).map(([name, value]) => ({ name, value }))}
                          cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                          {Object.keys(stats?.ordersByStatus ?? {}).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % 4]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-c)', borderRadius: 10, fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {Object.entries(stats?.ordersByStatus ?? {}).map(([name, value], i) => (
                        <div key={name} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % 4] }} />
                          <span className="text-[8px] font-black text-[var(--text-s)] uppercase truncate">{name} ({value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black italic text-sm text-[var(--text-p)]">Daily Orders</h3>
                        <p className="text-[9px] text-[var(--text-s)] font-bold uppercase tracking-widest mt-0.5">Last 7 days</p>
                      </div>
                      <div className="w-8 h-8 bg-amber/10 rounded-xl flex items-center justify-center text-amber"><BarChart3 size={15} /></div>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={stats?.revenueChart ?? []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--text-s)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: 'var(--text-s)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-c)', borderRadius: 10, fontSize: 11 }} />
                        <Bar dataKey="orders" fill="#FF8F00" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black italic text-sm text-[var(--text-p)]">Top Products</h3>
                        <p className="text-[9px] text-[var(--text-s)] font-bold uppercase tracking-widest mt-0.5">By likes</p>
                      </div>
                      <div className="w-8 h-8 bg-red/10 rounded-xl flex items-center justify-center text-red"><Heart size={15} /></div>
                    </div>
                    <div className="space-y-3">
                      {(stats?.topProducts ?? []).map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-[var(--text-s)] w-4 flex-shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-[var(--text-p)] truncate">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-1.5 bg-[var(--border-c)] rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (p.likes / Math.max(1, stats?.topProducts?.[0]?.likes ?? 1)) * 100)}%` }} />
                              </div>
                              <span className="text-[9px] font-black text-[var(--text-s)] flex-shrink-0">{p.likes} ♥</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star size={10} className="text-gold" fill="#FFD700" />
                            <span className="text-[9px] font-black text-[var(--text-s)]">{(p.rating ?? 0).toFixed(1)}</span>
                          </div>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 ${getStockInfo(p.stock).bg} ${getStockInfo(p.stock).text}`}>{p.stock}</span>
                        </div>
                      ))}
                      {(stats?.topProducts ?? []).length === 0 && <p className="text-[10px] text-[var(--text-s)] font-bold text-center py-4 opacity-40">No data yet</p>}
                    </div>
                  </div>
                </div>

                {/* Recent orders — card list */}
                <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-[var(--border-c)] flex justify-between items-center">
                    <h3 className="font-black italic uppercase text-xs">Recent Orders</h3>
                    <button onClick={() => setActiveSection('ord')} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">View All →</button>
                  </div>
                  <div className="divide-y divide-[var(--border-c)]">
                    {orders.slice(0, 6).map(o => (
                      <div key={o.id}
                        className="p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(o)}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border text-xs ${STATUS_STYLES[o.status]}`}>
                          {o.status === 'PENDING'   && <Clock size={13} />}
                          {o.status === 'CONFIRMED' && <Check size={13} />}
                          {o.status === 'DELIVERED' && <Truck size={13} />}
                          {o.status === 'CANCELLED' && <Ban size={13} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-[var(--text-p)] italic truncate">#{o.id} — {o.userName ?? '—'}</p>
                          <p className="text-[9px] text-[var(--text-s)] font-bold">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-black text-primary text-xs">RWF {Number(o.totalPrice).toLocaleString('en-RW')}</span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border hidden sm:inline ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="p-8 text-center opacity-30"><p className="text-xs font-black uppercase">No orders yet</p></div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PRODUCTS ──────────────────────────────────────────── */}
            {activeSection === 'prod' && (
              <motion.div key="prod" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-s)]" />
                    <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search products..." className="input-field pl-9 py-2.5 text-xs w-full" />
                  </div>
                  <button onClick={openAddModal} className="btn-primary py-2 px-4 rounded-xl text-[9px] flex items-center gap-1.5 flex-shrink-0">
                    <Plus size={13} /> Add Product
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                      <div className="relative h-40 bg-[var(--bg-main)] flex items-center justify-center p-4">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <Package size={40} className="text-[var(--text-s)] opacity-20" />
                        )}
                        <span className={`absolute top-2 right-2 text-[8px] font-black px-2 py-0.5 rounded-full ${getStockInfo(p.stock).bg} ${getStockInfo(p.stock).text}`}>
                          {getStockInfo(p.stock).shortLabel}
                        </span>
                        {p.isFeatured && <span className="absolute top-2 left-2 text-[8px] font-black px-2 py-0.5 rounded-full bg-primary text-white">Featured</span>}
                      </div>
                      <div className="p-4">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{p.category}</p>
                        <h4 className="font-black text-[var(--text-p)] text-sm italic tracking-tight truncate mb-2">{p.name}</h4>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-black text-primary text-base">RWF {Number(p.price).toLocaleString('en-RW')}</span>
                          <div className="flex items-center gap-2 text-[10px] text-[var(--text-s)] font-bold">
                            <span className="flex items-center gap-0.5"><Heart size={10} className="text-red" /> {p.likesCount ?? 0}</span>
                            <span className="flex items-center gap-0.5"><Star size={10} className="text-gold" fill="#FFD700" /> {(p.rating ?? 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(p)} className="flex-1 py-1.5 rounded-lg border border-[var(--border-c)] text-[9px] font-black text-[var(--text-s)] hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1">
                            <Edit2 size={11} /> Edit
                          </button>
                          <button onClick={() => doAction('delete', () => productService.deleteProduct(p.id))}
                            className="flex-1 py-1.5 rounded-lg border border-red/20 text-[9px] font-black text-red hover:bg-red/5 transition-all flex items-center justify-center gap-1">
                            <X size={11} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-16 opacity-30"><Package size={48} className="mx-auto mb-3" /><p className="font-black uppercase text-xs">No products found</p></div>
                )}
              </motion.div>
            )}

            {/* ── ORDERS ────────────────────────────────────────────── */}
            {activeSection === 'ord' && (
              <motion.div key="ord" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Filter pills */}
                <div className="flex gap-2 flex-wrap">
                  {(['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const).map(f => (
                    <button key={f} onClick={() => setOrderFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${orderFilter === f ? 'bg-primary text-white shadow-md' : 'bg-[var(--card-bg)] text-[var(--text-s)] border border-[var(--border-c)] hover:border-primary/40'}`}>
                      {f} {f !== 'ALL' && `(${orders.filter(o => o.status === f).length})`}
                    </button>
                  ))}
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="py-20 text-center opacity-30"><ShoppingCart size={48} className="mx-auto mb-3" /><p className="text-xs font-black uppercase">No orders found</p></div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredOrders.map((o, i) => (
                      <motion.div key={o.id}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        {/* Coloured top strip by status */}
                        <div className={`h-1 w-full ${
                          o.status === 'PENDING' ? 'bg-amber' :
                          o.status === 'CONFIRMED' ? 'bg-blue-500' :
                          o.status === 'DELIVERED' ? 'bg-primary' : 'bg-red'
                        }`} />
                        <div className="p-4">
                          {/* Header row */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-black text-[var(--text-p)] italic">Order #{o.id}</p>
                              <p className="text-[10px] text-[var(--text-s)] font-bold mt-0.5">{o.userName ?? '—'} · {new Date(o.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                              {o.paymentMethod === 'PAY_LATER' && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">Pay Later</span>}
                            </div>
                          </div>

                          {/* Items preview */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {o.items.slice(0, 3).map(item => (
                              <span key={item.id} className="text-[9px] font-bold bg-[var(--bg-main)] text-[var(--text-s)] px-2 py-1 rounded-full border border-[var(--border-c)] truncate max-w-[120px]">
                                {item.productName} ×{item.quantity}
                              </span>
                            ))}
                            {o.items.length > 3 && (
                              <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">+{o.items.length - 3} more</span>
                            )}
                          </div>

                          {/* Footer row */}
                          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-c)]">
                            <span className="font-black text-primary text-base italic">RWF {Number(o.totalPrice).toLocaleString('en-RW')}</span>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => setSelectedOrder(o)}
                                className="p-1.5 text-[var(--text-s)] hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                <Eye size={14} />
                              </button>
                              {o.status === 'PENDING' && (
                                <button onClick={() => doAction('confirm', () => orderService.confirmOrder(o.id))}
                                  className="btn-primary py-1 px-2.5 rounded-full text-[8px] flex items-center gap-1">
                                  <Check size={10} /> Confirm
                                </button>
                              )}
                              {o.status === 'CONFIRMED' && (
                                <button onClick={() => doAction('deliver', () => orderService.deliverOrder(o.id))}
                                  className="bg-blue-500 text-white py-1 px-2.5 rounded-full text-[8px] font-black flex items-center gap-1 hover:bg-blue-600 transition-colors">
                                  <Truck size={10} /> Deliver
                                </button>
                              )}
                              {(o.status === 'PENDING' || o.status === 'CONFIRMED') && (
                                <button onClick={() => { if (confirm(`Cancel Order #${o.id}?`)) doAction('cancel', () => orderService.cancelOrder(o.id)); }}
                                  className="bg-red/10 text-red py-1 px-2.5 rounded-full text-[8px] font-black flex items-center gap-1 hover:bg-red/20 transition-colors border border-red/20">
                                  <Ban size={10} /> Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── USERS ─────────────────────────────────────────────── */}
            {activeSection === 'user' && (
              <motion.div key="user" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="relative max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-s)]" />
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9 py-2.5 text-xs w-full" />
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="py-20 text-center opacity-30"><Users size={48} className="mx-auto mb-3" /><p className="text-xs font-black uppercase">No users found</p></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredUsers.map((u, i) => (
                      <motion.div key={u.id}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] p-5 shadow-sm hover:shadow-md transition-all">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black text-lg italic flex-shrink-0">
                            {u.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-[var(--text-p)] truncate">{u.name}</p>
                            <p className="text-[10px] text-[var(--text-s)] font-bold truncate">{u.email}</p>
                          </div>
                          <span className={`ml-auto text-[8px] font-black uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${u.role === 'ADMIN' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-[var(--bg-main)] text-[var(--text-s)] border-[var(--border-c)]'}`}>
                            {u.role}
                          </span>
                        </div>

                        {/* Wallet balance */}
                        <div className="bg-[var(--bg-main)] rounded-xl p-3 mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[var(--text-s)]">
                            <Wallet size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Wallet</span>
                          </div>
                          <span className="font-black text-primary text-sm">RWF {Number(u.walletBalance).toLocaleString('en-RW')}</span>
                        </div>

                        {/* Action */}
                        {u.role === 'USER' && (
                          <button
                            onClick={() => {
                              const a = prompt(`Top up wallet for ${u.name}:`);
                              if (a && !isNaN(Number(a))) doAction('topup', () => walletService.topUp(u.id, parseFloat(a)));
                            }}
                            className="w-full btn-primary py-2 rounded-full text-[9px] flex items-center justify-center gap-1.5">
                            <Plus size={12} /> Top Up Wallet
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── LIKES & RATINGS ───────────────────────────────────── */}
            {activeSection === 'likes' && (
              <motion.div key="likes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex gap-2">
                  {(['likes', 'ratings'] as const).map(t => (
                    <button key={t} onClick={() => setLikesTab(t)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${likesTab === t ? 'bg-primary text-white shadow-md' : 'bg-[var(--card-bg)] text-[var(--text-s)] border border-[var(--border-c)] hover:border-primary/40'}`}>
                      {t === 'likes' ? '♥ Product Likes' : '★ Product Ratings'}
                    </button>
                  ))}
                </div>

                {likesTab === 'likes' && (
                  <div className="space-y-3">
                    {[...products].sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0)).map((p, i) => {
                      const maxLikes = Math.max(1, ...products.map(x => x.likesCount ?? 0));
                      const pct = Math.round(((p.likesCount ?? 0) / maxLikes) * 100);
                      return (
                        <div key={p.id} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                          {/* Rank */}
                          <span className="text-[10px] font-black text-[var(--text-s)] w-5 flex-shrink-0 text-center">{i + 1}</span>
                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border-c)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                              : <Package size={16} className="text-[var(--text-s)] opacity-30" />}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-[var(--text-p)] truncate">{p.name}</p>
                            <p className="text-[9px] font-bold text-[var(--text-s)] uppercase">{p.category}</p>
                            <div className="mt-1.5 h-1.5 bg-[var(--border-c)] rounded-full overflow-hidden">
                              <div className="h-full bg-red rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          {/* Count */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Heart size={13} className="text-red" fill="#C62828" />
                            <span className="font-black text-sm text-[var(--text-p)]">{p.likesCount ?? 0}</span>
                          </div>
                        </div>
                      );
                    })}
                    {products.length === 0 && (
                      <div className="text-center py-12 opacity-30"><Heart size={40} className="mx-auto mb-2" /><p className="text-xs font-black uppercase">No data yet</p></div>
                    )}
                  </div>
                )}

                {likesTab === 'ratings' && (
                  <div className="space-y-3">
                    {[...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).map((p, i) => {
                      const pct = Math.round(((p.rating ?? 0) / 5) * 100);
                      return (
                        <div key={p.id} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                          {/* Rank */}
                          <span className="text-[10px] font-black text-[var(--text-s)] w-5 flex-shrink-0 text-center">{i + 1}</span>
                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border-c)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                              : <Package size={16} className="text-[var(--text-s)] opacity-30" />}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-[var(--text-p)] truncate">{p.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={10}
                                  fill={s <= Math.round(p.rating ?? 0) ? '#FFD700' : 'none'}
                                  stroke="#FFD700" strokeWidth={1.5} />
                              ))}
                              <span className="text-[9px] font-black text-[var(--text-s)] ml-1">{(p.rating ?? 0).toFixed(1)}</span>
                            </div>
                            <div className="mt-1.5 h-1.5 bg-[var(--border-c)] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#FFD700' }} />
                            </div>
                          </div>
                          {/* Reviews */}
                          <div className="flex-shrink-0 text-center">
                            <p className="font-black text-sm text-[var(--text-p)]">{p.totalReviews ?? 0}</p>
                            <p className="text-[8px] font-bold text-[var(--text-s)] uppercase">reviews</p>
                          </div>
                        </div>
                      );
                    })}
                    {products.length === 0 && (
                      <div className="text-center py-12 opacity-30"><Star size={40} className="mx-auto mb-2" /><p className="text-xs font-black uppercase">No data yet</p></div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── TOP-UP REQUESTS ───────────────────────────────────── */}
            {activeSection === 'topup' && (
              <motion.div key="topup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Filter pills */}
                <div className="flex gap-2 flex-wrap">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
                    <button key={f} onClick={() => setTopUpFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${topUpFilter === f ? 'bg-primary text-white shadow-md' : 'bg-[var(--card-bg)] text-[var(--text-s)] border border-[var(--border-c)] hover:border-primary/40'}`}>
                      {f} {f !== 'ALL' && `(${topUpRequests.filter(r => r.status === f).length})`}
                    </button>
                  ))}
                </div>

                {(() => {
                  const filtered = topUpRequests.filter(r => topUpFilter === 'ALL' || r.status === topUpFilter);
                  if (filtered.length === 0) return (
                    <div className="py-20 text-center opacity-30"><Wallet size={48} className="mx-auto mb-3" /><p className="text-xs font-black uppercase">No requests found</p></div>
                  );
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filtered.map((r, i) => (
                        <motion.div key={r.id}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] overflow-hidden shadow-sm hover:shadow-md transition-all">
                          {/* Status strip */}
                          <div className={`h-1 w-full ${r.status === 'PENDING' ? 'bg-amber' : r.status === 'APPROVED' ? 'bg-primary' : 'bg-red'}`} />
                          <div className="p-5">
                            {/* User info */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic flex-shrink-0">
                                {r.userName?.[0] ?? '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-[var(--text-p)] truncate">{r.userName}</p>
                                <p className="text-[10px] text-[var(--text-s)] font-bold truncate">{r.userEmail}</p>
                              </div>
                            </div>

                            {/* Amount highlight */}
                            <div className="bg-[var(--bg-main)] rounded-xl p-4 mb-4 text-center">
                              <p className="text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest mb-1">Requested Amount</p>
                              <p className="text-2xl font-black text-primary italic">RWF {Number(r.amount).toLocaleString('en-RW')}</p>
                            </div>

                            {/* Status + date */}
                            <div className="flex items-center justify-between mb-4">
                              <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                r.status === 'PENDING'  ? 'bg-amber/10 text-amber border-amber/20' :
                                r.status === 'APPROVED' ? 'bg-primary/10 text-primary border-primary/20' :
                                'bg-red/10 text-red border-red/20'
                              }`}>{r.status}</span>
                              <span className="text-[9px] text-[var(--text-s)] font-bold">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Actions */}
                            {r.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <button onClick={() => doAction('approve', () => walletService.approveRequest(r.id))}
                                  className="flex-1 btn-primary py-2 rounded-full text-[9px] flex items-center justify-center gap-1">
                                  <Check size={11} /> Approve
                                </button>
                                <button onClick={() => doAction('reject', () => walletService.rejectRequest(r.id))}
                                  className="flex-1 bg-red/10 text-red py-2 rounded-full text-[9px] font-black flex items-center justify-center gap-1 hover:bg-red/20 transition-colors border border-red/20">
                                  <Ban size={11} /> Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* ── CHAT ──────────────────────────────────────────────── */}
            {activeSection === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex gap-4" style={{ height: 'calc(100vh - 140px)' }}>
                <div className="w-64 flex-shrink-0 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-[var(--border-c)] bg-primary text-white">
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Inbox ({inbox.length})</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-c)] custom-scrollbar">
                    {inbox.length === 0 ? (
                      <div className="p-8 text-center opacity-30"><p className="text-[10px] font-black uppercase">Empty</p></div>
                    ) : inbox.map(item => (
                      <button key={item.userId} onClick={() => { setActiveChatId(item.userId); setAdminReplyTo(null); }}
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
                <div className="flex-1 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-c)] flex flex-col overflow-hidden">
                  {activeChatId ? (
                    <>
                      <div className="p-4 border-b border-[var(--border-c)] flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm">{inbox.find(i => i.userId === activeChatId)?.userName[0]}</div>
                        <h3 className="text-sm font-black italic">{inbox.find(i => i.userId === activeChatId)?.userName}</h3>
                      </div>
                      <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {messages.map((m, i) => {
                          const isAdmin = m.senderRole === 'ADMIN';
                          return (
                            <div key={m.id ?? i} className={`flex group/amsg ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className="relative">
                                <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs font-bold leading-relaxed ${isAdmin ? 'bg-primary text-white rounded-tr-sm' : 'bg-[var(--bg-main)] text-[var(--text-p)] rounded-tl-sm border border-[var(--border-c)]'}`}>
                                  {/* Reply preview */}
                                  {m.replyToContent && (
                                    <div className={`text-[9px] font-black mb-1.5 px-2 py-1 rounded-lg border-l-2 truncate ${isAdmin ? 'bg-white/15 border-white/40 text-white/60' : 'bg-[var(--card-bg)] border-primary/40 text-[var(--text-s)]'}`}>
                                      ↩ {m.replyToContent}
                                    </div>
                                  )}
                                  {m.content}
                                  <div className={`text-[8px] mt-1 opacity-40 ${isAdmin ? 'text-right' : 'text-left'}`}>{new Date(m.sentAt).toLocaleTimeString()}</div>
                                </div>
                                {/* Hover actions */}
                                <div className={`absolute top-1/2 -translate-y-1/2 hidden group-hover/amsg:flex items-center gap-1 ${isAdmin ? '-left-16' : '-right-16'}`}>
                                  {/* Reply — on user messages only */}
                                  {!isAdmin && (
                                    <button onClick={() => { setAdminReplyTo(m); setTimeout(() => document.getElementById('admin-reply-input')?.focus(), 50); }}
                                      title="Reply" className="w-6 h-6 bg-[var(--card-bg)] border border-[var(--border-c)] rounded-lg flex items-center justify-center text-[var(--text-s)] hover:text-primary hover:border-primary transition-all shadow-sm">
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                                      </svg>
                                    </button>
                                  )}
                                  {/* Delete — on any message */}
                                  {m.id && (
                                    <button onClick={() => handleAdminDelete(m.id!)}
                                      title="Delete message" className="w-6 h-6 bg-[var(--card-bg)] border border-[var(--border-c)] rounded-lg flex items-center justify-center text-[var(--text-s)] hover:text-red hover:border-red transition-all shadow-sm">
                                      <Trash2 size={10} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-4 border-t border-[var(--border-c)]">
                        {replyError && <div className="mb-2 px-3 py-2 bg-red/10 border border-red/20 rounded-xl text-[10px] font-black text-red">{replyError}</div>}
                        {/* Reply preview bar */}
                        {adminReplyTo && (
                          <div className="mb-2 flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                              <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                            </svg>
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest flex-shrink-0">Replying to user</span>
                            <span className="text-[9px] font-bold text-[var(--text-s)] truncate flex-1">{adminReplyTo.content}</span>
                            <button onClick={() => setAdminReplyTo(null)} className="text-[var(--text-s)] hover:text-red transition-colors flex-shrink-0">
                              <X size={12} />
                            </button>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <input id="admin-reply-input" type="text" placeholder="Type a reply..." value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                            disabled={isSendingReply}
                            className="flex-1 bg-[var(--bg-main)] border border-[var(--border-c)] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50" />
                          <button onClick={handleSendReply} disabled={isSendingReply || !replyText.trim()}
                            className="bg-primary text-white p-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-40 flex items-center justify-center">
                            {isSendingReply ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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
        </div>
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
                {selectedOrder.paymentMethod === 'PAY_LATER' && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">Pay Later</span>}
              </div>
              <div className="space-y-2 mb-5 text-xs">
                <div className="flex justify-between"><span className="text-[var(--text-s)] font-bold">Customer</span><span className="font-black">{selectedOrder.userName}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-s)] font-bold">Email</span><span className="font-black text-[10px]">{selectedOrder.userEmail}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-s)] font-bold">Date</span><span className="font-black">{new Date(selectedOrder.createdAt).toLocaleString()}</span></div>
              </div>
              <div className="border-t border-[var(--border-c)] pt-4 mb-4 space-y-2">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[var(--text-s)] truncate max-w-[180px]">{item.productName} <span className="font-black">×{item.quantity}</span></span>
                    <span className="font-black text-[var(--text-p)]">RWF {Number(item.subtotal).toLocaleString('en-RW')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-[var(--border-c)] pt-4">
                <span className="font-black italic text-base">Total</span>
                <span className="font-black text-primary text-xl">RWF {Number(selectedOrder.totalPrice).toLocaleString('en-RW')}</span>
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
                      {['ELECTRONICS','FOOD','CLOTHING','BEAUTY','SPORTS','OTHER'].map(c => <option key={c} value={c}>{c}</option>)}
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
