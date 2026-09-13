import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('industrial-panel rounded-2xl p-6', className)} {...props} />;
}
