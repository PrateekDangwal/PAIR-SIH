'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { ShieldCheck } from 'lucide-react';

export function Welcome() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
        <ShieldCheck size={14} className="text-emerald-400/80" />
        GeM procurement intelligence
      </div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
        {greeting}, {user?.name}
      </h1>
      <p className="text-gray-500 mt-2 max-w-2xl">
        Review tender requirements, bidder evidence and compliance risk from one workspace.
      </p>
    </motion.div>
  );
}
