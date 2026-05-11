// src/components/layout/notification-panel.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useNotifications, useMarkAllRead } from '@/hooks/use-queries';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS: Record<string, string> = {
  TASK_ASSIGNED: '→', TASK_COMPLETED: '✓', TASK_OVERDUE: '⚠',
  DEADLINE_WARNING: '⏰', COMMENT_ADDED: '💬', MENTION: '@',
  PROJECT_UPDATE: '📋', STATUS_CHANGE: '↻',
};

export function NotificationPanel() {
  const { notifPanelOpen, closeNotifPanel } = useUIStore();
  const { data } = useNotifications();
  const markAllRead = useMarkAllRead();

  const notifications = data?.data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <AnimatePresence>
      {notifPanelOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={closeNotifPanel} />

          <motion.div
            className="fixed top-14 right-4 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={closeNotifPanel} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No notifications</div>
              ) : (
                notifications.map((n: {
                  id: string; type: string; title: string; message: string;
                  isRead: boolean; createdAt: string;
                }) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/3' : ''}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm flex-shrink-0 mt-0.5">
                      {TYPE_ICONS[n.type] ?? '•'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${n.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {n.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">
                        {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'Just now'}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
