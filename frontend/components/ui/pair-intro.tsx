'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PairLogo } from './pair-logo';

export function PairIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('pair-intro-seen');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduced) return;
    setVisible(true);
    const timer = window.setTimeout(() => {
      sessionStorage.setItem('pair-intro-seen', '1');
      setVisible(false);
    }, 2300);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050506]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: 'easeInOut' } }}
        >
          <div className="absolute inset-0 pair-intro-grid" />
          <motion.div
            className="absolute h-80 w-80 rounded-full bg-violet-500/10 blur-3xl"
            animate={{ scale: [0.8, 1.2, 1], opacity: [0.2, 0.55, 0.25] }}
            transition={{ duration: 2.1, ease: 'easeInOut' }}
          />
          <div className="relative flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.55, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <PairLogo size={92} showWordmark={false} animated />
            </motion.div>
            <motion.h1
              className="mt-5 text-3xl font-semibold tracking-[0.28em] text-white"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.55 }}
            >
              PAIR
            </motion.h1>
            <motion.p
              className="mt-2 text-sm tracking-[0.08em] text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95, duration: 0.5 }}
            >
              AI-POWERED GeM BID COMPLIANCE
            </motion.p>
            <motion.div
              className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.25 }}
            >
              <span className="h-px w-10 bg-white/10" />
              tender · evidence · verification
              <span className="h-px w-10 bg-white/10" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
