'use client';
import { motion } from 'framer-motion';

export function PairLogo({ size=44, showWordmark=true, animated=false, className='' }: { size?: number; showWordmark?: boolean; animated?: boolean; className?: string }) {
  const mark = <motion.svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-label="PAIR" animate={animated ? {rotate:[0,1,-1,0]} : undefined} transition={animated ? {duration:4,repeat:Infinity,ease:'easeInOut'} : undefined}>
    <rect x="3" y="3" width="42" height="42" rx="11" fill="#e0e5ec" stroke="#a3b1c6"/>
    <path d="M24 9l4.7 9.8 10.8 1.1-8.1 7.3 2.4 10.8L24 32.3l-9.8 5.7 2.4-10.8-8.1-7.3 10.8-1.1L24 9Z" fill="#2d3436" fillOpacity=".08" stroke="#2d3436" strokeWidth="1.7" strokeLinejoin="round"/>
    <path d="M24 14v20M14 24h20M17 31l14-14" stroke="#2d3436" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="24" cy="24" r="4" fill="#e0e5ec" stroke="#2d3436" strokeWidth="1.5"/>
    <circle cx="24" cy="24" r="1.2" fill="#ff4757"/>
  </motion.svg>;
  if (!showWordmark) return <span className={className}>{mark}</span>;
  return <span className={`inline-flex items-center gap-3 ${className}`}>{mark}<span className="leading-none"><strong className="block text-[16px] tracking-[.18em] text-ink">PAIR</strong><small className="technical mt-1 block text-[7px] font-bold text-slate">Procurement Intelligence</small></span></span>;
}
