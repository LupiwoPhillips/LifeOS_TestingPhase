// lifeScore.js
// Small pure helpers around the six life-area scores. These operate on the
// real row shapes returned by Supabase (tasks.completed, checkIns.mood, …).

export function computeLifeScore(lifeAreas = []) {
  if (!lifeAreas.length) return 0
  const total = lifeAreas.reduce((sum, a) => sum + (a.score || 0), 0)
  return Math.round(total / lifeAreas.length)
}

export function computeWeeklyDelta(checkIns = []) {
  if (checkIns.length < 2) return 0
  const sorted = [...checkIns].sort((a, b) => new Date(a.date) - new Date(b.date))
  const last = sorted[sorted.length - 1].mood ?? 0
  const first = sorted[0].mood ?? 0
  return Math.round(last - first)
}

export function completionRate(tasks = []) {
  if (!tasks.length) return 0
  const done = tasks.filter((t) => t.completed).length
  return Math.round((done / tasks.length) * 100)
}

export function habitCompletionRate(habits = [], habitLogs = []) {
  if (!habits.length) return 0
  const today = new Date().toISOString().slice(0, 10)
  const doneToday = habitLogs.filter((log) => log.completed_on === today).length
  return Math.round((doneToday / habits.length) * 100)
}

// ---------------------------------------------------------------------
// Score trend + "why did it change" — built entirely from life_events,
// so no schema change / history table is required.
// ---------------------------------------------------------------------

const EVENT_LABELS = {
  check_in: "your daily check-in",
  task_created: "adding a new task",
  journal: "your journal entry",
  goal_created: "creating a new goal",
  goal_completed: "completing a goal",
  habit_completed: "completing a habit",
}

// Score right before the most recent event, so the UI can show "was X, now Y".
export function computePreviousScore(metrics, events = []) {
  if (!metrics) return null
  const latest = events[0]
  if (!latest) return null
  return Math.max(0, Math.min(100, metrics.overall_score - (latest.impact_score ?? 0)))
}

// Sum of impact over the last N days, for "+2 this week" / "-3 this month".
export function computeScoreTrend(events = [], days) {
  if (!events.length) return 0
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return events
    .filter((e) => new Date(e.created_at).getTime() >= cutoff)
    .reduce((sum, e) => sum + (e.impact_score ?? 0), 0)
}

// Human-readable explanation of the most recent score-moving event(s).
export function describeScoreChange(events = []) {
  const recent = events.filter((e) => (e.impact_score ?? 0) !== 0).slice(0, 3)
  if (!recent.length) return null

  const labels = [...new Set(recent.map((e) => EVENT_LABELS[e.event_type] || "recent activity"))]
  const direction = recent[0].impact_score > 0 ? "increased" : "decreased"

  if (labels.length === 1) {
    return `Your Life Score ${direction} because of ${labels[0]}.`
  }
  const last = labels.pop()
  return `Your Life Score ${direction} because of ${labels.join(", ")} and ${last}.`
}
