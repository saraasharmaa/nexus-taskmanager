'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, clearAuth, updateUser } = useAuthStore();
  const { showToast } = useUIStore();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [title, setTitle] = useState(user?.title ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateUser(user!.id, { name, title, department });
      updateUser({ name, title, department });
      showToast('Profile updated successfully');
    } catch {
      showToast('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try { await api.logout(); } finally {
      clearAuth();
      router.replace('/login');
    }
  };

  const ROLE_LABEL: Record<string, string> = {
    ADMIN: 'Administrator',
    PROJECT_MANAGER: 'Project Manager',
    MEMBER: 'Member',
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Settings</h1>

      {/* Profile card */}
      <div className="nexus-card mb-4">
        <h2 className="text-sm font-semibold mb-4">Your Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ background: user?.avatarColor ?? '#4f7bef' }}
          >
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{user?.name}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {ROLE_LABEL[user?.role ?? 'MEMBER']}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Job Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Senior Engineer"
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Department</label>
              <input
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 transition-all"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="nexus-card mb-4">
        <h2 className="text-sm font-semibold mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Role</span>
            <span>{ROLE_LABEL[user?.role ?? 'MEMBER']}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Account status</span>
            <span className="text-green-400 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Demo accounts */}
      <div className="nexus-card mb-4 border-primary/20 bg-primary/5">
        <h2 className="text-sm font-semibold mb-2">Demo Accounts</h2>
        <p className="text-xs text-muted-foreground mb-3">Share these credentials for evaluation</p>
        <div className="space-y-2 font-mono text-xs">
          {[
            ['Admin', 'alex.liu@nexushq.com'],
            ['Project Manager', 'sarah.chen@nexushq.com'],
            ['Member', 'marcus.webb@nexushq.com'],
          ].map(([role, email]) => (
            <div key={email} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
              <span className="text-muted-foreground">{role}</span>
              <span>{email}</span>
              <span className="text-muted-foreground">Password123</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="nexus-card border-red-500/20">
        <h2 className="text-sm font-semibold text-red-400 mb-3">Session</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium rounded-lg hover:bg-red-500/20 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
