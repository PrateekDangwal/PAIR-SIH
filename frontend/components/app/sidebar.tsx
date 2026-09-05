'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  Cpu,
  Activity,
  Settings,
  LogOut,
  FileText,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { PairLogo } from '@/components/ui/pair-logo';

const SIDEBAR_ITEMS = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    href: '/app',
  },
  {
    icon: FolderOpen,
    label: 'Bid Reviews',
    href: '/app/projects',
  },
  {
    icon: MessageSquare,
    label: 'AI Assistant',
    href: '/app/chat',
  },
  {
    icon: FileText,
    label: 'Documents',
    href: '/app/artifacts',
  },
  {
    icon: AlertTriangle,
    label: 'Risk Analysis',
    href: '/app/activity',
  },
  {
    icon: Activity,
    label: 'Audit Trail',
    href: '/app/activity',
  },
  {
    icon: Cpu,
    label: 'AI Models',
    href: '/app/models',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/app/settings',
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <motion.aside
      className="sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-white/[0.08] bg-[#0b0b0d] md:flex"
      animate={{
        width: isCollapsed ? 76 : 244,
      }}
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
    >
      {/* PAIR LOGO — CLICK TO COLLAPSE / EXPAND */}
      <div className="flex h-[76px] items-center border-b border-white/[0.07] px-4">
        <button
          type="button"
          onClick={() => setIsCollapsed((value) => !value)}
          className={`group flex w-full items-center rounded-xl p-1 text-left transition-colors hover:bg-white/[0.035] ${
            isCollapsed ? 'justify-center' : ''
          }`}
          aria-label={
            isCollapsed
              ? 'Expand PAIR navigation'
              : 'Collapse PAIR navigation'
          }
          title={
            isCollapsed
              ? 'Expand navigation'
              : 'Collapse navigation'
          }
        >
          <PairLogo
            size={38}
            showWordmark={!isCollapsed}
          />
        </button>
      </div>

      {/* WORKSPACE LABEL */}
      {!isCollapsed && (
        <div className="px-5 pb-2 pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-600">
            Workspace
          </p>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== '/app' &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
            >
              <motion.div
                whileHover={{
                  x: isActive ? 0 : 1,
                }}
                className={`relative flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                  isActive
                    ? 'border-white/[0.08] bg-white/[0.08] text-white'
                    : 'border-transparent text-gray-500 hover:bg-white/[0.035] hover:text-gray-200'
                } ${
                  isCollapsed
                    ? 'justify-center'
                    : ''
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-violet-300" />
                )}

                <Icon
                  size={17}
                  strokeWidth={1.8}
                />

                {!isCollapsed && (
                  <span className="text-[13px] font-medium">
                    {item.label}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* SIGN OUT */}
      <div className="border-t border-white/[0.07] p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={`w-full text-gray-500 transition-colors hover:bg-white/[0.05] hover:text-white ${
            isCollapsed
              ? 'justify-center'
              : 'justify-start'
          }`}
          title={isCollapsed ? 'Sign out' : undefined}
        >
          <LogOut size={16} />

          {!isCollapsed && (
            <span className="ml-2">
              Sign out
            </span>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}