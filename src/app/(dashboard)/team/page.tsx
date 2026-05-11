'use client';

import { useMemo, useState } from 'react';
import {
  Users,
  Mail,
  Shield,
  Search,
  Briefcase,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import { useUsers, useTasks } from '@/hooks/use-queries';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  assigneeId?: string;
}

export default function TeamPage() {
  const [search, setSearch] = useState('');

  const { data: usersData, isLoading: usersLoading } = useUsers({});
  const { data: tasksData } = useTasks({});

  const members: User[] = usersData?.data?.data ?? [];
  const tasks: Task[] = tasksData?.data?.data ?? [];

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const query = search.toLowerCase();

      return (
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
      );
    });
  }, [members, search]);

  const getUserStats = (userId: string) => {
    const assignedTasks = tasks.filter((task) => task.assigneeId === userId);

    const completed = assignedTasks.filter(
      (task) => task.status === 'DONE'
    ).length;

    const inProgress = assignedTasks.filter(
      (task) => task.status === 'IN_PROGRESS'
    ).length;

    return {
      total: assignedTasks.length,
      completed,
      inProgress,
    };
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <div className="text-muted-foreground animate-pulse">
          Loading team members...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Team Members
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage team collaboration and workload
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {filteredMembers.length} members
          </span>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="border border-border rounded-2xl p-10 text-center bg-card/40">
          <Users className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No members found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const stats = getUserStats(member.id);

            return (
              <div
                key={member.id}
                className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                      {member.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg leading-none">
                        {member.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <Shield className="w-4 h-4 text-primary" />

                  <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {member.role}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border p-3 bg-background/40">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Briefcase className="w-3 h-3" />
                      Total
                    </div>

                    <div className="text-xl font-bold">
                      {stats.total}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border p-3 bg-background/40">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Clock3 className="w-3 h-3" />
                      Active
                    </div>

                    <div className="text-xl font-bold text-yellow-400">
                      {stats.inProgress}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border p-3 bg-background/40">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Done
                    </div>

                    <div className="text-xl font-bold text-green-400">
                      {stats.completed}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
