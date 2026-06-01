import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onSpeakingChange } from '../services/speechService';

/**
 * Global floating speaking indicator.
 * Shows an animated sound-wave pill whenever the app is speaking via TTS.
 * Mounts once in App.tsx — works across all pages automatically.
 */
const SpeakingIndicator: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = onSpeakingChange(setIsSpeaking);
    return unsub;
  }, []);

  return (
    <AnimatePresence>
      {isSpeaking && (
        <motion.div
          key="speaking-indicator"
          initial={{ opacity: 0, y: 24, scale: 0.88 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{  opacity: 0, y: 16, scale: 0.92 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] pointer-events-none"
        >
          <div className="flex items-center gap-3 bg-[var(--card-bg)] border border-primary/30 shadow-2xl shadow-primary/20 rounded-full px-5 py-3">

            {/* Animated mic icon */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40">
                {/* Mic SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="2" width="6" height="11" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="9"  y1="22" x2="15" y2="22" />
                </svg>
              </div>
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-primary pointer-events-none"
              />
            </div>

            {/* Sound wave bars */}
            <div className="flex items-center gap-[3px]">
              {[0.4, 0.7, 1.0, 0.7, 0.5, 0.9, 0.6].map((peak, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] bg-primary rounded-full"
                  animate={{ scaleY: [0.2, peak, 0.2] }}
                  transition={{
                    duration: 0.7 + i * 0.05,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.08,
                  }}
                  style={{ height: 20, originY: 0.5 }}
                />
              ))}
            </div>

            {/* Label */}
            <span className="text-[10px] font-black uppercase tracking-widest text-primary whitespace-nowrap">
              Speaking…
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpeakingIndicator;
