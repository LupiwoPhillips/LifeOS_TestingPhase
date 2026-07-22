export function buildAnalytics({
  tasks = [],
  goals = [],
  habits = [],
  habitLogs = [],
  journalEntries = [],
  checkIns = [],
  metrics = null,
}) {
  const today = new Date().toISOString().slice(0, 10)

  const completedTasks = tasks.filter((task) => task.completed)
  const completedGoals = goals.filter(
    (goal) =>
      goal.status === "Completed" ||
      goal.progress === 100
  )

  const todayHabits = habitLogs.filter(
    (log) => log.completed_on === today
  )

  const latestCheckIn =
    checkIns.length > 0
      ? [...checkIns].sort(
          (a, b) =>
            new Date(b.date) - new Date(a.date)
        )[0]
      : null

  const strongestArea = metrics
    ? [
        {
          name: "Spiritual",
          value: metrics.spiritual_score,
        },
        {
          name: "Mental",
          value: metrics.mental_score,
        },
        {
          name: "Career",
          value: metrics.career_score,
        },
        {
          name: "Fitness",
          value: metrics.fitness_score,
        },
        {
          name: "Relationships",
          value: metrics.relationships_score,
        },
        {
          name: "Finance",
          value: metrics.finance_score,
        },
      ].sort((a, b) => b.value - a.value)[0]
    : null

  const weakestArea = metrics
    ? [
        {
          name: "Spiritual",
          value: metrics.spiritual_score,
        },
        {
          name: "Mental",
          value: metrics.mental_score,
        },
        {
          name: "Career",
          value: metrics.career_score,
        },
        {
          name: "Fitness",
          value: metrics.fitness_score,
        },
        {
          name: "Relationships",
          value: metrics.relationships_score,
        },
        {
          name: "Finance",
          value: metrics.finance_score,
        },
      ].sort((a, b) => a.value - b.value)[0]
    : null

  return {
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,

    totalGoals: goals.length,
    completedGoals: completedGoals.length,

    totalHabits: habits.length,
    completedHabitsToday: todayHabits.length,

    journalCount: journalEntries.length,

    totalCheckIns: checkIns.length,

    latestCheckIn,

    strongestArea,

    weakestArea,

    overallScore: metrics?.overall_score ?? 0,
  }
}