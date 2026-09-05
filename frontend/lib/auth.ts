import { User } from './types';

const STORAGE_KEY = 'pair_auth_user';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function setStoredUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    document.cookie = `pair_user=${encodeURIComponent(JSON.stringify(user))}; path=/; SameSite=Lax`;
  } else {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = 'pair_user=; path=/; Max-Age=0; SameSite=Lax';
  }
}

export function mockLogin(email: string, password: string): User {
  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name: email.split('@')[0],
  };
  setStoredUser(user);
  return user;
}

export function mockSignup(
  name: string,
  email: string,
  password: string
): User {
  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name,
  };
  setStoredUser(user);
  return user;
}

export function mockLogout(): void {
  setStoredUser(null);
}
