// src/components/layout/topbar.tsx
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Plus, Command, Sparkles } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useNotifications } from '@/hooks/use-queries';
import { cn } from '@/lib/utils';

const PAGE_LABELS: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Workspace overview' },
  '/projects': { title: 'Projects', subtitle: '6 active projects' },
  '/tasks': { title: 'My Tasks', subtitle: 'Manage your assigned tasks' },
  '/kanban': { title: 'Kanban Board', subtitle: 'Drag & drop task management' },
  '/calendar': { title: 'Calendar', subtitle: 'Schedule & deadline overview' },
  '/analytics': { title: 'Analytics', subtitle: 'Performance insights' },
  '/workload': { title: 'Workload', subtitle: 'Capacity planning' },
  '/team': { title: 'Team Members', subtitle: '8 members' },
  '/activity': { title: 'Activity Feed', subtitle: 'Live collaboration stream' },
  '/settings': { title: 'Settings', subtitle: 'Workspace configuration' },
};

export function Topbar() {
  const pathname = usePathname();
  const { openModal, toggleNotifPanel } = useUIStore();
  const { data: notifData } = useNotifications();
  const [searchFocused, setSearchFocused] = useState(false);

  const pageInfo = PAGE_LABELS[pathname] ?? { title: 'NexusHQ', subtitle: '' };
  const unreadCount = notifData?.unreadCount ?? 0;

  return (
    <header className="topbar">
      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-base font-semibold leading-tight truncate">
            {pageInfo.title}
          </h2>
          {pageInfo.subtitle && (
            <p className="text-xs text-muted-foreground leading-none mt-0.5">
              {pageInfo.subtitle}
            </p>
          )}
        </motion.div>
      </div>

      {/* Search */}
      <div
        className={cn(
          'relative flex-1 max-w-sm transition-all duration-200',
          searchFocused && 'max-w-lg'
        )}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search projects, tasks, members..."
          className="w-full bg-muted/50 border border-border rounded-lg pl-8 pr-10 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-muted-foreground/60 pointer-events-none">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* New Task */}
        <button
          onClick={() => openModal('createTask')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>

        {/* AI Insights */}
        <button
          className="w-8 h-8 rounded-lg border border-border bg-transparent flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title="AI Insights"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          onClick={toggleNotifPanel}
          className="relative w-8 h-8 rounded-lg border border-border bg-transparent flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 border border-background"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              />
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
}
