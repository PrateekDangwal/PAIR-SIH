import { getAccessToken, getRefreshToken, setSession, clearSession } from './auth';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

let refreshing: Promise<boolean> | null = null;

async function refreshAccessToken() {
  const refresh_token = getRefreshToken();
  if (!refresh_token) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({refresh_token}),
    });
    if(!response.ok) throw new Error();
    const data=await response.json();
    setSession(data);
    return true;
  } catch { clearSession(); return false; }
}

export async function apiFetch<T>(path:string, options:RequestInit={}) : Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();
  if(token) headers.set('Authorization',`Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {...options, headers});
  if(response.status===401 && token && !path.includes('/auth/refresh')) {
    refreshing = refreshing || refreshAccessToken();
    const ok = await refreshing.finally(()=>{refreshing=null});
    if(ok) {
      const retryHeaders=new Headers(options.headers);
      const newToken=getAccessToken(); if(newToken) retryHeaders.set('Authorization',`Bearer ${newToken}`);
      const retry=await fetch(`${API_BASE_URL}${path}`,{...options,headers:retryHeaders});
      const data=await retry.json().catch(()=>null);
      if(!retry.ok) throw new Error(data?.detail || `Request failed (${retry.status})`);
      return data as T;
    }
  }
  const data=await response.json().catch(()=>null);
  if(!response.ok) throw new Error(data?.detail || `Request failed (${response.status})`);
  return data as T;
}
