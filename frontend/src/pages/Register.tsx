import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, ArrowLeft, Globe, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let s = 0;
    if (formData.password.length > 6) s += 1;
    if (/[A-Z]/.test(formData.password)) s += 1;
    if (/[0-9]/.test(formData.password)) s += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) s += 1;
    setStrength(s);
  }, [formData.password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setTimeout(() => setError(''), 3000);
      return;
    }
    navigate('/products');
  };

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-[var(--border-c)]';
    if (strength === 1) return 'bg-red';
    if (strength === 2) return 'bg-amber';
    if (strength === 3) return 'bg-primary-light';
    return 'bg-primary';
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      {/* Left Side - Dark Gradient */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex w-1/2 bg-gradient-to-tr from-[#1B5E20] to-[#0A0A0A] p-20 flex-col justify-between text-white relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rotate-180" />
        
        {/* Subtle Green Particles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
                <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: Math.random() * 8 + 4, repeat: Infinity }}
                    className="absolute bg-primary/20 rounded-full blur-3xl"
                    style={{ 
                        width: 400, height: 400,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                    }}
                />
            ))}
        </div>

        <div className="relative z-10">
          <div className="text-3xl font-black italic tracking-tighter mb-2">GURA NEZA</div>
          <p className="text-primary-light font-black uppercase tracking-[0.3em] text-[10px]">Empowering Global Local</p>
        </div>
        <div className="relative z-10">
          <h1 className="text-6xl font-black leading-tight mb-6 italic">Join the Digital <br/><span className="text-primary">Revolution.</span></h1>
          <p className="text-xl text-primary-light/80 max-w-sm font-bold">Unlocking new possibilities for businesses and shoppers throughout Rwanda.</p>
        </div>
        <div className="relative z-10 text-[10px] font-black uppercase tracking-widest opacity-50">
          &copy; 2026 Gura Neza. All rights reserved.
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative bg-[var(--bg-main)]">
        <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-[var(--text-s)] hover:text-primary transition-colors font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={18} /> Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-black text-[var(--text-p)] mb-4 italic tracking-tighter">Sign Up</h2>
            <p className="text-[var(--text-s)] font-bold">Start your digital shopping journey now.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-red/10 border border-red text-red p-4 rounded-xl flex items-center gap-3 mb-6"
              >
                <AlertCircle size={20} />
                <span className="font-black text-xs uppercase">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-s)] group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="input-field pl-12 py-3.5"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-s)] group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="input-field pl-12 py-3.5"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-s)] group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="input-field pl-12 py-3.5"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="pt-2 flex gap-1 items-center">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--border-c)] overflow-hidden flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(strength / 4) * 100}%` }}
                    className={`h-full ${getStrengthColor()} transition-colors`}
                  />
                </div>
                <span className="text-[10px] font-black text-[var(--text-s)] uppercase ml-2">
                  {strength === 4 ? 'EXCELLENT' : 'STRENGTH'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-s)] group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="input-field pl-12 py-3.5"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary py-4 text-xl font-black rounded-2xl flex items-center justify-center gap-3 mt-4">
              <UserPlus size={24} /> Create Account
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-c)]"></div></div>
            <div className="relative flex justify-center"><span className="bg-[var(--bg-main)] px-4 text-[10px] uppercase font-black text-[var(--text-s)] tracking-widest">Or sign up with</span></div>
          </div>

          <button className="w-full border-2 border-[var(--border-c)] bg-[var(--card-bg)] py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[var(--text-p)] hover:border-primary transition-all group shadow-sm">
            <Globe size={18} className="text-[var(--text-s)] group-hover:text-primary transition-colors" /> Google Account
          </button>

          <p className="text-center mt-12 text-[var(--text-s)] font-bold">
            Already have an account? <Link to="/login" className="text-primary font-black ml-1 hover:underline tracking-tight">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
