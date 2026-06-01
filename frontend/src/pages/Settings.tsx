import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, CheckCircle, AlertCircle, Loader2, Settings as SettingsIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useStore } from '../context/store';
import { userService } from '../services/userService';

const Settings: React.FC = () => {
  const { user, setUser } = useStore();

  // Profile section
  const [name, setName] = useState(user?.name ?? '');
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [profileMsg, setProfileMsg] = useState('');

  // Password section
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setProfileStatus('loading');
    setProfileMsg('');
    try {
      const updated = await userService.updateMe({ name: name.trim() });
      setUser({
        id: updated.id.toString(),
        name: updated.name,
        email: updated.email,
        role: updated.role,
        walletBalance: updated.walletBalance,
      });
      setProfileStatus('success');
      setProfileMsg('Profile updated successfully.');
    } catch (err: any) {
      setProfileStatus('error');
      setProfileMsg(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus('error');
      setPasswordMsg('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordMsg('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus('error');
      setPasswordMsg('New password must be at least 6 characters.');
      return;
    }
    setPasswordStatus('loading');
    setPasswordMsg('');
    try {
      await userService.updateMe({ currentPassword, newPassword });
      setPasswordStatus('success');
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordStatus('error');
      setPasswordMsg(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-2xl mx-auto pb-20">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-primary mb-2">
            <SettingsIcon size={20} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Account</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-p)] italic tracking-tighter">
            Settings.
          </h1>
          <p className="text-[var(--text-s)] font-bold mt-1 text-sm">
            Manage your profile and security preferences.
          </p>
        </header>

        <div className="space-y-6">
          {/* ── Profile Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card-bg)] border border-[var(--border-c)] rounded-[2rem] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-[var(--text-p)] uppercase tracking-widest">Profile</h2>
                <p className="text-[10px] text-[var(--text-s)] font-bold">Update your display name</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-5">
              {/* Email — read only */}
              <div>
                <label className="block text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-c)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-s)] opacity-60 cursor-not-allowed"
                />
                <p className="text-[9px] text-[var(--text-s)] mt-1.5 font-bold">Email cannot be changed.</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setProfileStatus('idle'); }}
                  placeholder="Your full name"
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-c)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-p)] outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all"
                />
              </div>

              {/* Status message */}
              {profileStatus !== 'idle' && profileMsg && (
                <div className={`flex items-center gap-2 text-xs font-bold px-4 py-3 rounded-xl ${
                  profileStatus === 'success'
                    ? 'bg-primary/10 text-primary'
                    : profileStatus === 'error'
                    ? 'bg-red/10 text-red'
                    : ''
                }`}>
                  {profileStatus === 'success' && <CheckCircle size={14} />}
                  {profileStatus === 'error' && <AlertCircle size={14} />}
                  {profileMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={profileStatus === 'loading' || name.trim() === (user?.name ?? '')}
                className="btn-primary px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileStatus === 'loading' && <Loader2 size={14} className="animate-spin" />}
                Save Profile
              </button>
            </form>
          </motion.div>

          {/* ── Password Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--card-bg)] border border-[var(--border-c)] rounded-[2rem] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Lock size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-[var(--text-p)] uppercase tracking-widest">Password</h2>
                <p className="text-[10px] text-[var(--text-s)] font-bold">Change your account password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSave} className="space-y-5">
              <div>
                <label className="block text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); setPasswordStatus('idle'); }}
                  placeholder="••••••••"
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-c)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-p)] outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPasswordStatus('idle'); }}
                  placeholder="••••••••"
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-c)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-p)] outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setPasswordStatus('idle'); }}
                  placeholder="••••••••"
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-c)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-p)] outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all"
                />
              </div>

              {/* Status message */}
              {passwordStatus !== 'idle' && passwordMsg && (
                <div className={`flex items-center gap-2 text-xs font-bold px-4 py-3 rounded-xl ${
                  passwordStatus === 'success'
                    ? 'bg-primary/10 text-primary'
                    : passwordStatus === 'error'
                    ? 'bg-red/10 text-red'
                    : ''
                }`}>
                  {passwordStatus === 'success' && <CheckCircle size={14} />}
                  {passwordStatus === 'error' && <AlertCircle size={14} />}
                  {passwordMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordStatus === 'loading'}
                className="btn-primary px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordStatus === 'loading' && <Loader2 size={14} className="animate-spin" />}
                Change Password
              </button>
            </form>
          </motion.div>

          {/* ── Account Info ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--card-bg)] border border-[var(--border-c)] rounded-[2rem] p-8"
          >
            <h2 className="text-[9px] font-black text-[var(--text-s)] uppercase tracking-widest mb-4">Account Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-[var(--border-c)]">
                <span className="text-xs font-black text-[var(--text-s)] uppercase tracking-widest">Account ID</span>
                <span className="text-xs font-bold text-[var(--text-p)] font-mono">#{user?.id}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--border-c)]">
                <span className="text-xs font-black text-[var(--text-s)] uppercase tracking-widest">Role</span>
                <span className="text-xs font-black text-primary uppercase tracking-widest">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs font-black text-[var(--text-s)] uppercase tracking-widest">Wallet Balance</span>
                <span className="text-sm font-black text-[var(--text-p)] italic">
                  ${(user?.walletBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
