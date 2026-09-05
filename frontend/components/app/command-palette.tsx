'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Settings, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', href: '/app', icon: null },
  { id: 'projects', label: 'View Projects', href: '/app/projects', icon: null },
  { id: 'models', label: 'AI Models', href: '/app/models', icon: null },
  { id: 'settings', label: 'Settings', href: '/app/settings', icon: Settings },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            className="relative w-full max-w-md bg-black border border-white/20 rounded-lg shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 p-4 border-b border-white/10">
              <Search size={18} className="text-gray-500" />
              <input
                autoFocus
                placeholder="Type a command..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd.href)}
                    className="w-full px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-colors text-left"
                  >
                    {cmd.icon && <cmd.icon size={18} className="text-gray-400" />}
                    <span className="text-white text-sm">{cmd.label}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No commands found
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
