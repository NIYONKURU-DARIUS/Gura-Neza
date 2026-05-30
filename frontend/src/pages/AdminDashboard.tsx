import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShoppingCart, DollarSign, Package, 
  BarChart3, MessageSquare, Bell, Search,
  LogOut, Check, Clock, Truck, TrendingUp
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useStore } from '../context/store';

const dataRevenue = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const categoryData = [
  { name: 'Food', value: 400, color: '#2E7D32' },
  { name: 'Electronics', value: 300, color: '#4CAF50' },
  { name: 'Fashion', value: 300, color: '#81C784' },
];

const mockOrders = [
  { id: '#GN-4592', customer: 'Niyonkuru D.', product: 'Emerald Watch', amount: '$299', status: 'Delayed' },
  { id: '#GN-4591', customer: 'Irakoze G.', product: 'Smart Laptop', amount: '$1,299', status: 'Shipped' },
  { id: '#GN-4590', customer: 'Uwase M.', product: 'Arabica Coffee', amount: '$25', status: 'Delivered' },
  { id: '#GN-4589', customer: 'Habimana J.', product: 'Wireless Buds', amount: '$89', status: 'Pending' },
];

const mockUsers = [
  { name: 'Niyonkuru Darius', email: 'darius@example.com', role: 'USER', joined: 'Jan 2026', orders: 12 },
  { name: 'Irakoze Grace', email: 'grace@example.com', role: 'USER', joined: 'Feb 2026', orders: 5 },
  { name: 'Uwase Marie', email: 'marie@example.com', role: 'ADMIN', joined: 'Dec 2025', orders: 0 },
  { name: 'Habimana Jean', email: 'jean@example.com', role: 'USER', joined: 'Mar 2026', orders: 3 },
];

const mockProducts = [
  { name: 'Emerald Smart Watch', category: 'Electronics', price: '$299', stock: 12, status: 'In Stock' },
  { name: 'Arabica Coffee Set', category: 'Food', price: '$25', stock: 3, status: 'Low Stock' },
  { name: 'Premium Laptop Pro', category: 'Electronics', price: '$1,299', stock: 0, status: 'Out of Stock' },
  { name: 'Kigali Cotton Shirt', category: 'Fashion', price: '$45', stock: 24, status: 'In Stock' },
];

const mockConversations = [
  {
    id: 1,
    user: 'Niyonkuru D.',
    avatar: 'N',
    status: 'Priority',
    unread: true,
    lastTime: '5m',
    messages: [
      { from: 'user', text: 'Hello, my order #GN-4592 is delayed. Can someone help?', time: '10:02 AM' },
      { from: 'admin', text: 'Hi Niyonkuru! We are looking into this right now.', time: '10:05 AM' },
      { from: 'user', text: 'It has been 3 days already, I really need this.', time: '10:06 AM' },
    ],
  },
  {
    id: 2,
    user: 'Irakoze G.',
    avatar: 'I',
    status: 'Active',
    unread: true,
    lastTime: '12m',
    messages: [
      { from: 'user', text: 'Is the emerald bezel watch available in gold colour?', time: '9:48 AM' },
      { from: 'admin', text: 'Great question! We currently have it in silver and black.', time: '9:51 AM' },
      { from: 'user', text: 'Okay, any chance it comes in gold soon?', time: '9:52 AM' },
    ],
  },
  {
    id: 3,
    user: 'Uwase M.',
    avatar: 'U',
    status: 'Resolved',
    unread: false,
    lastTime: '1h',
    messages: [
      { from: 'user', text: 'I topped up my wallet but the balance is not showing.', time: '8:30 AM' },
      { from: 'admin', text: 'Sorry for the inconvenience! Our team has fixed this. Please refresh.', time: '8:45 AM' },
      { from: 'user', text: 'It is working now, thank you!', time: '8:47 AM' },
    ],
  },
];

const sectionVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

type Section = 'dash' | 'prod' | 'ord' | 'user' | 'chat' | 'wall';

