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
