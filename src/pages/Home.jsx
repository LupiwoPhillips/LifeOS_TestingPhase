import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

import LifeScoreRing from "../components/LifeScoreRing";
import LifeAreaBar from "../components/LifeAreaBar";
import StreakChip from "../components/StreakChip";
import TaskItem from "../components/TaskItem";
import SmartNudgeCard from "../components/SmartNudgeCard";
import QuickActionCard from "../components/QuickActionCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { FormField, TextInput, Select } from "../components/FormField";

import "./Home.css";

const LIFE_AREA_OPTIONS = [
  { id: "spiritual", label: "Spiritual" },
  { id: "mental", label: "Mental" },
  { id: "career", label: "Career" },
  { id: "fitness", label: "Fitness" },
  { id: "relationships", label: "Relationships" },
  { id: "finance", label: "Finance" },
];

export default function Home() {
  const {
    state,
    metrics,
    events,
    nudges,
    headline,
    toggleTask,
    addTask,
    lifeAreas,
    error,
  } = useAppData();

  const navigate = useNavigate();
  const { user } = useAuth();
  const showToast = useToast();

  const [notifOpen, setNotifOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", life_area: "career", priority: "medium" });
  const [savingTask, setSavingTask] = useState(false);

  if (!state || !metrics) {
    return (
      <div className="page">
        <HomeSkeleton />
      </div>
    );
  }

  const todayTasks = state.tasks.filter((task) => isToday(task.due_date));
  const completed = todayTasks.filter((task) => task.completed).length;
  const progressPct = todayTasks.length
    ? Math.round((completed / todayTasks.length) * 100)
    : 0;

  const topNudge = nudges[0];

  const handleResolveNudge = (nudge) => {
    toggleTask(nudge.taskId);
    showToast("Nice work — marked as done.", "success");
  };

  const areas = lifeAreas.length
    ? lifeAreas.map((a) => ({ ...a, color: `var(--color-${a.id})` }))
    : [];

  async function handleAddTask(e) {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    try {
      setSavingTask(true);
      await addTask({
        title: taskForm.title.trim(),
        life_area: taskForm.life_area,
        priority: taskForm.priority,
        due_date: new Date().toISOString().slice(0, 10),
      });
      setTaskForm({ title: "", life_area: "career", priority: "medium" });
      setTaskModalOpen(false);
      showToast("Task added to today.", "success");
    } catch (err) {
      showToast(err.message || "Couldn't add that task.", "error");
    } finally {
      setSavingTask(false);
    }
  }

  return (
    <div className="page home-page">
      <header className="home-header">
        <div>
          <p className="home-greeting">
            {greeting()}, {user?.user_metadata?.full_name?.split(" ")[0] || "Friend"} 👋
          </p>
          <p className="home-date">{formatToday()}</p>
        </div>

        <div className="notif-wrap">
          <button
            className="bell-btn"
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              />
              <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {nudges.length > 0 && <span className="bell-badge">{nudges.length}</span>}
          </button>

          {notifOpen && (
            <>
              <div className="notif-scrim" onClick={() => setNotifOpen(false)} />
              <div className="notif-panel fade-in">
                <div className="notif-panel-title">Nudges</div>
                {nudges.length === 0 ? (
                  <p className="notif-empty">You're all caught up. Nothing needs your attention.</p>
                ) : (
                  <div className="notif-list">
                    {nudges.slice(0, 6).map((n) => (
                      <div key={n.id} className="notif-item">
                        <p>{n.message}</p>
                        <button
                          className="btn-ghost"
                          onClick={() => {
                            toggleTask(n.taskId);
                            setNotifOpen(false);
                            showToast("Nice work — marked as done.", "success");
                          }}
                        >
                          {n.actionLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <p className="home-subline">{headline?.message}</p>

      {topNudge && (
        <SmartNudgeCard nudge={topNudge} onResolve={handleResolveNudge} onSnooze={() => setNotifOpen(true)} />
      )}

      <section className="card score-card">
        <LifeScoreRing score={metrics.overall_score} />
        <div className="score-text">
          <span className="score-label">Life Score</span>
          <span className="score-value">{metrics.overall_score}%</span>
          <span className="score-hint">
            Last updated {metrics.updated_at ? new Date(metrics.updated_at).toLocaleDateString() : "just now"}
          </span>
        </div>
      </section>

      <section className="card">
        <div className="card-title-row">
          <h3>Today's Focus</h3>
          <span className="link-muted">{completed}/{todayTasks.length}</span>
        </div>

        {todayTasks.length === 0 ? (
          <EmptyState
            icon="🌤️"
            title="Nothing scheduled for today"
            message="Add a task to start building today's momentum."
          />
        ) : (
          todayTasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))
        )}

        {todayTasks.length > 0 && (
          <div className="focus-progress-track">
            <div className="focus-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        )}

        <button className="btn-ghost add-task-btn" onClick={() => setTaskModalOpen(true)}>
          + Add a task
        </button>
      </section>

      <section className="quick-actions-grid">
        <QuickActionCard icon="✅" label="Check-In" sublabel="Daily check-in" to="/check-in" color="var(--color-info)" />
        <QuickActionCard icon="📝" label="Journal" sublabel="Write your thoughts" to="/journal" color="var(--color-fitness)" />
        <QuickActionCard icon="🎯" label="Goals" sublabel="Track your goals" to="/goals" color="var(--color-warning)" />
        <QuickActionCard icon="📊" label="Insights" sublabel="Your trends" to="/insights" color="var(--color-career)" />
        <QuickActionCard icon="🔥" label="Habits" sublabel="Build consistency" to="/habits" color="var(--color-spiritual)" />
        <QuickActionCard icon="🏆" label="Streaks" sublabel="Keep the fire going" to="/streaks" color="var(--color-relationships)" />
      </section>

      <section className="card">
        <div className="card-title-row">
          <h3>Life Areas</h3>
          <button className="link-muted" onClick={() => navigate("/insights")}>View all</button>
        </div>
        {areas.map((area) => (
          <LifeAreaBar key={area.id} area={area} />
        ))}
      </section>

      <section className="card">
        <div className="card-title-row">
          <h3>Current Streaks</h3>
          <button className="link-muted" onClick={() => navigate("/streaks")}>View all</button>
        </div>
        {state.streaks.filter((s) => s.days > 0).length === 0 ? (
          <EmptyState icon="🔥" title="No active streaks yet" message="Check in, journal, or complete a habit to start one." />
        ) : (
          state.streaks
            .filter((s) => s.days > 0)
            .sort((a, b) => b.days - a.days)
            .slice(0, 5)
            .map((streak) => <StreakChip key={streak.id} streak={streak} />)
        )}
      </section>

      <section className="card">
        <div className="card-title-row">
          <h3>Recent Activity</h3>
        </div>

        {events?.length ? (
          events.slice(0, 8).map((event) => (
            <div key={event.id} className="activity-item">
              <strong>{event.event_type.replaceAll("_", " ")}</strong>
              <p>{formatLifeArea(event.life_area)} • Impact +{event.impact_score}</p>
              <small>{new Date(event.created_at).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <EmptyState icon="🗒️" title="No activity yet" message="Everything you do in Life OS shows up here." />
        )}
      </section>

      <Modal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="New Task">
        <form className="modal-form" onSubmit={handleAddTask}>
          <FormField label="What do you need to do?">
            <TextInput
              autoFocus
              placeholder="e.g. Finish the Q3 report"
              value={taskForm.title}
              onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
            />
          </FormField>

          <FormField label="Life area">
            <Select
              value={taskForm.life_area}
              onChange={(e) => setTaskForm((f) => ({ ...f, life_area: e.target.value }))}
            >
              {LIFE_AREA_OPTIONS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Priority">
            <Select
              value={taskForm.priority}
              onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormField>

          <button className="btn-primary" type="submit" disabled={savingTask || !taskForm.title.trim()}>
            {savingTask ? "Adding…" : "Add Task"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="home-skeleton">
      <div className="skeleton" style={{ height: 44, width: "70%", borderRadius: 12 }} />
      <div className="skeleton" style={{ height: 96, borderRadius: 24 }} />
      <div className="skeleton" style={{ height: 140, borderRadius: 24 }} />
      <div className="skeleton" style={{ height: 140, borderRadius: 24 }} />
    </div>
  );
}

function isToday(date) {
  return date === new Date().toISOString().slice(0, 10);
}

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function formatLifeArea(area) {
  if (!area || area === "multiple") return "Multiple areas";
  return area.charAt(0).toUpperCase() + area.slice(1);
}
