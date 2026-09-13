import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { ExperienceShell } from '@/components/ui/experience-shell';

export const metadata: Metadata = {
  title: 'PAIR — AI-Powered Procurement Intelligence',
  description: 'From Bid Documents to Evidence-Based Procurement Decisions.',
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><Providers><ExperienceShell>{children}</ExperienceShell></Providers></body></html>;
}
