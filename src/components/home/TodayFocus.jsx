import TaskItem from "../TaskItem";
import EmptyState from "../EmptyState";

export default function TodayFocus({
  tasks,
  completed,
  progress,
  onToggleTask,
  onAddTask,
}) {
  return (
    <section className="card">
      <div className="card-title-row">
        <h3>Today's Focus</h3>

        <span className="link-muted">
          {completed}/{tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon="🌤️"
          title="Nothing scheduled for today"
          message="Add a task to start building today's momentum."
        />
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggleTask}
          />
        ))
      )}

      {tasks.length > 0 && (
        <div className="focus-progress-track">
          <div
            className="focus-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      )}

      <button
        className="btn-ghost add-task-btn"
        onClick={onAddTask}
      >
        + Add a task
      </button>
    </section>
  );
}