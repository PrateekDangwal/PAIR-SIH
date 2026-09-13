'use client';
import { motion } from 'framer-motion';
import { FileText, ListChecks, SearchCheck, ShieldCheck, AlertTriangle, UserCheck, ArrowRight } from 'lucide-react';
const steps=[
 ['01','TENDER','Ingest the tender document.',FileText],['02','REQUIREMENTS','Extract and structure requirements.',ListChecks],['03','EVIDENCE','Inspect bidder evidence.',SearchCheck],['04','VERIFICATION','Compare evidence against requirements.',ShieldCheck],['05','RISK','Surface unresolved or adverse findings.',AlertTriangle],['06','DECISION','Present an advisory recommendation.',UserCheck]
] as const;
export function HowItWorks(){
 return <section id="workflow" className="mx-auto max-w-6xl px-5"><div className="mb-10 max-w-2xl"><p className="technical text-[10px] font-bold text-accent">WORKFLOW / 06 STAGES</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-.04em] md:text-5xl">A procurement review built like a control system.</h2><p className="mt-4 text-base leading-7 text-slate">Every stage leaves a visible handoff. The interface is designed around evidence, not a single opaque AI score.</p></div>
 <div className="relative"><div className="absolute left-8 right-8 top-8 hidden h-3 rounded-full bg-recessed shadow-recessed md:block"/><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{steps.map(([n,t,d,Icon],i)=><motion.div key={n} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.06}} className="industrial-panel group relative rounded-2xl p-6"><div className="flex items-center justify-between"><span className="technical text-[10px] text-slate">{n}</span><div className="flex h-11 w-11 items-center justify-center rounded-full bg-chassis shadow-floating"><Icon size={20} className="text-accent"/></div></div><h3 className="mt-7 text-lg font-extrabold">{t}</h3><p className="mt-2 text-sm leading-6 text-slate">{d}</p><div className="mt-6 flex items-center gap-2 technical text-[8px] text-slate/60"><span className="h-px flex-1 bg-slate/15"/>{i<5?'NEXT STAGE':'OFFICER REVIEW'}{i<5&&<ArrowRight size={11}/>}</div></motion.div>)}</div></div>
 </section>
}
