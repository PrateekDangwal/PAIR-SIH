'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, FolderPlus, RefreshCw, Search } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Project = { id: number; name: string; description: string | null; gem_tender_id: string | null; status: string; created_at?: string };
type Summary = { compliance_score: number; risk_level: 'low' | 'medium' | 'high'; total_requirements: number; evaluated_requirements: number; compliant: number; non_compliant: number; partial: number; needs_review: number; insufficient_data: number };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [summaries, setSummaries] = useState<Record<number, Summary>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [tenderId, setTenderId] = useState('');
  const [query, setQuery] = useState('');

  async function loadProjects() {
    setLoading(true); setError('');
    try {
      const data = await apiFetch<{ projects: Project[] }>('/api/v1/projects');
      setProjects(data.projects);
      const entries = await Promise.all(data.projects.map(async (project) => {
        try { return [project.id, await apiFetch<Summary>(`/api/v1/compliance/projects/${project.id}/summary`)] as const; }
        catch { return [project.id, null] as const; }
      }));
      setSummaries(Object.fromEntries(entries.filter((entry): entry is [number, Summary] => entry[1] !== null)));
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load bid reviews.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadProjects(); }, []);

  async function createProject(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setCreating(true); setError('');
    try {
      const project = await apiFetch<Project>('/api/v1/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: 'GeM bid compliance review project', gem_tender_id: tenderId.trim() || null }),
      });
      setName(''); setTenderId('');
      window.location.href = `/app/projects/${project.id}`;
    } catch (err) { setError(err instanceof Error ? err.message : 'Project creation failed.'); }
    finally { setCreating(false); }
  }

  const filtered = projects.filter((p) => `${p.name} ${p.gem_tender_id || ''}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <motion.div className="min-h-full p-4 md:p-6 lg:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="pair-kicker mb-3">Workspace / bid reviews</p><h1 className="text-3xl font-semibold tracking-tight">Bid Reviews</h1><p className="mt-2 text-sm text-gray-500">Create tender-specific workspaces and inspect requirement-level compliance.</p></div>
          <button onClick={loadProjects} className="self-start rounded-lg border border-white/[0.08] p-2.5 text-gray-500 hover:text-white hover:bg-white/[0.04]" aria-label="Refresh"><RefreshCw size={16} /></button>
        </div>

        <form onSubmit={createProject} className="rounded-xl border border-white/[0.08] bg-[#101012] p-5">
          <div className="flex items-center gap-2"><FolderPlus size={16} className="text-violet-300" /><p className="text-sm font-medium">Start a new bid review</p></div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_280px_auto]">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tender or procurement project name" className="h-11 rounded-lg border border-white/[0.08] bg-black/20 px-3.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-white/[0.18]" />
            <input value={tenderId} onChange={(e) => setTenderId(e.target.value)} placeholder="GeM Tender ID (optional)" className="h-11 rounded-lg border border-white/[0.08] bg-black/20 px-3.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-white/[0.18]" />
            <button disabled={creating || !name.trim()} className="h-11 rounded-lg bg-white px-5 text-sm font-semibold text-black disabled:opacity-40">{creating ? 'Creating…' : 'Create review'}</button>
          </div>
        </form>

        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-300">{error}</div>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="pair-kicker">All reviews</p><p className="mt-1 text-xs text-gray-600">{projects.length} workspace{projects.length === 1 ? '' : 's'}</p></div>
          <div className="relative w-full sm:w-72"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reviews…" className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.02] pl-9 text-xs outline-none placeholder:text-gray-700 focus:border-white/[0.16]" /></div>
        </div>

        {loading ? <div className="py-12 text-center text-sm text-gray-600">Loading bid reviews…</div> :
          filtered.length === 0 ? <div className="rounded-xl border border-dashed border-white/[0.1] p-12 text-center text-sm text-gray-600">No matching bid reviews.</div> :
          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#101012]">
            <div className="hidden md:grid grid-cols-[1.6fr_1fr_110px_110px_90px] border-b border-white/[0.07] px-5 py-3 text-[10px] uppercase tracking-[0.12em] text-gray-600">
              <span>Tender / review</span><span>GeM ID</span><span>Compliance</span><span>Risk</span><span />
            </div>
            {filtered.map((p) => {
              const s = summaries[p.id];
              return <Link key={p.id} href={`/app/projects/${p.id}`} className="grid grid-cols-1 gap-2 px-5 py-4 md:grid-cols-[1.6fr_1fr_110px_110px_90px] md:items-center pair-table-row">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{p.name}</p><p className="mt-1 truncate text-[11px] text-gray-600">{p.description || 'GeM compliance review'}</p></div>
                <p className="text-xs text-gray-500">{p.gem_tender_id || '—'}</p>
                <p className="text-sm font-semibold">{s ? `${s.compliance_score}%` : '—'}</p>
                <p className={`text-[10px] uppercase tracking-wider ${s?.risk_level === 'high' ? 'text-red-400' : s?.risk_level === 'medium' ? 'text-amber-300' : s ? 'text-emerald-400' : 'text-gray-600'}`}>{s?.risk_level || 'pending'}</p>
                <div className="flex justify-start md:justify-end"><ArrowUpRight size={15} className="text-gray-700" /></div>
              </Link>;
            })}
          </div>
        }
      </div>
    </motion.div>
  );
}
