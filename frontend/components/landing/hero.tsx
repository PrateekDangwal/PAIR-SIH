'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FileSearch, ShieldCheck, Gauge, Check, Activity } from 'lucide-react';
import { PairLogo } from '@/components/ui/pair-logo';
import { StatusLED, ScrewCorners, VentSlots } from '@/components/ui/industrial';

export function Hero(){
 return <section className="relative overflow-hidden px-5 pb-20 pt-14 md:pb-28">
  <div className="absolute inset-0 blueprint opacity-30"/>
  <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
   <motion.div initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{duration:.7}}>
    <div className="flex items-center gap-3"><PairLogo size={48}/><div className="technical text-[9px] font-bold text-slate">PROCUREMENT INTELLIGENCE / 01</div></div>
    <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d1d9e6] px-3 py-2 shadow-recessed"><StatusLED label="SYSTEM OPERATIONAL"/></div>
    <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-[.98] tracking-[-.05em] text-ink sm:text-6xl lg:text-[76px]">From bid documents<br/><span className="text-slate">to evidence-based decisions.</span></h1>
    <p className="mt-7 max-w-xl text-base leading-7 text-slate sm:text-lg">PAIR turns GeM tender requirements and bidder submissions into a structured, requirement-level compliance review for procurement officers.</p>
    <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/signup" className="industrial-button industrial-button-accent inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold uppercase tracking-wider">Start bid review <ArrowRight size={17}/></Link><a href="#workflow" className="industrial-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e0e5ec] px-6 text-sm font-extrabold uppercase tracking-wider text-ink">Inspect workflow</a></div>
    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-semibold text-slate"><span className="flex items-center gap-2"><Check size={14} className="text-emerald-600"/> Requirement extraction</span><span className="flex items-center gap-2"><Check size={14} className="text-emerald-600"/> Evidence inspection</span><span className="flex items-center gap-2"><Check size={14} className="text-emerald-600"/> Officer review</span></div>
   </motion.div>
   <motion.div initial={{opacity:0,x:28}} animate={{opacity:1,x:0}} transition={{duration:.8,delay:.12}} className="relative">
    <div className="industrial-panel relative rounded-[26px] p-3">
     <ScrewCorners/><VentSlots/>
     <div className="screen min-h-[470px] rounded-[19px] p-5 pt-10">
      <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="technical text-[9px] text-white/55">PAIR / BID REVIEW</p><p className="mt-1 text-sm font-bold">CPCL Tender Workspace</p></div><StatusLED label="ONLINE"/></div>
      <div className="mt-5 grid grid-cols-3 gap-2">{[['REQ',28],['EVID',24],['RISK','LOW']].map(([l,v])=><div key={String(l)} className="rounded-lg bg-white/[.06] p-3"><p className="technical text-[8px] text-white/45">{l}</p><p className="mt-2 text-xl font-bold">{v}</p></div>)}</div>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[.035] p-4"><div className="flex items-center justify-between"><p className="technical text-[8px] text-white/50">COMPLIANCE MATRIX</p><span className="technical text-[8px] text-emerald-300">READY</span></div>{['Eligibility documents','Technical capability','Experience evidence','Delivery requirement','Certification'].map((x,i)=><div key={x} className="mt-4 flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${i===3?'bg-amber-400':'bg-emerald-400'}`}/><span className="text-xs text-white/75">{x}</span><div className="ml-auto h-1.5 w-20 rounded-full bg-white/10"><div className="h-full rounded-full bg-white/55" style={{width:`${88-i*11}%`}}/></div></div>)}</div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-3"><div className="rounded-xl border border-white/10 bg-white/[.035] p-4"><p className="technical text-[8px] text-white/45">AI RECOMMENDATION</p><p className="mt-2 text-xs leading-5 text-white/75">Proceed to officer review of unresolved evidence.</p></div><div className="flex items-center justify-center rounded-xl border border-white/10 px-4"><Gauge size={26} className="text-white/70"/></div></div>
      <div className="mt-4 flex items-center gap-2 text-[9px] text-white/45"><Activity size={12}/> Evidence-first review / advisory output</div>
     </div>
    </div>
   </motion.div>
  </div>
 </section>
}
