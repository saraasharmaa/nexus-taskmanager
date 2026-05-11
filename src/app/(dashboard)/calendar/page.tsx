'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/use-queries';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PRIORITY_BG: Record<string, string> = {
  LOW: 'bg-green-500/15 text-green-400',
  MEDIUM: 'bg-blue-500/15 text-blue-400',
  HIGH: 'bg-red-500/15 text-red-400',
  CRITICAL: 'bg-red-700/20 text-red-300',
};

interface Task {
  id: string; title: string; priority: string; status: string; dueDate?: string;
  project?: { name: string };
}

export default function CalendarPage() {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const { data } = useTasks({});
  const tasks: Task[] = data?.data?.data ?? [];

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map tasks to day numbers
  const tasksByDay: Record<number, Task[]> = {};
  tasks.forEach(task => {
    if (!task.dueDate) return;
    const d = new Date(task.dueDate);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(task);
    }
  });

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={prev} className="p-1.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-semibold min-w-[160px] text-center">{monthName}</span>
          <button onClick={next} className="p-1.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="nexus-card p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month start */}
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="h-24 rounded-lg opacity-30 bg-muted/20" />
          ))}

          {/* Days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayTasks = tasksByDay[day] ?? [];

            return (
              <div
                key={day}
                className={`h-24 rounded-lg p-1.5 border transition-colors ${isToday ? 'border-primary bg-primary/5' : 'border-border/40 bg-muted/10 hover:bg-muted/20'}`}
              >
                <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{day}</div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate leading-tight font-medium ${PRIORITY_BG[task.priority]}`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[10px] text-muted-foreground/60 px-1">+{dayTasks.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <span className="font-medium">Priority:</span>
        {Object.entries(PRIORITY_BG).map(([k, v]) => (
          <span key={k} className={`px-2 py-0.5 rounded font-medium ${v}`}>{k}</span>
        ))}
        <span className="ml-auto">{Object.values(tasksByDay).flat().length} deadlines this month</span>
      </div>
    </div>
  );
}
