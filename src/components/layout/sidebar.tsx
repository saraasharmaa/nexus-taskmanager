// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Columns3,
  Calendar, BarChart3, Users, Activity, Settings,
  ChevronLeft, ChevronRight, Gauge, Bell, LogOut,
} from 'lucide-react';
import { api } from '@/lib/api-client';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/projects', label: 'Projects', icon: FolderKanban },
      { href: '/tasks', label: 'My Tasks', icon: CheckSquare, badge: 7 },
      { href: '/kanban', label: 'Kanban Board', icon: Columns3 },
      { href: '/calendar', label: 'Calendar', icon: Calendar },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/workload', label: 'Workload', icon: Gauge },
    ],
  },
  {
    label: 'Team',
    items: [
      { href: '/team', label: 'Team Members', icon: Users },
      { href: '/activity', label: 'Activity Feed', icon: Activity },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      clearAuth();
      window.location.href = '/login';
    }
  };

  return (
    <motion.nav
      className="sidebar relative z-20 flex-shrink-0"
      animate={{ width: sidebarCollapsed ? 64 : 220, minWidth: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-[hsl(var(--sidebar-border))] px-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          N
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              className="text-base font-semibold tracking-tight whitespace-nowrap overflow-hidden"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              Nexus<span className="text-primary">HQ</span>
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className={cn(
            'ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex-shrink-0',
            sidebarCollapsed && 'ml-0'
          )}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => {
          if (group.adminOnly && user?.role === 'MEMBER') return null;
          return (
            <div key={group.label}>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {group.label}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 flex-shrink-0',
                          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            className="truncate"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {!sidebarCollapsed && 'badge' in item && item.badge && (
                        <span className="ml-auto text-[10px] font-semibold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="border-t border-[hsl(var(--sidebar-border))] p-2">
        <div
          className={cn(
            'flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ background: user?.avatarColor ?? '#4f7bef' }}
          >
            {user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                className="flex-1 overflow-hidden"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-xs font-medium truncate">{user?.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {user?.role?.replace('_', ' ')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1 rounded text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
