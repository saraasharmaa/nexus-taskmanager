interface ActivityFeedProps {
  activities: any[];
  limit?: number;
}

export function ActivityFeed({ activities = [], limit = 5 }: ActivityFeedProps) {
  const displayableActivities = activities.slice(0, limit);

  return (
    <div className="space-y-4">
      {displayableActivities.length > 0 ? (
        displayableActivities.map((activity, i) => (
          <div key={activity.id || i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-medium">
              {activity.userName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">{activity.userName || 'User'}</span>{' '}
                <span className="text-muted-foreground">{activity.action || 'performed an action'}</span>
              </p>
              {activity.createdAt && (
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No recent activity
        </p>
      )}
    </div>
  );
}
