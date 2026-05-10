'use client';

import { motion } from 'framer-motion';
import { Users, Mail, Briefcase, CheckSquare } from 'lucide-react';
import { useUsers } from '@/hooks/use-queries';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-purple-500/10 text-purple-400',
  PROJECT_MANAGER: 'bg-blue-500/10 text-blue-400',
  MEMBER: 'bg-green-500/10 text-green-400',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  MEMBER: 'Member',
};

interface User {
  id: string; name: string; email: string; role: string;
  avatarColor: string; title?: string; department?: string;
  isActive: boolean; lastActiveAt?: string; createdAt: string;
  _count?: { assignedTasks: number; ownedProjects: number };
}

export default function TeamPage() {
  const { user: currentUser } = useAuthStore();
  const { data, isLoading } = useUsers({});
  const members: User[] = data?.data ?? [];

  const rolePermissions: Record<string, string[]> = {
    ADMIN: ['Manage users', 'Create projects', 'Manage teams', 'View all analytics', 'Create & assign tasks'],
    PROJECT_MANAGER: ['Create & assign tasks', 'Monitor performance', 'Manage deadlines', 'View project analytics'],
    MEMBER: ['View assigned tasks', 'Update task progress', 'Add comments', 'Upload attachments'],
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{members.length} members</p>
        </div>
      </div>

      {/* Members Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="nexus-card animate-pulse h-44">
              <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3" />
              <div className="h-3 bg-muted rounded w-3/4 mx-auto mb-2" />
              <div className="h-2 bg-muted rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Users className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-base font-medium">No team members found</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {members.map((member) => (
            <motion.div
              key={member.id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className={`nexus-card text-center hover:border-border/80 transition-all ${member.id === currentUser?.id ? 'border-primary/30' : ''}`}
            >
              <div className="relative inline-block mb-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto"
                  style={{ background: member.avatarColor }}
                >
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card ${member.isActive ? 'bg-green-400' : 'bg-muted-foreground'}`} />
              </div>

              <h3 className="font-semibold text-sm">{member.name}</h3>
              {member.title && <p className="text-xs text-muted-foreground mt-0.5">{member.title}</p>}

              <div className="my-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLES[member.role]}`}>
                  {ROLE_LABELS[member.role]}
                </span>
              </div>

              {member.department && (
                <p className="text-[11px] text-muted-foreground mb-3">{member.department}</p>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-muted/40 rounded-lg p-1.5 text-center">
                  <div className="text-sm font-bold">{member._count?.assignedTasks ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground">Tasks</div>
                </div>
                <div className="bg-muted/40 rounded-lg p-1.5 text-center">
                  <div className="text-sm font-bold">{member._count?.ownedProjects ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground">Projects</div>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground/60">
                Joined {formatDate(member.createdAt, 'MMM yyyy')}
              </div>

              {member.id === currentUser?.id && (
                <div className="mt-2 text-[10px] text-primary font-medium">You</div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Role Permissions Table */}
      <div className="nexus-card">
        <h2 className="text-sm font-semibold mb-4">Role Permissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Permission</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-purple-400 uppercase tracking-wide">Admin</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-blue-400 uppercase tracking-wide">Project Manager</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-green-400 uppercase tracking-wide">Member</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Manage users & roles', true, false, false],
                ['Create projects', true, false, false],
                ['Manage teams', true, false, false],
                ['View org analytics', true, false, false],
                ['Create tasks', true, true, false],
                ['Assign tasks', true, true, false],
                ['Monitor performance', true, true, false],
                ['Manage deadlines', true, true, false],
                ['Update task progress', true, true, true],
                ['Add comments', true, true, true],
                ['View assigned tasks', true, true, true],
                ['Upload attachments', true, true, true],
              ].map(([perm, admin, pm, member], i) => (
                <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3 text-sm">{perm as string}</td>
                  <td className="py-2.5 px-3 text-center">{admin ? <span className="text-green-400 font-bold">✓</span> : <span className="text-border">—</span>}</td>
                  <td className="py-2.5 px-3 text-center">{pm ? <span className="text-green-400 font-bold">✓</span> : <span className="text-border">—</span>}</td>
                  <td className="py-2.5 px-3 text-center">{member ? <span className="text-green-400 font-bold">✓</span> : <span className="text-border">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
