import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function IndustrialPanel({ children, className, recessed=false, elevated=false }: { children: ReactNode; className?: string; recessed?: boolean; elevated?: boolean }) {
  return <section className={cn(recessed ? 'industrial-recessed' : elevated ? 'shadow-floating' : 'industrial-panel', 'relative rounded-2xl', className)}>{children}</section>;
}

export function TechnicalLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('technical text-[10px] font-bold text-slate', className)}>{children}</span>;
}

export function StatusLED({ status='online', label }: { status?: 'online'|'warning'|'offline'|'danger'; label?: string }) {
  const cls = status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,.75)]' : status === 'warning' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,.65)]' : status === 'danger' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,.65)]' : 'bg-slate-400';
  return <span className="inline-flex items-center gap-2"><span className={cn('h-2.5 w-2.5 rounded-full', cls, status==='online' && 'animate-soft-pulse')} />{label && <span className="technical text-[10px] font-bold text-slate">{label}</span>}</span>;
}

export function ScrewCorners() {
  return <><span className="screw absolute left-3 top-3"/><span className="screw absolute right-3 top-3"/><span className="screw absolute bottom-3 left-3"/><span className="screw absolute bottom-3 right-3"/></>;
}

export function VentSlots() {
  return <span className="absolute right-4 top-4 flex gap-1"><i className="vent"/><i className="vent"/><i className="vent"/></span>;
}
