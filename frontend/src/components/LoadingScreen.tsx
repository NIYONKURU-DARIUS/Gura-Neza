import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0a1a0c 0%, #0d1f10 50%, #071209 100%)' }}
        >
          {/* ── Ambient glow layers ── */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, #2E7D32 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          />
          <motion.div
            animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.06, 0.14, 0.06] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, #4ade80 0%, transparent 70%)', top: '30%', right: '20%' }}
          />

          {/* ── Floating particles ── */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40 pointer-events-none"
              style={{ left: `${15 + i * 10}%`, top: `${20 + (i % 3) * 20}%` }}
              animate={{ y: [-12, 12, -12], opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.4, 0.8] }}
              transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
          ))}

          {/* ── Logo mark ── */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 180, damping: 18 }}
            className="relative z-10 mb-8"
          >
            {/* Outer pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-[2.2rem] border-2 border-primary/50"
            />
            {/* Second pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              className="absolute inset-0 rounded-[2.2rem] border border-primary/30"
            />

            {/* Logo box */}
            <div className="relative w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1b5e20 60%, #0d3b12 100%)' }}>

              {/* Inner shine */}
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[2rem]"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)' }} />
              </div>

              {/* GN monogram */}
              <svg width="52" height="40" viewBox="0 0 52 40" fill="none" className="relative z-10">
                <text x="1" y="34" fontFamily="Georgia, serif" fontWeight="900" fontStyle="italic"
                  fontSize="36" fill="white" letterSpacing="-2">GN</text>
              </svg>

              {/* Spinning arc */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-3px] rounded-[2.2rem]"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(255,255,255,0.35) 85%, transparent 100%)',
                  borderRadius: '2.2rem',
                }}
              />
            </div>
          </motion.div>

          {/* ── Brand name ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="relative z-10 text-center mb-12"
          >
            <h1 className="text-4xl font-black text-white italic tracking-tighter leading-none mb-2">
              GURA NEZA
            </h1>
            <motion.p
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-white/40 font-bold text-[10px] uppercase tracking-[0.55em]"
            >
              Buy Smart · Live Better
            </motion.p>
          </motion.div>

          {/* ── Animated dots loader ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="relative z-10 flex flex-col items-center gap-5"
          >
            {/* Three bouncing dots */}
            <div className="flex items-center gap-2.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
                />
              ))}
            </div>

            {/* Slim progress track */}
            <div className="w-44 h-[3px] bg-white/8 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full w-1/2 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, #2E7D32, #4ade80, transparent)' }}
              />
            </div>
          </motion.div>

          {/* ── Bottom tagline ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-10 text-white/15 text-[9px] font-black uppercase tracking-[0.5em] z-10"
          >
            Rwanda's Premium Digital Hub
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
