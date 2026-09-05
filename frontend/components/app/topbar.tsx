'use client';

import { Search, Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function Topbar() {
  const { user } = useAuth();
  return (
    <header className="h-[60px] shrink-0 border-b border-white/[0.07] bg-[#0b0b0d]/95 backdrop-blur-xl flex items-center justify-between px-4 md:px-6" aria-label="Application header">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative hidden sm:block w-[340px] lg:w-[430px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            aria-label="Search"
            placeholder="Search tenders, bidders, evidence…"
            className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.025] pl-9 pr-3 text-xs text-gray-200 outline-none placeholder:text-gray-700 focus:border-white/[0.16]"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-white/[0.08] px-1.5 py-0.5 text-[9px] text-gray-600">⌘ K</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          AI runtime ready
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-gray-500 hover:bg-white/[0.05] hover:text-white" aria-label="Help"><HelpCircle size={17} /></button>
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-white/[0.05] hover:text-white" aria-label="Notifications"><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-300" /></button>
        <div className="hidden sm:block h-6 w-px bg-white/[0.08]" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.08] flex items-center justify-center text-xs font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div className="hidden lg:block max-w-[150px]">
            <p className="text-xs font-medium truncate text-gray-200">{user?.name || 'Procurement Officer'}</p>
            <p className="text-[9px] uppercase tracking-wider text-gray-600">Procurement workspace</p>
          </div>
        </div>
      </div>
    </header>
  );
}
