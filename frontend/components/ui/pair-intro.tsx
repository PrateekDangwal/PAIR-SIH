'use client';
import { useEffect, useState } from 'react';
import { PairLogo } from './pair-logo';
import { StatusLED } from './industrial';

export function PairIntro() {
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    if(sessionStorage.getItem('pair_intro_seen')==='true') return;
    setVisible(true);
    const done=setTimeout(()=>{sessionStorage.setItem('pair_intro_seen','true');setVisible(false)},3200);
    const skip=()=>{sessionStorage.setItem('pair_intro_seen','true');setVisible(false)};
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'||e.key==='Enter')skip()};
    window.addEventListener('keydown',key);
    window.addEventListener('click',skip,{once:true});
    return()=>{clearTimeout(done);window.removeEventListener('keydown',key)};
  },[]);
  if(!visible) return null;
  return <div className="fixed inset-0 z-[100] chassis flex items-center justify-center px-5" role="dialog" aria-label="PAIR startup">
    <div className="absolute inset-0 blueprint opacity-50"/>
    <div className="relative w-full max-w-3xl text-center animate-mechanical-in">
      <div className="mx-auto mb-6 w-fit rounded-[28px] bg-[#e0e5ec] p-4 shadow-industrial"><PairLogo size={68} showWordmark={false} animated/></div>
      <div className="technical text-[10px] font-bold text-slate">AI-POWERED PROCUREMENT INTELLIGENCE</div>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-.04em] text-ink md:text-6xl">Evidence before decision.</h1>
      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2">
        {['TENDER','REQUIREMENTS','EVIDENCE','VERIFICATION','COMPLIANCE','RISK','RECOMMENDATION'].map((n,i)=><div key={n} className="flex items-center gap-2"><span className="industrial-recessed rounded-md px-3 py-2 technical text-[9px] font-bold text-slate">{n}</span>{i<6&&<span className="text-accent">→</span>}</div>)}
      </div>
      <div className="mt-10 flex items-center justify-center gap-3 text-xs font-semibold text-slate"><StatusLED label="SYSTEM READY"/><span>Final decision remains with the procurement officer.</span></div>
      <p className="technical mt-8 text-[9px] text-slate/60">ESC / ENTER TO SKIP</p>
    </div>
  </div>;
}
