'use client';
import React,{createContext,useEffect,useState,ReactNode} from 'react';
import {AuthContextType,User} from '@/lib/types';
import {apiFetch} from '@/lib/api';
import {clearSession,getStoredUser,setSession} from '@/lib/auth';

export const AuthContext=createContext<AuthContextType|null>(null);

export function Providers({children}:{children:ReactNode}) {
  const [user,setUser]=useState<User|null>(null);
  const [isLoading,setIsLoading]=useState(true);
  useEffect(()=>{
    const stored=getStoredUser();
    if(stored) {
      apiFetch<any>('/api/v1/auth/me').then((u)=>setUser({id:String(u.id),email:u.email,name:u.email.split('@')[0]})).catch(()=>clearSession()).finally(()=>setIsLoading(false));
    } else setIsLoading(false);
  },[]);
  const value:AuthContextType={
    user,isLoading,
    login:async(email,password)=>{const data=await apiFetch<any>('/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});setUser(setSession(data) || null);},
    signup:async(email,password)=>{const data=await apiFetch<any>('/api/v1/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});setUser(setSession(data) || null);},
    logout:()=>{clearSession();setUser(null);},
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
