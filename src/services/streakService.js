import { supabase } from "../lib/supabase";

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("No authenticated user");

  return user;
}

function calculateCurrentStreak(dates) {
  if (!dates.length) return 0;

  const uniqueDates = [...new Set(dates)].sort(
    (a, b) => new Date(b) - new Date(a)
  );

  let streak = 0;

  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDates.length; i++) {
    const date = new Date(uniqueDates[i]);
    date.setHours(0, 0, 0, 0);

    const diff =
      (current.getTime() - date.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff === 0 || diff === 1) {
      streak++;
      current = date;
    } else {
      break;
    }
  }

  return streak;
}

export async function loadStreaks() {
  const user = await getCurrentUser();

  const [
    { data: checkIns },
    { data: journals },
    { data: habits },
    { data: habitLogs },
    { data: tasks },
  ] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("date")
      .eq("user_id", user.id),

    supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", user.id),

    supabase
      .from("habits")
      .select("id,name,life_area")
      .eq("user_id", user.id)
      .eq("is_active", true),

    supabase
      .from("habit_logs")
      .select("habit_id,completed_on")
      .eq("user_id", user.id),

    supabase
      .from("tasks")
      .select("completed,updated_at")
      .eq("user_id", user.id),
  ]);

  const streaks = [];

  // Daily Check-In
  streaks.push({
    id: "checkin",
    title: "Daily Check-In",
    emoji: "✅",
    life_area: null,
    days: calculateCurrentStreak(
      (checkIns || []).map((c) => c.date)
    ),
  });

  // Journal
  streaks.push({
    id: "journal",
    title: "Journal",
    emoji: "📝",
    life_area: "mental",
    days: calculateCurrentStreak(
      (journals || []).map(
        (j) => j.created_at.split("T")[0]
      )
    ),
  });

  // Habits
  (habits || []).forEach((habit) => {
    const logs = (habitLogs || [])
      .filter((log) => log.habit_id === habit.id)
      .map((log) => log.completed_on);

    streaks.push({
      id: habit.id,
      title: habit.name,
      emoji: "🔥",
      life_area: habit.life_area || null,
      days: calculateCurrentStreak(logs),
    });
  });

  // Tasks
  const completedTaskDates = (tasks || [])
    .filter((t) => t.completed && t.updated_at)
    .map((t) => t.updated_at.split("T")[0]);

  streaks.push({
    id: "tasks",
    title: "Tasks",
    emoji: "🎯",
    life_area: null,
    days: calculateCurrentStreak(completedTaskDates),
  });

  return streaks;
}