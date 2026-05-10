// src/components/ui/toast-container.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useUIStore();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-xl min-w-[260px] max-w-sm"
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${COLORS[toast.type]}`} />
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
