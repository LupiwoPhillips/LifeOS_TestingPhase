import React from "react";
import "./TaskItem.css";

export default function TaskItem({ task, onToggle }) {

  const completed = task.completed ?? false;

  return (
    <div className={`task-item ${completed ? "done" : ""}`}>
      <div
        className="task-icon"
        style={task.life_area ? { background: `color-mix(in srgb, var(--color-${task.life_area}) 22%, transparent)` } : undefined}
      >
        {task.icon || "📌"}
      </div>

      <div className="task-main">
        <span className="task-title">
          {task.title}
        </span>

        {task.due_date && (
          <span className="task-time">
            {formatDueDate(task.due_date)}
          </span>
        )}
      </div>

      <button
        className={`task-check ${
          completed ? "checked" : ""
        }`}
        onClick={() => onToggle(task.id)}
        aria-label={completed ? "Mark as not done" : "Mark as done"}
      >
        {completed && (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M5 12.5L9.5 17L19 7"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

function formatDueDate(iso) {
  const today = new Date().toISOString().slice(0, 10);
  if (iso === today) return "Today";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}