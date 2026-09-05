'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, KeyRound } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Model = { id: string; name: string; provider: string; status: string };
export function AIModelStatus() {
  const [models, setModels] = useState<Model[]>([]);
  useEffect(() => { apiFetch<Model[]>('/api/v1/ai/models').then(setModels).catch(() => undefined); }, []);
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">AI Runtime</h2><KeyRound size={17} className="text-purple-400" /></div><div className="space-y-4">{models.slice(0, 5).map((model) => <div key={model.id} className="flex items-center gap-3">{model.status === 'configured' ? <CheckCircle2 size={17} className="text-emerald-400" /> : <Circle size={17} className="text-gray-600" />}<div className="min-w-0"><p className="text-sm font-medium truncate">{model.name}</p><p className="text-xs text-gray-500 truncate">{model.provider}</p></div></div>)}</div></div>;
}
