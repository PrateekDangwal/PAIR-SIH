'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowUpRight, FileSearch, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export function PromptComposer() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const project = await apiFetch<{ id: number }>('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prompt.trim().slice(0, 80),
          description: prompt.trim(),
          gem_tender_id: null,
        }),
      });
      setPrompt('');
      router.push(`/app/projects/${project.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.025]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: .1, duration: .5 }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <FileSearch size={15} className="text-violet-400" />
          Start a bid compliance review
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Review the medical equipment tender for mandatory eligibility, technical and financial requirements…"
            className="w-full min-h-24 resize-none bg-transparent text-base text-white placeholder:text-gray-700 outline-none leading-7"
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <ShieldCheck size={14} /> Tender-specific verification
            </div>
            <button
              disabled={!prompt.trim() || loading}
              className="pair-button inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
            >
              {loading ? 'Opening…' : 'Open review'} <ArrowUpRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
