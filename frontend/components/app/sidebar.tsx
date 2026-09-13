'use client';
import {useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Activity,Archive,ChevronLeft,ChevronRight,ClipboardCheck,FileText,LayoutDashboard,LogOut,MessageSquare,Settings,SlidersHorizontal,PanelLeftClose,PanelLeftOpen} from 'lucide-react';
import {PairLogo} from '@/components/ui/pair-logo';
import {useAuth} from '@/hooks/use-auth';
const items=[['Overview','/app',LayoutDashboard],['Bid Reviews','/app/projects',ClipboardCheck],['AI Assistant','/app/chat',MessageSquare],['Documents','/app/artifacts',FileText],['Risk & Audit','/app/activity',Activity],['AI Models','/app/models',SlidersHorizontal],['Settings','/app/settings',Settings]] as const;
export function Sidebar(){
 const [collapsed,setCollapsed]=useState(false);const path=usePathname();const {user,logout}=useAuth();
 return <aside className={`${collapsed?'w-[78px]':'w-[248px]'} sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#a3b1c6]/35 bg-[#d8dee8]/95 px-3 py-4 shadow-[6px_0_16px_rgba(186,190,204,.35)] transition-[width] duration-300 lg:flex`}>
  <div className={`flex items-center ${collapsed?'justify-center':'justify-between'} px-2`}><Link href="/app" aria-label="PAIR"><PairLogo size={collapsed?40:42} showWordmark={!collapsed}/></Link>{!collapsed&&<button onClick={()=>setCollapsed(true)} className="rounded-lg p-2 text-slate hover:bg-white/50" aria-label="Collapse sidebar"><PanelLeftClose size={17}/></button>}</div>
  {collapsed&&<button onClick={()=>setCollapsed(false)} className="mx-auto mt-4 rounded-lg p-2 text-slate hover:bg-white/50" aria-label="Expand sidebar"><PanelLeftOpen size={17}/></button>}
  <div className="mt-7 px-2"><p className={`technical text-[8px] font-bold text-slate/65 ${collapsed?'text-center':''}`}>{collapsed?'NAV':'WORKSPACE'}</p></div>
  <nav className="mt-2 space-y-1">{items.map(([label,href,Icon])=>{const active=href==='/app'?path==='/app':path.startsWith(href);return <Link key={href} href={href} title={collapsed?label:undefined} className={`group flex items-center ${collapsed?'justify-center':'gap-3'} rounded-xl px-3 py-3 text-xs font-extrabold transition ${active?'bg-[#2d3436] text-white shadow-floating':'text-slate hover:bg-white/50 hover:text-ink'}`}><Icon size={17} strokeWidth={1.8}/>{!collapsed&&<span>{label}</span>}{active&&!collapsed&&<span className="ml-auto h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(255,71,87,.55)]"/>}</Link>})}</nav>
  <div className="mt-auto">{!collapsed&&<div className="industrial-recessed mb-3 rounded-xl p-3"><p className="technical text-[8px] text-slate">SIGNED IN AS</p><p className="mt-2 truncate text-xs font-bold text-ink">{user?.email}</p><p className="mt-1 text-[10px] text-slate">Procurement workspace</p></div>}<button onClick={logout} title={collapsed?'Sign out':undefined} className={`flex w-full items-center ${collapsed?'justify-center':'gap-3'} rounded-xl px-3 py-3 text-xs font-extrabold text-slate hover:bg-red-50 hover:text-red-600`}><LogOut size={17}/>{!collapsed&&'Sign out'}</button></div>
 </aside>
}
