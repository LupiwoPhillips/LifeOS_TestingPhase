// smartReminder.js
// ---------------------------------------------------------------------------
// Generic habit trackers show a red badge when you miss something. Life OS
// is meant to behave more like a person who knows you: when a task is
// missed, it looks at what YOU have written and done before, and writes a
// short, specific message back to you — instead of a generic push notice.
//
// This file is intentionally framework-free (no React) so it can be:
//   1. Used as-is on the client for an instant, offline-friendly nudge, and
//   2. Later swapped for a call to a backend endpoint (e.g. POST
//      /api/nudges/generate) that runs the same inputs through an LLM for a
//      richer, less templated message. Keep the input/output shape the same
//      and the rest of the app never has to change.
//
// Field names here match the real Supabase rows the app loads:
//   task:  { id, title, due_date, completed, life_area }
//   goal:  { id, title, progress, life_area }
//   streak:{ id, title, days, life_area }
//   journalEntry: { id, title, content, life_area, created_at }
//   lifeArea (ctx): { id, name, score }
// ---------------------------------------------------------------------------

const DAY_MS = 1000 * 60 * 60 * 24

function daysBetween(dateA, dateB = todayISO()) {
  if (!dateA) return -Infinity
  const a = new Date(dateA)
  const b = new Date(dateB)
  return Math.round((b - a) / DAY_MS)
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Find the most relevant journal line for a given life area — a sentence the
 * user themselves wrote that we can reflect back to them. This is what makes
 * the message feel personal instead of generic.
 */
function findRelevantJournalLine(area, journalEntries = []) {
  const sameArea = journalEntries.find(
    (entry) => entry.life_area && entry.life_area.toLowerCase() === area
  )
  if (sameArea) {
    return { text: truncate(sameArea.content, 90), date: sameArea.created_at }
  }

  const areaKeywords = {
    spiritual: ['pray', 'faith', 'god', 'gratitude', 'grateful'],
    fitness: ['gym', 'workout', 'run', 'train', 'exercise'],
    career: ['work', 'project', 'dashboard', 'job', 'focus'],
    mental: ['journal', 'mind', 'calm', 'anxious', 'rest', 'sleep'],
    relationships: ['friend', 'family', 'mom', 'dad', 'partner', 'people'],
    finance: ['budget', 'money', 'save', 'spend', 'finance'],
  }
  const keywords = areaKeywords[area] || []

  for (const entry of journalEntries) {
    const haystack = `${entry.title || ''} ${entry.content || ''}`.toLowerCase()
    if (keywords.some((k) => haystack.includes(k))) {
      return { text: truncate(entry.content, 90), date: entry.created_at }
    }
  }
  return null
}

function truncate(text, max) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max).trim()}…` : text
}

/**
 * Build one nudge for a single missed task.
 * `severity` escalates with how many days it's been missed, so the tone
 * shifts from a light nudge to a more direct, reflective one — never
 * guilt-tripping, always pointing back at the user's own stated intentions.
 */
function buildNudgeForTask(task, ctx) {
  const missedDays = daysBetween(task.due_date)
  const area = ctx.lifeAreas.find((a) => a.id === task.life_area)
  const relatedStreak = ctx.streaks.find((s) => s.life_area === task.life_area)
  const journalLine = findRelevantJournalLine(task.life_area, ctx.journalEntries)

  const severity = missedDays >= 3 ? 'firm' : missedDays >= 1 ? 'gentle' : 'today'

  let message
  let actionLabel = `Finish "${task.title}"`

  if (severity === 'today') {
    message = `"${task.title}" is still open today. You've got time — want to knock it out now?`
  } else if (severity === 'gentle') {
    if (journalLine) {
      message = `You wrote on ${formatShortDate(journalLine.date)}: "${journalLine.text}" — "${task.title}" from ${formatShortDate(task.due_date)} is still open. One small step keeps that going.`
    } else if (relatedStreak) {
      message = `Your ${relatedStreak.title.toLowerCase()} streak is at ${relatedStreak.days} days. "${task.title}" slipped on ${formatShortDate(task.due_date)} — don't let it cost you the streak.`
    } else if (area) {
      message = `${area.name} is at ${area.score}% this week. "${task.title}" is still waiting from ${formatShortDate(task.due_date)} — a few minutes now keeps it moving.`
    } else {
      message = `"${task.title}" has been open since ${formatShortDate(task.due_date)}. Still worth doing today.`
    }
  } else {
    // firm — several days missed, be direct but not harsh, and point back at their own words/goals
    const goal = ctx.goals.find((g) => g.life_area === task.life_area)
    if (goal) {
      message = `"${task.title}" has been sitting for ${missedDays} days. It connects to "${goal.title}" (${goal.progress ?? 0}% there) — is this still something you want, or should we adjust the plan?`
    } else if (journalLine) {
      message = `${missedDays} days ago you missed "${task.title}". You once wrote: "${journalLine.text}" — worth asking what's getting in the way.`
    } else {
      message = `"${task.title}" has been open for ${missedDays} days. No judgment — but let's either do it now or move it so it stops sitting there.`
    }
    actionLabel = `Handle "${task.title}"`
  }

  return {
    id: `nudge_${task.id}`,
    taskId: task.id,
    area: task.life_area,
    severity,
    missedDays,
    message,
    actionLabel,
  }
}

function formatShortDate(iso) {
  if (!iso) return 'earlier'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Main entry point. Returns nudges for every missed (past-due, not
 * completed) task, most urgent first.
 * `ctx` = { lifeAreas, streaks, journalEntries, goals }
 */
export function generateNudges(tasks = [], ctx) {
  const missed = tasks.filter(
    (t) => !t.completed && t.due_date && t.due_date < todayISO()
  )
  return missed
    .map((task) => buildNudgeForTask(task, ctx))
    .sort((a, b) => b.missedDays - a.missedDays)
}

/**
 * A single top-of-home headline nudge — the most urgent one, or a
 * congratulatory message if nothing is missed. This is the message shown
 * on the Home screen.
 */
export function generateHeadlineMessage(tasks = [], ctx) {
  const nudges = generateNudges(tasks, ctx)
  if (nudges.length === 0) {
    return {
      tone: 'positive',
      message: 'Everything on your plate is handled. This is what consistency looks like.',
    }
  }
  const top = nudges[0]
  return { tone: top.severity === 'firm' ? 'firm' : 'gentle', message: top.message, nudge: top }
}
