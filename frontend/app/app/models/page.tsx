'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Cpu, KeyRound, Zap } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Model = { id: string; name: string; provider: string; status: string; capabilities: string[] };
type Status = { default_provider: string; default_model: string; nvidia_keys_configured: number; nvidia_fallback_models: string[] };

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiFetch<Model[]>('/api/v1/ai/models'), apiFetch<Status>('/api/v1/ai/status')])
      .then(([modelData, statusData]) => {
        setModels(modelData);
        setStatus(statusData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load AI models.'));
  }, []);

  return (
    <motion.div className="min-h-full p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-sm text-purple-400 mb-2">AI orchestration</p>
          <h1 className="text-3xl font-bold">AI Models</h1>
          <p className="text-gray-500 mt-2">Configured models and the server-side provider pool used by PAIR.</p>
        </div>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Cpu className="text-purple-400" size={20} />
            <p className="text-sm text-gray-500 mt-4">Default model</p>
            <p className="text-white font-semibold mt-1 break-all">{status?.default_model || 'Loading…'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <KeyRound className="text-emerald-400" size={20} />
            <p className="text-sm text-gray-500 mt-4">NVIDIA keys configured</p>
            <p className="text-2xl text-white font-bold mt-1">{status?.nvidia_keys_configured ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Zap className="text-yellow-400" size={20} />
            <p className="text-sm text-gray-500 mt-4">Fallback models</p>
            <p className="text-2xl text-white font-bold mt-1">{status?.nvidia_fallback_models?.length ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {models.map((model) => {
            const configured = model.status === 'configured';
            return (
              <div key={model.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{model.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{model.provider}</p>
                  </div>
                  {configured ? <CheckCircle2 className="text-emerald-400" size={20} /> : <Circle className="text-gray-600" size={20} />}
                </div>
                <p className="text-xs text-gray-600 mt-4 break-all">{model.id}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {model.capabilities.map((capability) => (
                    <span key={capability} className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">{capability}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-5">{model.status.replace(/_/g, ' ')}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
