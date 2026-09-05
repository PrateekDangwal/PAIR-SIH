'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, FileText, Loader2, RefreshCw, Sparkles,
  Upload, XCircle, Search, ArrowUpRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Project = { id: number; name: string; description: string | null; gem_tender_id: string | null; status: string };
type Requirement = { id: number; title: string; requirement_text: string; category: string; is_mandatory: boolean; priority: number; severity: string; source_page_number: number | null; extraction_confidence: number | null };
type Evidence = { id: number; evidence_text: string; evidence_type: string; source_page_number: number | null; confidence: number | null; source_document_id: number };
type DocumentItem = { id: number; filename: string; file_size: number; document_type: string; extraction_status: string; page_count: number | null; created_at: string };
type Result = { id: number; requirement_id: number; evidence_id: number | null; status: 'compliant' | 'partial' | 'non_compliant' | 'needs_review' | 'insufficient_data'; explanation: string | null; confidence: number | null };
type Summary = { total_requirements: number; evaluated_requirements: number; unevaluated_requirements: number; compliant: number; partial: number; non_compliant: number; needs_review: number; insufficient_data: number; compliance_score: number; risk_level: 'low' | 'medium' | 'high'; mandatory_failures: Array<{ requirement_id: number; title: string; reason: string }> };

const statusMeta = {
  compliant: { label: 'COMPLIANT', text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', Icon: CheckCircle2 },
  partial: { label: 'PARTIAL', text: 'text-amber-300', bg: 'bg-amber-300/10', border: 'border-amber-300/20', Icon: AlertTriangle },
  non_compliant: { label: 'NON-COMPLIANT', text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', Icon: XCircle },
  needs_review: { label: 'REVIEW', text: 'text-amber-300', bg: 'bg-amber-300/10', border: 'border-amber-300/20', Icon: HelpCircle },
  insufficient_data: { label: 'INSUFFICIENT DATA', text: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20', Icon: HelpCircle },
} as const;

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const projectId = Number(params.id);
  const [project, setProject] = useState<Project | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [results, setResults] = useState<Record<number, Result>>({});
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recommendation, setRecommendation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'tender' | 'vendor'>('tender');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | Result['status']>('all');
  const [query, setQuery] = useState('');

  async function load() {
    setBusy('loading'); setError('');
    try {
      const [p, reqs, evs, docs, res, sum] = await Promise.all([
        apiFetch<Project>(`/api/v1/projects/${projectId}`),
        apiFetch<Requirement[]>(`/api/v1/projects/${projectId}/requirements`),
        apiFetch<Evidence[]>(`/api/v1/projects/${projectId}/evidence`),
        apiFetch<DocumentItem[]>(`/api/v1/projects/${projectId}/documents`),
        apiFetch<Result[]>(`/api/v1/compliance/projects/${projectId}/results`),
        apiFetch<Summary>(`/api/v1/compliance/projects/${projectId}/summary`),
      ]);
      const map: Record<number, Result> = {};
      res.forEach((item) => { map[item.requirement_id] = item; });
      setProject(p); setRequirements(reqs); setEvidence(evs); setDocuments(docs); setResults(map); setSummary(sum);
      setSelectedId((current) => current ?? reqs[0]?.id ?? null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load review.'); }
    finally { setBusy(''); }
  }

  useEffect(() => { if (Number.isFinite(projectId)) load(); }, [projectId]);

  async function uploadDocument() {
    if (!file) return;
    setBusy('upload'); setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const uploaded = await apiFetch<DocumentItem>(`/api/v1/projects/${projectId}/documents?document_type=${documentType}`, { method: 'POST', body });
      await apiFetch(`/api/v1/projects/${projectId}/documents/${uploaded.id}/extract`, { method: 'POST' });
      setFile(null);
      const input = document.getElementById('document-upload') as HTMLInputElement | null;
      if (input) input.value = '';
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Document upload failed.'); }
    finally { setBusy(''); }
  }

  async function extractDocument(document: DocumentItem, action: 'requirements' | 'evidence') {
    setBusy(`${action}-${document.id}`); setError('');
    try {
      const suffix = action === 'requirements' ? 'extract-requirements?provider=nvidia' : 'extract-evidence?provider=nvidia';
      await apiFetch(`/api/v1/projects/${projectId}/documents/${document.id}/${suffix}`, { method: 'POST' });
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : `${action} extraction failed.`); }
    finally { setBusy(''); }
  }

  async function analyzeAll() {
    setBusy('analyze'); setError('');
    try {
      await apiFetch<Summary>(`/api/v1/compliance/projects/${projectId}/analyze-all`, { method: 'POST' });
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Compliance analysis failed.'); }
    finally { setBusy(''); }
  }

  async function generateRecommendation() {
    setBusy('recommend'); setError('');
    try {
      const data = await apiFetch<{ recommendation: string }>(`/api/v1/compliance/recommendation?project_id=${projectId}`, { method: 'POST' });
      setRecommendation(data.recommendation);
    } catch (err) { setError(err instanceof Error ? err.message : 'Recommendation generation failed.'); }
    finally { setBusy(''); }
  }

  const visible = useMemo(() => requirements.filter((req) => {
    const result = results[req.id];
    const matchesFilter = filter === 'all' || result?.status === filter;
    const hay = `${req.title} ${req.requirement_text} ${req.category}`.toLowerCase();
    return matchesFilter && hay.includes(query.toLowerCase());
  }), [requirements, results, filter, query]);

  const selected = selectedId ? requirements.find((r) => r.id === selectedId) : undefined;
  const selectedResult = selected ? results[selected.id] : undefined;
  const selectedEvidence = selectedResult?.evidence_id != null ? evidence.find((e) => e.id === selectedResult.evidence_id) : undefined;
  const selectedMeta = selectedResult ? statusMeta[selectedResult.status] : null;
  const risk = summary?.risk_level || 'high';

  if (!project) return <div className="p-6 text-sm text-gray-600">{error || 'Loading review…'}</div>;

  return (
    <motion.div className="min-h-full p-4 md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="pair-kicker mb-2">Bid compliance review</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight">{project.name}</h1>
              {project.gem_tender_id && <span className="rounded border border-white/[0.08] bg-white/[0.025] px-2 py-1 font-mono text-[10px] text-gray-500">{project.gem_tender_id}</span>}
            </div>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-gray-600">{project.description || 'Tender-specific requirement, evidence and compliance workspace.'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="rounded-lg border border-white/[0.08] p-2.5 text-gray-500 hover:text-white" aria-label="Refresh review"><RefreshCw size={16} /></button>
            <button onClick={analyzeAll} disabled={!!busy || requirements.length === 0} className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black disabled:opacity-40">
              {busy === 'analyze' ? <><Loader2 size={14} className="mr-2 inline animate-spin" />Analyzing</> : 'Run compliance analysis'}
            </button>
          </div>
        </header>

        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/[0.05] p-3 text-xs text-red-300">{error}</div>}

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.07]">
          {[
            ['Compliance', summary ? `${summary.compliance_score}%` : '—', 'overall score'],
            ['Verified', summary ? summary.compliant : '—', 'compliant requirements'],
            ['Review', summary ? summary.needs_review : '—', 'needs officer review'],
            ['Non-compliant', summary ? summary.non_compliant : '—', 'failed requirements'],
            ['Risk', risk.toUpperCase(), 'current risk level'],
          ].map(([title, value, sub]) => (
            <div key={String(title)} className="bg-[#111113] p-4 md:p-5">
              <p className="pair-kicker">{title}</p>
              <p className={`mt-2 text-xl md:text-2xl font-semibold ${title === 'Risk' ? (risk === 'high' ? 'text-red-400' : risk === 'medium' ? 'text-amber-300' : 'text-emerald-400') : ''}`}>{value}</p>
              <p className="mt-1 text-[10px] text-gray-600">{sub}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-white/[0.07] bg-[#101012] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="pair-kicker">Bid documents</p>
              <p className="mt-1 text-xs text-gray-600">Upload tender and bidder PDFs, then extract requirements or evidence.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex h-9 cursor-pointer items-center rounded-lg border border-dashed border-white/[0.12] px-3 text-xs text-gray-500 hover:text-white">
                <Upload size={14} className="mr-2" />
                <span className="max-w-[220px] truncate">{file ? file.name : 'Choose PDF'}</span>
                <input id="document-upload" type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
              </label>
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value as 'tender' | 'vendor')} className="h-9 rounded-lg border border-white/[0.08] bg-black/20 px-3 text-xs text-gray-300 outline-none">
                <option value="tender">Tender / bid</option><option value="vendor">Bidder / vendor</option>
              </select>
              <button onClick={uploadDocument} disabled={!file || !!busy} className="h-9 rounded-lg bg-white px-4 text-xs font-semibold text-black disabled:opacity-35">{busy === 'upload' ? 'Uploading…' : 'Upload'}</button>
            </div>
          </div>
          {documents.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {documents.map((doc) => (
                <div key={doc.id} className="min-w-[230px] rounded-lg border border-white/[0.07] bg-black/20 p-3">
                  <div className="flex items-center gap-2"><FileText size={15} className="text-gray-500" /><p className="truncate text-xs text-gray-300">{doc.filename}</p></div>
                  <p className="mt-1 text-[10px] text-gray-600">{doc.document_type} · {doc.page_count ?? '—'} pages · {doc.extraction_status}</p>
                  <div className="mt-2 flex gap-1.5">
                    {doc.document_type !== 'vendor' && <button onClick={() => extractDocument(doc, 'requirements')} disabled={!!busy || doc.extraction_status !== 'completed'} className="rounded border border-white/[0.08] px-2 py-1 text-[10px] text-gray-500 hover:text-white disabled:opacity-30">{busy === `requirements-${doc.id}` ? '…' : 'Requirements'}</button>}
                    {doc.document_type === 'vendor' && <button onClick={() => extractDocument(doc, 'evidence')} disabled={!!busy || doc.extraction_status !== 'completed'} className="rounded border border-white/[0.08] px-2 py-1 text-[10px] text-gray-500 hover:text-white disabled:opacity-30">{busy === `evidence-${doc.id}` ? '…' : 'Evidence'}</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.55fr_.9fr]">
          <section className="min-w-0 overflow-hidden rounded-xl border border-white/[0.07] bg-[#101012]">
            <div className="border-b border-white/[0.07] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div><p className="pair-kicker">Requirement matrix</p><p className="mt-1 text-xs text-gray-600">{summary?.evaluated_requirements ?? 0} of {summary?.total_requirements ?? requirements.length} evaluated</p></div>
                <div className="relative w-full md:w-64"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter requirements…" className="h-8 w-full rounded-lg border border-white/[0.08] bg-black/20 pl-8 text-xs outline-none placeholder:text-gray-700" /></div>
              </div>
              <div className="mt-3 flex gap-1.5 overflow-x-auto">
                {(['all','compliant','needs_review','non_compliant','partial','insufficient_data'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-md border px-2.5 py-1 text-[10px] ${filter === f ? 'border-white/[0.15] bg-white/[0.08] text-white' : 'border-transparent text-gray-600 hover:text-gray-300'}`}>{f === 'all' ? 'All' : f.replace(/_/g, ' ')}</button>
                ))}
              </div>
            </div>
            <div className="hidden md:grid grid-cols-[1.55fr_.72fr_.8fr_.65fr] gap-3 border-b border-white/[0.07] px-4 py-3 text-[9px] uppercase tracking-[0.14em] text-gray-600">
              <span>Requirement</span><span>Evidence</span><span>Verification</span><span>Verdict</span>
            </div>
            {visible.length === 0 ? <div className="p-12 text-center text-xs text-gray-600">No requirements match this filter.</div> :
              visible.map((req) => {
                const result = results[req.id];
                const meta = result ? statusMeta[result.status] : null;
                const evidenceItem = result?.evidence_id != null ? evidence.find((e) => e.id === result.evidence_id) : undefined;
                const ActiveIcon = meta?.Icon || HelpCircle;
                return (
                  <button type="button" key={req.id} onClick={() => setSelectedId(req.id)} className={`grid w-full grid-cols-1 gap-2 px-4 py-4 text-left md:grid-cols-[1.55fr_.72fr_.8fr_.65fr] md:items-center md:gap-3 pair-table-row ${selectedId === req.id ? 'bg-white/[0.035]' : ''}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><span className="font-mono text-[9px] text-gray-700">#{req.id}</span>{req.is_mandatory && <span className="rounded border border-red-400/20 bg-red-400/[0.05] px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-red-300">mandatory</span>}</div>
                      <p className="mt-1 truncate text-xs font-medium text-gray-200">{req.title}</p>
                      <p className="mt-1 line-clamp-1 text-[10px] text-gray-600">{req.requirement_text}</p>
                    </div>
                    <div className="min-w-0 text-[10px] text-gray-500">{evidenceItem ? <><p className="truncate text-gray-400">Evidence #{evidenceItem.id}</p><p className="mt-1 truncate text-gray-700">{evidenceItem.evidence_type}</p></> : <span className="text-gray-700">Not linked</span>}</div>
                    <div className="text-[10px] text-gray-500">{result?.confidence != null ? `${Math.round(result.confidence * 100)}% confidence` : result ? 'Analyzed' : 'Not evaluated'}</div>
                    <div>{meta ? <span className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[9px] font-medium ${meta.text} ${meta.bg} ${meta.border}`}><ActiveIcon size={10} />{meta.label}</span> : <span className="text-[9px] text-gray-700">PENDING</span>}</div>
                  </button>
                );
              })}
          </section>

          <aside className="rounded-xl border border-white/[0.07] bg-[#101012] overflow-hidden">
            <div className="border-b border-white/[0.07] px-4 py-3 flex items-center justify-between">
              <div><p className="pair-kicker">Evidence inspector</p><p className="mt-1 text-xs text-gray-600">Selected requirement</p></div>
              <ShieldCheck size={15} className="text-gray-600" />
            </div>
            {selected ? (
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-semibold leading-5">{selected.title}</h2>
                    {selectedMeta && <span className={`shrink-0 rounded border px-2 py-1 text-[8px] ${selectedMeta.text} ${selectedMeta.bg} ${selectedMeta.border}`}>{selectedMeta.label}</span>}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-500">{selected.requirement_text}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-white/[0.07] bg-black/20 p-3"><p className="pair-kicker">Tender</p><p className="mt-2 text-xs text-gray-300">{selected.source_page_number ? `Page ${selected.source_page_number}` : 'Page not recorded'}</p></div>
                  <div className="rounded-lg border border-white/[0.07] bg-black/20 p-3"><p className="pair-kicker">Evidence</p><p className="mt-2 text-xs text-gray-300">{selectedEvidence ? `#${selectedEvidence.id}` : 'None linked'}</p></div>
                </div>

                {selectedEvidence ? (
                  <div className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.04] p-3">
                    <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /><p className="text-[10px] uppercase tracking-wider text-emerald-300">Linked evidence</p></div>
                    <p className="mt-2 text-xs leading-5 text-gray-300">{selectedEvidence.evidence_text}</p>
                    <p className="mt-2 text-[10px] text-gray-600">{selectedEvidence.evidence_type}{selectedEvidence.source_page_number ? ` · page ${selectedEvidence.source_page_number}` : ''}{selectedEvidence.confidence != null ? ` · ${Math.round(selectedEvidence.confidence * 100)}% confidence` : ''}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-300/15 bg-amber-300/[0.04] p-3"><p className="text-[10px] uppercase tracking-wider text-amber-300">No linked evidence</p><p className="mt-2 text-xs leading-5 text-gray-500">PAIR cannot support a positive compliance conclusion without relevant evidence.</p></div>
                )}

                {selectedResult && (
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.018] p-3">
                    <p className="pair-kicker">AI analysis</p>
                    <p className="mt-2 text-xs leading-5 text-gray-400">{selectedResult.explanation || 'No explanation was returned.'}</p>
                    {selectedResult.confidence != null && <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[10px]"><span className="text-gray-600">Analysis confidence</span><span className="text-gray-300">{Math.round(selectedResult.confidence * 100)}%</span></div>}
                  </div>
                )}

                <div className="rounded-lg border border-white/[0.07] p-3">
                  <p className="pair-kicker">Decision principle</p>
                  <p className="mt-2 text-xs leading-5 text-gray-500">AI assists the review; the procurement officer retains final decision authority.</p>
                </div>
              </div>
            ) : <div className="p-10 text-center text-xs text-gray-600">Select a requirement to inspect its evidence.</div>}
          </aside>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_.75fr]">
          <div className="rounded-xl border border-white/[0.07] bg-[#101012] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="pair-kicker">AI recommendation</p><h2 className="mt-1 text-base font-medium">Evidence-backed next step</h2></div>
              <button onClick={generateRecommendation} disabled={!!busy || !summary?.evaluated_requirements} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.035] px-3 py-2 text-xs text-gray-300 hover:text-white disabled:opacity-35"><Sparkles size={13} />{busy === 'recommend' ? 'Generating…' : 'Generate recommendation'}</button>
            </div>
            {recommendation ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-300">{recommendation}</p> :
              <p className="mt-4 text-xs leading-5 text-gray-600">Generate a recommendation after requirements have been evaluated. The recommendation is advisory and should be reviewed by the procurement officer.</p>}
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-[#101012] p-5">
            <p className="pair-kicker">Review posture</p>
            <div className="mt-3 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${risk === 'high' ? 'bg-red-400/10' : risk === 'medium' ? 'bg-amber-300/10' : 'bg-emerald-400/10'}`}><AlertTriangle size={18} className={risk === 'high' ? 'text-red-400' : risk === 'medium' ? 'text-amber-300' : 'text-emerald-400'} /></div>
              <div><p className="text-sm font-medium">{risk.toUpperCase()} RISK</p><p className="text-[11px] text-gray-600">{summary?.mandatory_failures?.length || 0} mandatory finding(s) currently recorded.</p></div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
