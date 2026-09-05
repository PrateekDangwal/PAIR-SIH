'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, FolderOpen, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Project = { id: number; name: string };
type DocumentItem = { id: number; project_id: number; filename: string; file_size: number; document_type: string; extraction_status: string; page_count: number | null; created_at: string };

export default function ArtifactsPage() {
  const [items, setItems] = useState<Array<DocumentItem & { project_name: string }>>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch<{ projects: Project[] }>('/api/v1/projects');
      const all: Array<DocumentItem & { project_name: string }> = [];
      for (const project of data.projects) {
        const docs = await apiFetch<DocumentItem[]>(`/api/v1/projects/${project.id}/documents`);
        all.push(...docs.map((doc) => ({ ...doc, project_name: project.name })));
      }
      setItems(all);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <motion.div className="min-h-full p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-purple-400 mb-2">Evidence sources</p>
            <h1 className="text-3xl font-bold">Artifacts</h1>
            <p className="text-gray-500 mt-2">Tender and bidder documents attached to your compliance projects.</p>
          </div>
          <button onClick={load} className="rounded-xl border border-white/10 p-3 text-gray-400 hover:text-white hover:bg-white/5"><RefreshCw size={18} /></button>
        </div>

        {loading ? <p className="text-gray-500">Loading artifacts…</p> : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center"><FolderOpen className="mx-auto text-gray-600" size={30} /><p className="text-gray-500 mt-4">No documents uploaded yet.</p><p className="text-xs text-gray-700 mt-1">Upload a tender or bidder PDF from a project.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((doc) => (
              <div key={doc.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><FileText size={19} className="text-purple-400" /></div>
                <h2 className="font-semibold text-white mt-4 truncate">{doc.filename}</h2>
                <p className="text-xs text-gray-500 mt-1">{doc.project_name}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs rounded-full border border-white/10 px-2 py-1 text-gray-400">{doc.document_type}</span>
                  <span className="text-xs rounded-full border border-white/10 px-2 py-1 text-gray-400">{doc.extraction_status}</span>
                </div>
                <p className="text-xs text-gray-600 mt-4">{doc.page_count ?? '—'} pages · {Math.max(1, Math.round(doc.file_size / 1024))} KB</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
