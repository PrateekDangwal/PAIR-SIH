'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/app/sidebar';
import { CommandPalette } from '@/components/app/command-palette';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="relative min-h-screen flex-1 overflow-auto">
          {/* Subtle PAIR ambient background */}
          <div className="pointer-events-none fixed inset-0 pair-app-field opacity-40" />

          {/* Command Palette */}
          <CommandPalette />

          {/* Page Content */}
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}