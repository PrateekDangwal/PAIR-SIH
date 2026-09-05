'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Project = { id: number; name: string; description: string | null; status: string };

export function RecentProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { apiFetch<{ projects: Project[] }>('/api/v1/projects').then((data) => setProjects(data.projects.slice(0, 5))).catch(() => undefined); }, []);

  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
    <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Recent Projects</h2><Link href="/app/projects" className="text-purple-400 text-sm flex items-center gap-1">View all <ArrowRight size={16} /></Link></div>
    {projects.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-500">No projects yet.</div> : <div className="space-y-3">{projects.map((project) => <Link key={project.id} href={`/app/projects/${project.id}`}><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition"><div className="flex justify-between gap-4"><div><h3 className="font-semibold">{project.name}</h3><p className="text-xs text-gray-500 mt-1">{project.description}</p></div><span className="text-xs text-gray-500">{project.status}</span></div></div></Link>)}</div>}
  </motion.div>;
}
