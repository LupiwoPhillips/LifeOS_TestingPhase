import { supabase } from "../lib/supabase";
import { loadHabits, ensureLifeMetrics } from "./api";
import { loadStreaks } from "./streakService";

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  if (!user) {
    throw new Error("No authenticated user");
  }

  return user;
}

export async function loadDashboard() {
  const user = await getCurrentUser();

  const [
    { data: tasks, error: tasksError },
    { data: goals, error: goalsError },
    { data: journalEntries, error: journalError },
    { data: checkIns, error: checkInError },
    metrics,
    { data: events, error: eventsError },
    habits,
    streaks,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),

    ensureLifeMetrics(user.id),

    supabase
      .from("life_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),

    loadHabits(),

    loadStreaks(),
  ]);

  if (tasksError) throw tasksError;
  if (goalsError) throw goalsError;
  if (journalError) throw journalError;
  if (checkInError) throw checkInError;
  if (eventsError) throw eventsError;

  return {
    tasks: tasks ?? [],
    goals: goals ?? [],
    journalEntries: journalEntries ?? [],
    checkIns: checkIns ?? [],
    habits: habits ?? [],
    streaks: streaks ?? [],
    metrics,
    events: events ?? [],
  };
}