'use client';
import { useEffect,useState } from 'react';
export function BackgroundVideo(){
 const [reduce,setReduce]=useState(false);
 useEffect(()=>{const m=window.matchMedia('(prefers-reduced-motion: reduce)');const fn=()=>setReduce(m.matches);fn();m.addEventListener('change',fn);return()=>m.removeEventListener('change',fn)},[]);
 if(reduce) return <div className="absolute inset-0 bg-[#2d3436]"/>;
 return <><video autoPlay muted loop playsInline poster="/images/pair-fallback.jpg" className="absolute inset-0 h-full w-full object-cover opacity-45"><source src="/videos/pair-background.mp4" type="video/mp4"/></video><div className="absolute inset-0 bg-gradient-to-b from-[#2d3436]/80 via-[#2d3436]/70 to-[#2d3436]"/></>;
}
