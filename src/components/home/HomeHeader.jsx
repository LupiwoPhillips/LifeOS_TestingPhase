import { useState } from "react";

export default function HomeHeader({
  user,
  nudges,
  greeting,
  today,
  onToggleTask,
  showToast,
}) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="home-header">
      <div>
        <p className="home-greeting">
          {greeting},{" "}
          {user?.user_metadata?.full_name?.split(" ")[0] || "Friend"} 👋
        </p>

        <p className="home-date">{today}</p>
      </div>

      <div className="notif-wrap">
        <button
          className="bell-btn"
          onClick={() => setNotifOpen(!notifOpen)}
          aria-label="Notifications"
        >
          🔔

          {nudges.length > 0 && (
            <span className="bell-badge">
              {nudges.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div
              className="notif-scrim"
              onClick={() => setNotifOpen(false)}
            />

            <div className="notif-panel fade-in">
              <div className="notif-panel-title">
                Smart Nudges
              </div>

              {nudges.length === 0 ? (
                <p className="notif-empty">
                  You're all caught up.
                </p>
              ) : (
                nudges.slice(0, 6).map((nudge) => (
                  <div
                    key={nudge.id}
                    className="notif-item"
                  >
                    <p>{nudge.message}</p>

                    <button
                      className="btn-ghost"
                      onClick={() => {
                        onToggleTask(nudge.taskId);
                        setNotifOpen(false);

                        showToast(
                          "Nice work — marked as done.",
                          "success"
                        );
                      }}
                    >
                      {nudge.actionLabel}
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}