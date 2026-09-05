'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, FileCheck2, ShieldCheck, ScanSearch } from 'lucide-react';
import { PairLogo } from '@/components/ui/pair-logo';
import { AIField } from '@/components/ui/ai-field';

export function Hero() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-[#050506]" />
      <AIField intensity={0.9} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(124,58,237,.13),transparent_38%),linear-gradient(to_bottom,transparent,rgba(5,5,6,.96))]" />
      <div className="absolute inset-0 pair-grid opacity-30" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
            <PairLogo size={52} className="justify-center mb-8" />
          </motion.div>

          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2 text-xs text-gray-400"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}
          >
            <ShieldCheck size={14} className="text-emerald-400" />
            AI-assisted GeM bid verification
          </motion.div>

          <motion.h1
            className="mt-7 text-5xl font-semibold tracking-[-0.045em] text-white sm:text-6xl md:text-7xl lg:text-[84px] leading-[.98]"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .7 }}
          >
            Verify every bid.
            <span className="block text-gray-500">Decide with evidence.</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-7 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .38 }}
          >
            PAIR turns GeM tender documents and bidder submissions into a
            requirement-by-requirement compliance review, risk score and
            procurement recommendation.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .52 }}
          >
            <Link href="/signup" className="pair-button inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">
              Start a bid review <ArrowUpRight size={16} />
            </Link>
            <a href="#how-it-works" className="pair-button inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-medium text-gray-300 hover:bg-white/[0.06]">
              See how it works
            </a>
          </motion.div>
        </div>

        <motion.div
          className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-3 md:grid-cols-3"
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .7, duration: .65 }}
        >
          {[
            [FileCheck2, 'Tender requirements', 'Extracted and organized'],
            [ScanSearch, 'Bidder evidence', 'Linked to each requirement'],
            [ShieldCheck, 'Risk & decision', 'Score with officer review'],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof FileCheck2;
            return (
              <div key={title as string} className="pair-surface rounded-2xl p-5 text-left">
                <I size={18} className="text-violet-300" />
                <p className="mt-4 text-sm font-medium text-white">{title as string}</p>
                <p className="mt-1 text-xs leading-5 text-gray-600">{text as string}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
