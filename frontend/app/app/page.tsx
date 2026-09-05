'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, CheckCircle2, FileSearch, FolderOpen, AlertTriangle,
  MessageSquare, ShieldCheck, Activity, Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch } from '@/lib/api';

type Project = { id: number; name: string; description: string | null; gem_tender_id: string | null; status: string };
type Summary = {
  total_requirements: number; evaluated_requirements: number; compliant: number;
  non_compliant: number; partial: number; needs_review: number; insufficient_data: number;
  compliance_score: number; risk_level: 'low' | 'medium' | 'high';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [summaries, setSummaries] = useState<Record<number, Summary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ projects: Project[] }>('/api/v1/projects');
        setProjects(data.projects);
        const pairs = await Promise.all(data.projects.slice(0, 8).map(async (p) => {
          try { return [p.id, await apiFetch<Summary>(`/api/v1/compliance/projects/${p.id}/summary`)] as const; }
          catch { return [p.id, null] as const; }
        }));
        setSummaries(Object.fromEntries(pairs.filter((x): x is [number, Summary] => x[1] !== null)));
      } finally { setLoading(false); }
    })();
  }, []);

  const all = Object.values(summaries);
  const requirements = all.reduce((n, s) => n + s.total_requirements, 0);
  const compliant = all.reduce((n, s) => n + s.compliant, 0);
  const attention = all.reduce((n, s) => n + s.non_compliant + s.needs_review + s.insufficient_data, 0);
  const highRisk = all.filter((s) => s.risk_level === 'high').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div className="min-h-full p-4 md:p-6 lg:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mx-auto max-w-[1400px] space-y-7">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="pair-kicker mb-3">GeM procurement intelligence</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]">{greeting}, {user?.name || 'Procurement Officer'}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Review tender requirements, bidder evidence, compliance and risk from one evidence-first workspace.
            </p>
          </div>
          <Link href="/app/projects" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-200">
            <Plus size={16} /> New bid review
          </Link>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 border border-white/[0.07] rounded-xl overflow-hidden bg-[#101012]">
          {([
            ['Active bid reviews', projects.length, FolderOpen],
            ['Requirements', requirements, FileSearch],
            ['Verified', compliant, CheckCircle2],
            ['Attention', attention, AlertTriangle],
          ] as const).map(([label, value, Icon], i) => {
            const I = Icon;
            return (
              <div key={String(label)} className={`p-5 ${i < 3 ? 'border-r border-white/[0.07]' : ''} ${i >= 2 ? 'lg:border-t-0' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-gray-600">{String(label)}</p>
                  <I size={15} className="text-gray-600" />
                </div>
                <p className="mt-3 text-2xl font-semibold">{loading ? '—' : value}</p>
              </div>
            );
          })}
        </section>

        <section className="grid lg:grid-cols-[1.45fr_.75fr] gap-5">
          <div className="rounded-xl border border-white/[0.07] bg-[#101012] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div>
                <p className="pair-kicker">Recent reviews</p>
                <h2 className="mt-1 text-base font-medium">Bid compliance workspace</h2>
              </div>
              <Link href="/app/projects" className="text-xs text-gray-500 hover:text-white">View all <ArrowUpRight size={13} className="inline ml-1" /></Link>
            </div>
            {loading ? <div className="p-8 text-sm text-gray-600">Loading reviews…</div> :
              projects.length === 0 ? (
                <div className="p-10 text-center">
                  <FolderOpen size={22} className="mx-auto text-gray-600" />
                  <p className="mt-3 text-sm text-gray-400">No bid reviews yet.</p>
                  <Link href="/app/projects" className="mt-4 inline-flex text-xs text-violet-300">Create your first review</Link>
                </div>
              ) : (
                <div>
                  {projects.slice(0, 6).map((p) => {
                    const s = summaries[p.id];
                    return (
                      <Link href={`/app/projects/${p.id}`} key={p.id} className="pair-table-row flex items-center gap-4 px-5 py-4 hover:bg-white/[0.018]">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-200">{p.name}</p>
                          <p className="mt-1 truncate text-[11px] text-gray-600">{p.gem_tender_id || p.description || 'GeM compliance review'}</p>
                        </div>
                        <div className="hidden sm:block text-right">
                          <p className="text-xs text-gray-500">{s ? `${s.evaluated_requirements}/${s.total_requirements} evaluated` : 'Not analyzed'}</p>
                        </div>
                        <div className="w-20 text-right">
                          <p className="text-sm font-semibold">{s ? `${s.compliance_score}%` : '—'}</p>
                          <p className={`text-[10px] uppercase tracking-wider ${s?.risk_level === 'high' ? 'text-red-400' : s?.risk_level === 'medium' ? 'text-amber-300' : s ? 'text-emerald-400' : 'text-gray-600'}`}>{s?.risk_level || 'pending'}</p>
                        </div>
                        <ArrowUpRight size={15} className="text-gray-700" />
                      </Link>
                    );
                  })}
                </div>
              )}
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#101012] p-5">
            <p className="pair-kicker">Decision readiness</p>
            <h2 className="mt-1 text-base font-medium">Evidence picture</h2>
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10"><ShieldCheck size={17} className="text-emerald-400" /></div>
                <div><p className="text-sm">Verified requirements</p><p className="text-[11px] text-gray-600">{compliant} across loaded reviews</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-300/10"><AlertTriangle size={17} className="text-amber-300" /></div>
                <div><p className="text-sm">Needs attention</p><p className="text-[11px] text-gray-600">{attention} unresolved findings</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-400/10"><Activity size={17} className="text-red-400" /></div>
                <div><p className="text-sm">High-risk reviews</p><p className="text-[11px] text-gray-600">{highRisk} currently high risk</p></div>
              </div>
            </div>
            <div className="mt-7 border-t border-white/[0.07] pt-5">
              <Link href="/app/chat" className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 text-xs text-gray-400 hover:text-white hover:bg-white/[0.04]">
                Ask PAIR about a tender <MessageSquare size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
