import Link from 'next/link';
import { Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { PairLogo } from '@/components/ui/pair-logo';
export function Footer(){
 return <footer className="border-t border-slate/15 bg-[#d8dee8]"><div className="mx-auto max-w-6xl px-5 py-14">
  <div className="grid gap-10 md:grid-cols-[1.4fr_.7fr_.7fr_1fr]">
   <div><PairLogo size={42}/><p className="mt-5 max-w-sm text-sm leading-6 text-slate">AI-powered procurement intelligence for requirement-level bid verification and evidence-backed review.</p><div className="mt-5 flex items-center gap-2"><span className="screw"/><span className="technical text-[9px] font-bold text-slate">FINAL DECISION: PROCUREMENT OFFICER</span></div></div>
   <div><p className="technical text-[10px] font-bold text-slate">Platform</p><div className="mt-4 space-y-3 text-sm font-semibold"><Link href="/#workflow" className="block hover:text-accent">Workflow</Link><Link href="/#verification" className="block hover:text-accent">Verification</Link><Link href="/how-it-works" className="block hover:text-accent">How it works</Link></div></div>
   <div><p className="technical text-[10px] font-bold text-slate">Company</p><div className="mt-4 space-y-3 text-sm font-semibold"><Link href="/about" className="block hover:text-accent">About</Link><Link href="/contact" className="block hover:text-accent">Contact</Link><Link href="/signup" className="block hover:text-accent">Get started</Link></div></div>
   <div><p className="technical text-[10px] font-bold text-slate">Project links</p><div className="mt-4 space-y-3 text-sm font-semibold"><a href="https://github.com/PrateekDangwal/PAIR-SIH" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-accent"><Github size={15}/> Project repository <ArrowUpRight size={12}/></a><a href="mailto:prateeknnr77@gmail.com" className="flex items-center gap-2 hover:text-accent"><Mail size={15}/> Email team</a><a href="https://www.linkedin.com/in/prateek-dangwal-8479b0313/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-accent"><Linkedin size={15}/> LinkedIn <ArrowUpRight size={12}/></a></div></div>
  </div><div className="mt-12 flex flex-col gap-3 border-t border-slate/15 pt-5 text-[11px] font-mono text-slate sm:flex-row sm:justify-between"><span>PAIR / PROCUREMENT INTELLIGENCE</span><span>© {new Date().getFullYear()} PAIR</span></div>
 </div></footer>
}
