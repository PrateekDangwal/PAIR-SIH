import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Orchestration } from '@/components/landing/orchestration';
import { UseCases } from '@/components/landing/use-cases';
import { Security } from '@/components/landing/security';

export const metadata={title:'PAIR — AI-Powered Procurement Intelligence',description:'From Bid Documents to Evidence-Based Procurement Decisions.'};

export default function LandingPage(){
 return <div>
  <Hero/>
  <div className="space-y-24 pb-24">
   <HowItWorks/><Orchestration/><UseCases/><Security/>
   <section className="mx-auto max-w-6xl px-5"><div className="industrial-panel relative overflow-hidden rounded-[28px] bg-[#2d3436] p-8 text-white md:p-12"><div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-accent/10 blur-3xl"/><p className="technical text-[10px] text-white/45">READY WHEN YOU ARE</p><h2 className="relative mt-3 max-w-3xl text-4xl font-extrabold tracking-[-.04em] md:text-5xl">Put the evidence in one place.</h2><p className="relative mt-4 max-w-2xl text-sm leading-6 text-white/60">Create a review workspace, upload the tender and bidder PDFs, then let PAIR structure the work for officer review.</p><a href="/signup" className="industrial-button industrial-button-accent relative mt-7 inline-flex rounded-xl px-5 py-3 text-sm font-extrabold">Create a review workspace →</a></div></section>
  </div>
 </div>
}
