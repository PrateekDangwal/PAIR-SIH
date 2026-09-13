'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'accent'|'secondary'|'ghost'|'dark';
export function Button({ children, className, variant='secondary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: Variant }) {
  const styles = {
    accent: 'industrial-button industrial-button-accent',
    secondary: 'industrial-button bg-[#e0e5ec] text-ink',
    ghost: 'border border-transparent text-slate hover:text-ink hover:bg-white/40 rounded-lg',
    dark: 'industrial-button bg-[#2d3436] text-white border-[#4a5568]',
  };
  return <button className={cn('inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold tracking-[.03em] disabled:cursor-not-allowed disabled:opacity-50', styles[variant], className)} {...props}>{children}</button>;
}
