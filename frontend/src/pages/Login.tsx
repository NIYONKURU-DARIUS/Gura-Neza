import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/store';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken, fetchCart } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await authService.login({ email, password });
      setToken(data.token);
      // Fetch full profile including wallet balance
      const profile = await userService.getMe();
      setUser({
        id: profile.id.toString(),
        name: profile.name,
        email: profile.email,
        role: profile.role,
        walletBalance: profile.walletBalance,
      });
      // Pre-load cart
      await fetchCart();
      
      if (profile.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      {/* Left Side - Gradient */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-[#065f46] dark:from-[#1B5E20] dark:to-[#0A0A0A] p-20 flex-col justify-between text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute inset-0 z-0">
            {[...Array(10)].map((_, i) => (
                <motion.div 
                    key={i}
                    animate={{ y: [0, -100, 0], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: Math.random() * 5 + 5, repeat: Infinity }}
                    className="absolute bg-primary-light/20 rounded-full blur-xl"
                    style={{ 
                        width: Math.random() * 200 + 100, 
                        height: Math.random() * 200 + 100,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                    }}
                />
            ))}
        </div>

        <div className="relative z-10">
          <div className="text-3xl font-black tracking-tighter mb-2 italic">GURA NEZA</div>
          <p className="text-primary-light font-black uppercase tracking-[0.3em] text-[10px]">Elevating Commerce</p>
        </div>
        <div className="relative z-10">
          <h1 className="text-6xl font-black leading-tight mb-6 italic">Welcome Back to <br/><span className="text-white/80">Excellence.</span></h1>
          <p className="text-xl text-primary-light/80 max-w-md font-bold">Access your local favorites and global essentials with a single secure wallet.</p>
        </div>
        <div className="relative z-10 text-[10px] font-black uppercase tracking-widest opacity-50">
          &copy; 2026 Gura Neza. All rights reserved.
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 relative bg-[var(--bg-main)]">
        <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-[var(--text-s)] hover:text-primary transition-colors font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={18} /> Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-black text-[var(--text-p)] mb-4 italic tracking-tighter">Sign In</h2>
            <p className="text-[var(--text-s)] font-bold">Enter your details and continue your journey.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-red/10 border border-red text-red p-4 rounded-xl flex items-center gap-3 mb-8 shadow-lg shadow-red/5"
              >
                <AlertCircle size={20} />
                <span className="font-black text-xs uppercase tracking-tighter">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-s)] group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="input-field pl-14 py-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Password</label>
                <a href="#" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-s)] group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="input-field pl-14 py-4"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary py-5 text-xl font-black rounded-2xl flex items-center justify-center gap-3 mt-6 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <LogIn size={24} />} 
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-c)]"></div></div>
            <div className="relative flex justify-center"><span className="bg-[var(--bg-main)] px-4 text-[10px] uppercase font-black text-[var(--text-s)] tracking-[0.2em]">Or Secure Access with</span></div>
          </div>

          <button className="w-full border-2 border-[var(--border-c)] bg-[var(--card-bg)] py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[var(--text-p)] hover:border-primary transition-all group shadow-sm">
            <Globe size={20} className="text-[var(--text-s)] group-hover:text-primary transition-colors" /> 
            <span className="uppercase text-xs tracking-widest">Google Account</span>
          </button>

          <p className="text-center mt-12 text-[var(--text-s)] font-bold">
            New here? <Link to="/register" className="text-primary font-black ml-1 hover:underline tracking-tight">Create your account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