const AdminDashboard: React.FC = () => {
  const { isDarkMode } = useStore();
  const [activeSection, setActiveSection] = useState<Section>('dash');
  const [selectedConv, setSelectedConv] = useState(mockConversations[0]);
  const [replyText, setReplyText] = useState('');

  const navItems: { id: Section; name: string; icon: React.ReactElement; badge?: number }[] = [
    { id: 'dash', name: 'Intelligence', icon: <BarChart3 /> },
    { id: 'prod', name: 'Inventory', icon: <Package /> },
    { id: 'ord', name: 'Logistics', icon: <ShoppingCart /> },
    { id: 'user', name: 'Users', icon: <Users /> },
    { id: 'chat', name: 'Live Support', icon: <MessageSquare />, badge: mockConversations.filter(c => c.unread).length },
    { id: 'wall', name: 'Finances', icon: <DollarSign /> },
  ];

  const sectionTitles: Record<Section, { title: string; sub: string }> = {
    dash: { title: 'Business Intelligence', sub: 'Real-time ecosystem performance and operations.' },
    prod: { title: 'Inventory Control', sub: 'Manage products, stock levels, and categories.' },
    ord: { title: 'Logistics & Orders', sub: 'Track, fulfill, and resolve all customer orders.' },
    user: { title: 'User Management', sub: 'View and manage all registered users and admins.' },
    chat: { title: 'Live Support', sub: 'Real-time customer messages and resolution queue.' },
    wall: { title: 'Finances', sub: 'Revenue overview, wallet transactions, and payouts.' },
  };

  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    border: '1px solid var(--border-c)',
    borderRadius: '1rem',
    padding: '1rem 1.5rem',
    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
    fontWeight: 'bold',
    fontSize: '12px',
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body flex transition-colors duration-500 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-72 bg-[var(--card-bg)] border-r border-[var(--border-c)] flex flex-col py-8 px-5 fixed h-full z-20 transition-all duration-500">
        {/* Brand */}
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-primary/30 flex-shrink-0">G</div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-black text-[var(--text-p)] tracking-tighter italic leading-none truncate">GURA NEZA</span>
            <span className="text-[7px] font-black text-primary uppercase tracking-[0.35em] mt-0.5">Admin Central</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-[var(--text-s)] hover:text-primary hover:bg-primary/8'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {React.cloneElement(item.icon, {
                    size: 16,
                    className: isActive ? '' : 'group-hover:scale-110 transition-transform flex-shrink-0',
                  })}
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] truncate">{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="bg-red text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0 ml-2">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* System status */}
        <div className="mt-auto space-y-3">
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping flex-shrink-0" />
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">System Healthy</span>
            </div>
            <p className="text-[9px] font-bold text-[var(--text-s)] leading-snug italic">All Rwandan regions synchronized.</p>
          </div>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red hover:bg-red/10 transition-all w-full">
            <LogOut size={16} className="flex-shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] truncate">Shutdown Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-10 h-screen overflow-y-auto custom-scrollbar">
        {/* Header */}
        <header className="flex justify-between items-center mb-10 gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-p)] italic tracking-tighter truncate">
              {sectionTitles[activeSection].title}
            </h1>
            <p className="text-[var(--text-s)] font-bold text-xs mt-0.5">{sectionTitles[activeSection].sub}</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-s)]" size={14} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-[var(--card-bg)] border border-[var(--border-c)] rounded-xl pl-9 pr-4 py-2.5 outline-none text-xs font-bold w-52 focus:border-primary transition-all text-[var(--text-p)] shadow-sm"
              />
            </div>
            <button className="relative w-10 h-10 bg-[var(--card-bg)] border border-[var(--border-c)] text-[var(--text-p)] rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm flex-shrink-0">
              <Bell size={16} />
              <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red rounded-full border border-[var(--bg-main)]" />
            </button>
          </div>
        </header>

        {/* Section Views */}
        <AnimatePresence mode="wait">
          {activeSection === 'dash' && (
            <motion.div key="dash" variants={sectionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
              {/* KPI Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {[
                  { label: 'Revenue (Today)', value: '$12,450', icon: <DollarSign />, trend: '+12%' },
                  { label: 'Pending Orders', value: '28', icon: <ShoppingCart />, trend: 'Critical' },
                  { label: 'Active Users', value: '452', icon: <Users />, trend: 'Stable' },
                  { label: 'Support Queue', value: '3 Open', icon: <MessageSquare />, trend: 'High' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-c)] relative overflow-hidden group hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {React.cloneElement(s.icon as React.ReactElement<any>, { size: 18 })}
                      </div>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">{s.trend}</span>
                    </div>
                    <span className="text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest block mb-1">{s.label}</span>
                    <h3 className="text-xl font-black text-[var(--text-p)] italic tracking-tighter">{s.value}</h3>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-3 gap-8 mb-8">
                <section className="lg:col-span-2 bg-[var(--card-bg)] p-8 rounded-3xl border border-[var(--border-c)]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-black italic tracking-tighter flex items-center gap-2">
                      Market Performance
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-black">LIVE</span>
                    </h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dataRevenue}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#2C2C2C' : '#F1F8E9'} />
                        <XAxis dataKey="name" stroke={isDarkMode ? '#555' : '#AAA'} fontSize={9} axisLine={false} tickLine={false} />
                        <YAxis stroke={isDarkMode ? '#555' : '#AAA'} fontSize={9} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={4}
                          dot={{ r: 5, fill: '#2E7D32', strokeWidth: 3, stroke: isDarkMode ? '#1E1E1E' : '#FFF' }}
                          activeDot={{ r: 7, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="bg-[var(--card-bg)] p-8 rounded-3xl border border-[var(--border-c)] flex flex-col">
                  <h3 className="text-base font-black italic tracking-tighter mb-4">Inventory Mix</h3>
                  <div className="flex-1 relative min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                          {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <span className="text-[9px] font-black text-[var(--text-s)] uppercase block">Total</span>
                      <span className="text-lg font-black text-[var(--text-p)] italic">1.2K+</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {categoryData.map(c => (
                      <div key={c.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} /><span className="text-[10px] font-bold text-[var(--text-s)]">{c.name}</span></div>
                        <span className="text-[10px] font-black text-[var(--text-p)]">{c.value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeSection === 'prod' && (
            <motion.div key="prod" variants={sectionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-c)] overflow-hidden">
                <div className="p-6 border-b border-[var(--border-c)] flex justify-between items-center">
                  <h3 className="text-base font-black italic">All Products ({mockProducts.length})</h3>
                  <button className="btn-primary px-4 py-2 rounded-xl text-[10px]">+ Add Product</button>
                </div>
                <div className="divide-y divide-[var(--border-c)]">
                  {mockProducts.map((p, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between px-6 py-4 hover:bg-[var(--hover-c)] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Package size={18} /></div>
                        <div>
                          <p className="text-xs font-black text-[var(--text-p)]">{p.name}</p>
                          <p className="text-[10px] text-[var(--text-s)] font-bold">{p.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <span className="text-xs font-black text-primary italic">{p.price}</span>
                        <span className="text-[10px] font-bold text-[var(--text-s)]">Stock: {p.stock}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                          p.status === 'In Stock' ? 'bg-primary/10 text-primary' :
                          p.status === 'Low Stock' ? 'bg-amber/10 text-amber' : 'bg-red/10 text-red'
                        }`}>{p.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'ord' && (
            <motion.div key="ord" variants={sectionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-c)] overflow-hidden">
                <div className="p-6 border-b border-[var(--border-c)]">
                  <h3 className="text-base font-black italic">Order Fulfilment Queue</h3>
                </div>
                <div className="divide-y divide-[var(--border-c)]">
                  {mockOrders.map((o, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between px-6 py-4 hover:bg-[var(--hover-c)] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          o.status === 'Delivered' ? 'bg-primary/10 text-primary' :
                          o.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500' :
                          o.status === 'Delayed' ? 'bg-red/10 text-red' : 'bg-amber/10 text-amber'
                        }`}>
                          {o.status === 'Delivered' ? <Check size={16}/> : o.status === 'Shipped' ? <Truck size={16}/> : <Clock size={16}/>}
                        </div>
                        <div>
                          <p className="text-xs font-black text-[var(--text-p)]">{o.id} — {o.product}</p>
                          <p className="text-[10px] text-[var(--text-s)] font-bold">{o.customer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-xs font-black text-primary italic">{o.amount}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                          o.status === 'Delivered' ? 'bg-primary/10 text-primary' :
                          o.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500' :
                          o.status === 'Delayed' ? 'bg-red/10 text-red' : 'bg-amber/10 text-amber'
                        }`}>{o.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'user' && (
            <motion.div key="user" variants={sectionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-c)] overflow-hidden">
                <div className="p-6 border-b border-[var(--border-c)]">
                  <h3 className="text-base font-black italic">All Users ({mockUsers.length})</h3>
                </div>
                <div className="divide-y divide-[var(--border-c)]">
                  {mockUsers.map((u, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between px-6 py-4 hover:bg-[var(--hover-c)] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-sm italic">{u.name[0]}</div>
                        <div>
                          <p className="text-xs font-black text-[var(--text-p)]">{u.name}</p>
                          <p className="text-[10px] text-[var(--text-s)] font-bold">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <span className="text-[10px] font-bold text-[var(--text-s)]">{u.orders} orders</span>
                        <span className="text-[10px] font-bold text-[var(--text-s)]">Joined {u.joined}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                          u.role === 'ADMIN' ? 'bg-primary text-white' : 'bg-[var(--hover-c)] text-[var(--text-s)]'
                        }`}>{u.role}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'chat' && (
            <motion.div key="chat" variants={sectionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}
              className="flex gap-6 h-[calc(100vh-180px)]">

              {/* Left: Conversation List */}
              <div className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                <p className="text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest px-1 mb-2">
                  {mockConversations.filter(c => c.unread).length} Unread Conversations
                </p>
                {mockConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      selectedConv.id === conv.id
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-[var(--card-bg)] border-[var(--border-c)] hover:border-primary/20'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black italic">{conv.avatar}</div>
                      {conv.unread && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red rounded-full border border-[var(--bg-main)]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-black text-[var(--text-p)] truncate">{conv.user}</p>
                        <span className="text-[9px] text-[var(--text-s)] font-bold flex-shrink-0 ml-2">{conv.lastTime}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-s)] font-bold truncate">
                        {conv.messages[conv.messages.length - 1].text}
                      </p>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                        conv.status === 'Priority' ? 'bg-red/10 text-red' :
                        conv.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-[var(--hover-c)] text-[var(--text-s)]'
                      }`}>{conv.status}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right: Active Conversation Thread */}
              <div className="flex-1 bg-[var(--card-bg)] border border-[var(--border-c)] rounded-3xl flex flex-col overflow-hidden">
                {/* Thread Header */}
                <div className="flex items-center gap-4 p-5 border-b border-[var(--border-c)] flex-shrink-0">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black italic">{selectedConv.avatar}</div>
                  <div>
                    <p className="text-sm font-black text-[var(--text-p)] italic">{selectedConv.user}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${
                      selectedConv.status === 'Priority' ? 'text-red' :
                      selectedConv.status === 'Active' ? 'text-primary' : 'text-[var(--text-s)]'
                    }`}>{selectedConv.status}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
                  {selectedConv.messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      {msg.from === 'user' && (
                        <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-black text-[10px] mr-2 flex-shrink-0 self-end">{selectedConv.avatar}</div>
                      )}
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        msg.from === 'admin'
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-[var(--bg-main)] text-[var(--text-p)] border border-[var(--border-c)] rounded-tl-sm'
                      }`}>
                        <p className="text-xs font-bold leading-relaxed">{msg.text}</p>
                        <p className={`text-[9px] mt-1 ${msg.from === 'admin' ? 'text-white/60' : 'text-[var(--text-s)]'}`}>{msg.time}</p>
                      </div>
                      {msg.from === 'admin' && (
                        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-black text-[10px] ml-2 flex-shrink-0 self-end">A</div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Reply Box */}
                <div className="p-4 border-t border-[var(--border-c)] flex gap-3 flex-shrink-0">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 bg-[var(--bg-main)] border border-[var(--border-c)] rounded-xl px-4 py-2.5 text-xs font-bold text-[var(--text-p)] outline-none focus:border-primary transition-all"
                  />
                  <button className="btn-primary px-4 py-2 rounded-xl text-[10px]">Send</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'wall' && (
            <motion.div key="wall" variants={sectionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Total Revenue', value: '$87,240', sub: 'All-time' },
                  { label: 'This Month', value: '$12,450', sub: 'May 2026' },
                  { label: 'Wallet Pool', value: '$3,200', sub: 'Deposited balances' },
                ].map((f, i) => (
                  <div key={i} className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-c)]">
                    <span className="text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest block mb-3">{f.label}</span>
                    <h3 className="text-2xl font-black text-primary italic tracking-tighter">{f.value}</h3>
                    <p className="text-[10px] text-[var(--text-s)] font-bold mt-1">{f.sub}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[var(--card-bg)] p-8 rounded-3xl border border-[var(--border-c)]">
                <h3 className="text-base font-black italic mb-6 flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" /> Revenue Trend
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataRevenue}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#2C2C2C' : '#F1F8E9'} />
                      <XAxis dataKey="name" stroke={isDarkMode ? '#555' : '#AAA'} fontSize={9} axisLine={false} tickLine={false} />
                      <YAxis stroke={isDarkMode ? '#555' : '#AAA'} fontSize={9} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="revenue" fill="#2E7D32" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
