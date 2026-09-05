'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Clock3, FileText, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Event = { id: number; project_id: number | null; action: string; actor: string; details: string | null; created_at: string };

function iconFor(action: string) {
  if (action.includes('compliance')) return ShieldCheck;
  if (action.includes('document')) return FileText;
  if (action.includes('project')) return CheckCircle2;
  return Activity;
}

export default function ActivityPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Event[]>('/api/v1/audit/events?limit=100')
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div className="min-h-full p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm text-purple-400 mb-2">Traceability</p>
          <h1 className="text-3xl font-bold">Activity</h1>
          <p className="text-gray-500 mt-2">An audit-friendly timeline of project and compliance actions.</p>
        </div>

        {loading ? <p className="text-gray-500">Loading activity…</p> : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-500">No activity yet. Actions will appear here as you work.</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const Icon = iconFor(event.action);
              return (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0"><Icon size={18} className="text-purple-400" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{event.action.replace(/_/g, ' ')}</p>
                      <span className="text-xs rounded-full border border-white/10 px-2 py-1 text-gray-500">{event.actor}</span>
                    </div>
                    {event.details && <p className="text-sm text-gray-400 mt-2 break-words">{event.details}</p>}
                    <p className="text-xs text-gray-600 mt-2 flex items-center gap-1"><Clock3 size={12} />{new Date(event.created_at).toLocaleString()}</p>
                  </div>
                  {event.project_id && <span className="text-xs text-gray-600">Project #{event.project_id}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
