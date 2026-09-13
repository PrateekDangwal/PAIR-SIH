'use client';
import {FormEvent,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {motion} from 'framer-motion';
import {ArrowRight,Lock,Mail,ShieldCheck} from 'lucide-react';
import {PairLogo} from '@/components/ui/pair-logo';
import {AuthBackground} from './auth-background';
import {useAuth} from '@/hooks/use-auth';

export function LoginForm(){
 const router=useRouter(); const {login}=useAuth(); const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function submit(e:FormEvent){e.preventDefault();setError('');if(!email||!password){setError('Enter email and password.');return}setBusy(true);try{await login(email,password);router.push('/app')}catch(err){setError(err instanceof Error?err.message:'Unable to sign in.')}finally{setBusy(false)}}
 return <div className="relative min-h-screen chassis flex items-center justify-center px-5 py-12"><AuthBackground/><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="relative z-10 w-full max-w-md"><div className="industrial-panel rounded-[28px] p-7 md:p-9"><Link href="/" className="inline-flex"><PairLogo size={42}/></Link><div className="mt-9"><p className="technical text-[9px] font-bold text-accent">AUTH / 01</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.035em]">Welcome back.</h1><p className="mt-2 text-sm leading-6 text-slate">Sign in to your procurement intelligence workspace.</p></div>{error&&<div className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}<form onSubmit={submit} className="mt-7 space-y-5"><label className="block text-sm font-bold">Email<div className="relative mt-2"><Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"/><input className="industrial-input pl-11" value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@organisation.gov.in" autoComplete="email"/></div></label><label className="block text-sm font-bold">Password<div className="relative mt-2"><Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"/><input className="industrial-input pl-11" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" autoComplete="current-password"/></div></label><button disabled={busy} className="industrial-button industrial-button-accent w-full rounded-xl py-3 text-sm font-extrabold">{busy?'AUTHENTICATING…':'SIGN IN'}{!busy&&<ArrowRight size={16}/>}</button></form><div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-slate"><ShieldCheck size={14} className="text-emerald-600"/> JWT authentication / server validated</div><p className="mt-7 text-center text-sm text-slate">New to PAIR? <Link href="/signup" className="font-extrabold text-accent hover:underline">Create account</Link></p></div></motion.div></div>
}
