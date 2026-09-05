'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PairLogo } from '@/components/ui/pair-logo';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { label: 'Product', href: '#hero' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Verification', href: '#orchestration' },
    { label: 'Use cases', href: '#use-cases' },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07] bg-[#050506]/70 backdrop-blur-2xl"
      initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .5 }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" aria-label="PAIR home"><PairLogo size={34} /></Link>

          <div className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-xs text-gray-500 hover:text-white transition">{item.label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-white">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="bg-white text-black hover:bg-gray-200">
              <Link href="/signup">Open PAIR</Link>
            </Button>
          </div>

          <button className="md:hidden rounded-lg p-2 text-gray-300" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {isOpen && (
          <motion.div className="md:hidden border-t border-white/[0.07] py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-1">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/[0.04] hover:text-white">{item.label}</a>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.07] pt-3">
              <Link href="/login" className="rounded-lg border border-white/10 px-3 py-2 text-center text-sm text-gray-400">Sign in</Link>
              <Link href="/signup" className="rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-black">Open PAIR</Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
