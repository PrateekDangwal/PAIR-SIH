'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, KeyRound, Server, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch } from '@/lib/api';

type Status = { default_provider: string; default_model: string; nvidia_keys_configured: number; nvidia_fallback_models: string[] };

export default function SettingsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => { apiFetch<Status>('/api/v1/ai/status').then(setStatus).catch(() => undefined); }, []);

  return (
    <motion.div className="min-h-full p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-sm text-purple-400 mb-2">Workspace configuration</p>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-2">Account and PAIR runtime configuration.</p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3 mb-5"><ShieldCheck className="text-purple-400" size={20} /><h2 className="text-lg font-semibold">Account</h2></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Name</p><p className="text-white mt-1">{user?.name}</p></div>
            <div><p className="text-xs text-gray-500">Email</p><p className="text-white mt-1">{user?.email}</p></div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3 mb-5"><Server className="text-emerald-400" size={20} /><h2 className="text-lg font-semibold">AI Runtime</h2></div>
          <div className="grid md:grid-cols-2 gap-5">
            <div><p className="text-xs text-gray-500">Provider</p><p className="text-white mt-1">{status?.default_provider || 'Loading…'}</p></div>
            <div><p className="text-xs text-gray-500">Default model</p><p className="text-white mt-1 break-all">{status?.default_model || 'Loading…'}</p></div>
            <div className="flex gap-3"><KeyRound className="text-yellow-400" size={18} /><div><p className="text-xs text-gray-500">Server-side API keys</p><p className="text-white mt-1">{status?.nvidia_keys_configured ?? '—'} configured</p></div></div>
            <div className="flex gap-3"><Database className="text-blue-400" size={18} /><div><p className="text-xs text-gray-500">Data store</p><p className="text-white mt-1">PostgreSQL</p></div></div>
          </div>
          <p className="text-xs text-gray-600 mt-6">API keys are never displayed in the UI. Configure them only in the backend environment.</p>
        </section>
      </div>
    </motion.div>
  );
}
