// src/lib/insightEngine.js

export function findStrongestArea(metrics) {
  const areas = [
    { key: "mental_score", label: "Mental" },
    { key: "spiritual_score", label: "Spiritual" },
    { key: "career_score", label: "Career" },
    { key: "fitness_score", label: "Fitness" },
    { key: "relationships_score", label: "Relationships" },
    { key: "finance_score", label: "Finance" },
  ]

  return areas.reduce((best, current) =>
    metrics[current.key] > metrics[best.key] ? current : best
  )
}

export function findWeakestArea(metrics) {
  const areas = [
    { key: "mental_score", label: "Mental" },
    { key: "spiritual_score", label: "Spiritual" },
    { key: "career_score", label: "Career" },
    { key: "fitness_score", label: "Fitness" },
    { key: "relationships_score", label: "Relationships" },
    { key: "finance_score", label: "Finance" },
  ]

  return areas.reduce((lowest, current) =>
    metrics[current.key] < metrics[lowest.key] ? current : lowest
  )
}

export function calculateTrend(events = []) {
  if (!events.length) return "No activity yet."

  const totalImpact = events.reduce(
    (sum, event) => sum + (event.impact_score || 0),
    0
  )

  if (totalImpact >= 100)
    return "You're making excellent progress."

  if (totalImpact >= 50)
    return "You're building good momentum."

  if (totalImpact >= 20)
    return "Small wins are adding up."

  return "Try completing a few habits or check-ins today."
}

export function generateRecommendation(metrics) {
  const weakest = findWeakestArea(metrics)

  const recommendations = {
    Mental:
      "Write a journal entry or take a short break to reset your mind.",

    Spiritual:
      "Spend a few minutes praying, meditating or reading scripture.",

    Career:
      "Complete one career-related task today.",

    Fitness:
      "Go for a walk or complete a short workout.",

    Relationships:
      "Reach out to someone you care about today.",

    Finance:
      "Review your spending or save a small amount today.",
  }

  return recommendations[weakest.label]
}

export function generateInsights(metrics, events = []) {
  if (!metrics) return []

  const strongest = findStrongestArea(metrics)

  const weakest = findWeakestArea(metrics)

  return [
    {
      type: "strength",
      title: `${strongest.label} is your strongest life area.`,
      value: metrics[strongest.key],
    },

    {
      type: "warning",
      title: `${weakest.label} needs more attention.`,
      value: metrics[weakest.key],
    },

    {
      type: "trend",
      title: calculateTrend(events),
    },

    {
      type: "coach",
      title: generateRecommendation(metrics),
    },
  ]
}