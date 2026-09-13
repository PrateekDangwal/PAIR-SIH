import { User } from './types';

const USER_KEY = 'pair_auth_user';
const ACCESS_KEY = 'pair_access_token';
const REFRESH_KEY = 'pair_refresh_token';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try { const raw=localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function getAccessToken() { return typeof window === 'undefined' ? null : localStorage.getItem(ACCESS_KEY); }
export function getRefreshToken() { return typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_KEY); }

export function setSession(payload: { user: any; access_token: string; refresh_token: string }) {
  if (typeof window === 'undefined') return;
  const user: User = { id:String(payload.user.id), email:payload.user.email, name:payload.user.email.split('@')[0] };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ACCESS_KEY, payload.access_token);
  localStorage.setItem(REFRESH_KEY, payload.refresh_token);
  document.cookie = `pair_user=1; Path=/; SameSite=Lax`;
  return user;
}
export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY); localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY);
  document.cookie='pair_user=; Path=/; Max-Age=0; SameSite=Lax';
}
