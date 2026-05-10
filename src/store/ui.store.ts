// src/store/ui.store.ts
import { create } from 'zustand';

type Modal =
  | 'createTask'
  | 'editTask'
  | 'createProject'
  | 'editProject'
  | 'taskDetail'
  | 'confirmDelete'
  | 'inviteMember'
  | null;

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  sidebarCollapsed: boolean;
  activeModal: Modal;
  modalData: Record<string, unknown>;
  toasts: Toast[];
  notifPanelOpen: boolean;
  searchQuery: string;
  activeView: string;

  // Actions
  toggleSidebar: () => void;
  openModal: (modal: Modal, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  toggleNotifPanel: () => void;
  closeNotifPanel: () => void;
  setSearchQuery: (q: string) => void;
  setActiveView: (view: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  activeModal: null,
  modalData: {},
  toasts: [],
  notifPanelOpen: false,
  searchQuery: '',
  activeView: 'dashboard',

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  openModal: (modal, data = {}) =>
    set({ activeModal: modal, modalData: data }),

  closeModal: () => set({ activeModal: null, modalData: {} }),

  showToast: (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().dismissToast(id), 4000);
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toggleNotifPanel: () =>
    set((s) => ({ notifPanelOpen: !s.notifPanelOpen })),

  closeNotifPanel: () => set({ notifPanelOpen: false }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setActiveView: (activeView) => set({ activeView }),
}));
