import "./RecentActivity.css";

const EVENT_CONFIG = {
  check_in: {
    icon: "😊",
    title: "Daily Check-In",
  },
  journal: {
    icon: "📝",
    title: "Journal Entry",
  },
  goal_created: {
    icon: "🎯",
    title: "Goal Created",
  },
  goal_completed: {
    icon: "🏆",
    title: "Goal Completed",
  },
  habit_completed: {
    icon: "🔥",
    title: "Habit Completed",
  },
  task_created: {
    icon: "✅",
    title: "Task Created",
  },
};

function formatTime(date) {
  const created = new Date(date);
  const now = new Date();

  const diff = Math.floor((now - created) / 1000);

  if (diff < 60) return "Just now";

  if (diff < 3600)
    return `${Math.floor(diff / 60)} min ago`;

  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hr ago`;

  return `${Math.floor(diff / 86400)} day${
    Math.floor(diff / 86400) > 1 ? "s" : ""
  } ago`;
}

export default function RecentActivity({ events = [] }) {
  if (!events.length) {
    return (
      <section className="recent-activity">
        <h2>Recent Activity</h2>

        <div className="activity-empty">
          Nothing yet.

          <span>
            Your check-ins, habits and goals will appear here.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="recent-activity">
      <div className="activity-header">
        <h2>Recent Activity</h2>
      </div>

      <div className="activity-list">
        {events.slice(0, 5).map((event) => {
          const config =
            EVENT_CONFIG[event.event_type] || {
              icon: "✨",
              title: event.event_type,
            };

          return (
            <div
              className="activity-card"
              key={event.id}
            >
              <div className="activity-icon">
                {config.icon}
              </div>

              <div className="activity-info">
                <h4>{config.title}</h4>

                <p>{formatTime(event.created_at)}</p>
              </div>

              <div
                className={`impact ${
                  event.impact_score >= 0
                    ? "positive"
                    : "negative"
                }`}
              >
                {event.impact_score >= 0 ? "+" : ""}
                {event.impact_score}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}