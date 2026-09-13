'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu,X,ArrowUpRight } from 'lucide-react';
import { PairLogo } from '@/components/ui/pair-logo';
import { Button } from '@/components/ui/button';

export function Navigation(){
 const [open,setOpen]=useState(false);
 const items=[['Platform','#platform'],['Workflow','#workflow'],['Verification','#verification'],['Team','/about']];
 return <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
  <div className="mx-auto max-w-6xl rounded-2xl border border-white/70 bg-[#e0e5ec]/90 px-4 py-3 shadow-floating backdrop-blur-xl">
   <div className="flex items-center justify-between"><Link href="/"><PairLogo size={38}/></Link>
    <div className="hidden md:flex items-center gap-1">{items.map(([l,h])=><a key={h} href={h} className="rounded-lg px-3 py-2 text-xs font-bold text-slate transition hover:bg-white/50 hover:text-ink">{l}</a>)}</div>
    <div className="hidden md:flex items-center gap-2"><Link href="/login" className="rounded-lg px-3 py-2 text-xs font-bold text-slate hover:text-ink">Sign in</Link><Link href="/signup"><Button variant="accent" className="px-4 py-2 text-xs">Open PAIR <ArrowUpRight size={14}/></Button></Link></div>
    <button onClick={()=>setOpen(!open)} className="rounded-lg p-2 text-ink md:hidden" aria-label="Open menu">{open?<X size={20}/>:<Menu size={20}/>}</button></div>
   {open&&<div className="border-t border-slate/15 pt-3 mt-3 space-y-1 md:hidden">{items.map(([l,h])=><a key={h} href={h} onClick={()=>setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-bold text-slate hover:bg-white/50">{l}</a>)}<div className="grid grid-cols-2 gap-2 pt-2"><Link href="/login" className="industrial-button flex items-center justify-center rounded-lg text-sm font-bold text-ink">Sign in</Link><Link href="/signup" className="industrial-button industrial-button-accent flex items-center justify-center rounded-lg text-sm font-bold">Open PAIR</Link></div></div>}
  </div>
 </nav>
}
