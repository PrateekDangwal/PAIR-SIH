'use client';

import { useState } from 'react';
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function AvatarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity"
      >
        {user.name.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-black/80 backdrop-blur shadow-lg">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>

          <Link
            href="/app/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-sm text-gray-300"
          >
            <Settings size={16} />
            Settings
          </Link>

          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-sm text-gray-300"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
