export function ProjectHealthRow({ project }: { project: { id: string; name: string; overdue: number; daysLeft: number; progress: number; healthScore: number } }) {
  return (
    <div className="rounded-xl border p-4">
      <h2 className="font-semibold">{project.name}</h2>
      <p className="text-sm text-gray-500">
        Health Score: {project.healthScore} | Progress: {project.progress}% | Days Left: {project.daysLeft} | Overdue: {project.overdue}
      </p>
    </div>
  );
}
