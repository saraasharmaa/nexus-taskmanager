import { motion } from 'framer-motion';

export interface WorkloadBarProps {
  member: {
    userId: string;
    name: string;
    avatarColor: string;
    activeTasks: number;
    capacityPercent: number;
    isOverloaded: boolean;
  };
  delay?: number;
}

export function WorkloadBar({ member, delay = 0 }: WorkloadBarProps) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
        style={{ backgroundColor: member.avatarColor || '#3b82f6' }}
      >
        {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium truncate">{member.name}</p>
          <span className="text-xs text-muted-foreground">{member.activeTasks} tasks ({member.capacityPercent}%)</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <motion.div 
            className={`h-full ${member.isOverloaded ? 'bg-red-500' : 'bg-primary'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(member.capacityPercent, 100)}%` }}
            transition={{ duration: 0.5, delay }}
          />
        </div>
      </div>
    </div>
  );
}
