'use client';
import Link from 'next/link';
import {Bell,Menu,Plus,Search} from 'lucide-react';
import {useState} from 'react';
import {PairLogo} from '@/components/ui/pair-logo';
import {useAuth} from '@/hooks/use-auth';
export function Topbar(){
 const [open,setOpen]=useState(false);const {user}=useAuth();
 return <header className="sticky top-0 z-30 border-b border-slate/15 bg-[#e0e5ec]/85 px-4 py-3 backdrop-blur-xl lg:hidden"><div className="flex items-center justify-between"><button onClick={()=>setOpen(!open)} className="rounded-lg p-2"><Menu size={20}/></button><PairLogo size={35}/><div className="flex items-center gap-1"><Link href="/app/projects" className="rounded-lg p-2"><Plus size={18}/></Link><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d3436] text-xs font-bold text-white">{user?.email?.[0]?.toUpperCase()||'P'}</span></div></div>{open&&<nav className="mt-3 space-y-1 border-t border-slate/15 pt-3">{[['Overview','/app'],['Bid Reviews','/app/projects'],['AI Assistant','/app/chat'],['Documents','/app/artifacts'],['Risk & Audit','/app/activity'],['AI Models','/app/models'],['Settings','/app/settings']].map(([l,h])=><Link key={h} href={h} onClick={()=>setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-bold text-slate hover:bg-white/50">{l}</Link>)}</nav>}</header>
}
