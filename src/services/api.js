import { supabase } from '../lib/supabase'
import { calculateLifeImpact } from '../lib/lifeEngine'

const DEFAULT_METRICS = {
  spiritual_score: 50,
  mental_score: 50,
  career_score: 50,
  fitness_score: 50,
  relationships_score: 50,
  finance_score: 50,
  overall_score: 50,
}

// A brand-new account has no life_metrics row yet. Rather than requiring a
// database trigger to exist before the app works, make sure a baseline row
// is present the first time it's needed. (The SQL in /supabase/schema.sql
// also creates this row on signup — this is just a safety net.)
export async function ensureLifeMetrics(userId) {
  const { data, error } = await supabase
    .from("life_metrics")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw error
  if (data) return data

  const { data: created, error: insertError } = await supabase
    .from("life_metrics")
    .insert({ user_id: userId, ...DEFAULT_METRICS })
    .select()
    .single()

  if (insertError) throw insertError

  return created
}

export async function updateTask(taskId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No authenticated user");
  }

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (fetchError) throw fetchError;

  const completed = !task.completed;

  const { data, error } = await supabase
    .from("tasks")
    .update({
      completed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function addTask(task) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw authError

  if (!user) {
    throw new Error("No authenticated user")
  }

  // Save task
  const { data: newTask, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: task.title,
      description: task.description || null,
      life_area: task.life_area,
      priority: task.priority || "medium",
      completed: false,
      due_date: task.due_date || null,
    })
    .select()
    .single()

  if (error) throw error

  // Calculate impact
  const impact = {
    spiritual: task.life_area === "spiritual" ? 4 : 0,
    mental: task.life_area === "mental" ? 4 : 0,
    career: task.life_area === "career" ? 4 : 0,
    fitness: task.life_area === "fitness" ? 4 : 0,
    relationships: task.life_area === "relationships" ? 4 : 0,
    finance: task.life_area === "finance" ? 4 : 0,
  }

  const totalImpact = Object.values(impact).reduce(
    (sum, value) => sum + value,
    0
  )

  // Timeline Event
  await supabase
    .from("life_events")
    .insert({
      user_id: user.id,
      event_type: "task_created",
      source_table: "tasks",
      source_id: newTask.id,
      life_area: task.life_area,
      impact_score: totalImpact,
      metadata: {
        title: task.title,
        priority: task.priority,
      },
    })

  // Update Dashboard Metrics
  await updateLifeMetrics(user.id, impact)

  return newTask
}

export async function addCheckIn(entry) {
  // Get the logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw authError

  if (!user) {
    throw new Error("No authenticated user")
  }

  // Build the payload
  const payload = {
    user_id: user.id,
    date: new Date().toISOString().split("T")[0],
    mood: entry.mood,
    mood_score: entry.mood_score,
    energy: entry.energy,
    stress: entry.stress,
    mind: entry.mind,
    gratitude: entry.gratitude,
  }

  // Save or update today's check-in
  const { data: checkIn, error } = await supabase
    .from("daily_checkins")
    .upsert(payload, {
      onConflict: "user_id,date",
    })
    .select()
    .single()

  if (error) throw error

  // Calculate Life Impact
  const impact = calculateLifeImpact(entry)

  // Calculate total impact
  const totalImpact = Object.values(impact).reduce(
    (total, value) => total + value,
    0
  )

  // Create Timeline Event
  const { error: eventError } = await supabase
    .from("life_events")
    .insert({
      user_id: user.id,
      event_type: "check_in",
      source_table: "daily_checkins",
      source_id: checkIn.id,
      life_area: "multiple",
      impact_score: totalImpact,
      metadata: {
        impact,
        mood: entry.mood_score,
        energy: entry.energy,
        stress: entry.stress,
        gratitude: entry.gratitude,
      },
    })

  if (eventError) {
    console.error("Life Event Error:", eventError)
  }

  // ⭐ Update dashboard metrics
  await updateLifeMetrics(user.id, impact)

  return checkIn
}
export async function updateLifeMetrics(userId, impact) {
  // Get (or create) the baseline metrics row for this user
  const metrics = await ensureLifeMetrics(userId)

  // Prevent scores from going below 0 or above 100
  const clamp = (value) => Math.max(0, Math.min(100, value))

  const updatedMetrics = {
    spiritual_score: clamp(metrics.spiritual_score + impact.spiritual),
    mental_score: clamp(metrics.mental_score + impact.mental),
    career_score: clamp(metrics.career_score + impact.career),
    fitness_score: clamp(metrics.fitness_score + impact.fitness),
    relationships_score: clamp(
      metrics.relationships_score + impact.relationships
    ),
    finance_score: clamp(metrics.finance_score + impact.finance),

    updated_at: new Date().toISOString(),
  }

  // Calculate the overall score
  updatedMetrics.overall_score = Math.round(
    (
      updatedMetrics.spiritual_score +
      updatedMetrics.mental_score +
      updatedMetrics.career_score +
      updatedMetrics.fitness_score +
      updatedMetrics.relationships_score +
      updatedMetrics.finance_score
    ) / 6
  )

  // Save the updated metrics
  const { error: updateError } = await supabase
    .from("life_metrics")
    .update(updatedMetrics)
    .eq("user_id", userId)

  if (updateError) throw updateError

  return updatedMetrics
}

export async function addJournalEntry(entry) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw authError

  if (!user) {
    throw new Error("No authenticated user")
  }

  // Save journal
  const { data: journal, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: user.id,
      title: entry.title,
      content: entry.content,
      mood_score: entry.mood_score,
      life_area: entry.life_area,
    })
    .select()
    .single()

  if (error) throw error

  // Calculate impact
  const impact = calculateLifeImpact({
    mood_score: entry.mood_score,
    energy: 50,
    stress: 50,
  })

  const totalImpact = Object.values(impact).reduce(
    (sum, value) => sum + value,
    0
  )

  // Timeline
  await supabase
    .from("life_events")
    .insert({
      user_id: user.id,
      event_type: "journal",
      source_table: "journal_entries",
      source_id: journal.id,
      life_area: entry.life_area,
      impact_score: totalImpact,
      metadata: {
        title: entry.title,
        mood: entry.mood_score,
      },
    })

  await updateLifeMetrics(user.id, impact)

  return journal
}

export async function getDashboardMetrics() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("No authenticated user")

  const { data, error } = await supabase
    .from("life_metrics")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) throw error

  return data
}

export async function getRecentLifeEvents(limit = 20) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("No authenticated user")

  const { data, error } = await supabase
    .from("life_events")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error

  return data

}

  export async function addGoal(goal) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw authError

  if (!user) {
    throw new Error("No authenticated user")
  }

  const { data: newGoal, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      title: goal.title,
      description: goal.description,
      life_area: goal.life_area,
      priority: goal.priority,
      target_date: goal.target_date,
    })
    .select()
    .single()

  if (error) throw error

  // Reward the user slightly for setting a goal
  const impact = {
    spiritual: goal.life_area === "spiritual" ? 3 : 0,
    mental: goal.life_area === "mental" ? 3 : 0,
    fitness: goal.life_area === "fitness" ? 3 : 0,
    career: goal.life_area === "career" ? 3 : 0,
    finance: goal.life_area === "finance" ? 3 : 0,
    relationships: goal.life_area === "relationships" ? 3 : 0,
  }

  const totalImpact = Object.values(impact).reduce((a, b) => a + b, 0)

  await supabase
    .from("life_events")
    .insert({
      user_id: user.id,
      event_type: "goal_created",
      source_table: "goals",
      source_id: newGoal.id,
      life_area: goal.life_area,
      impact_score: totalImpact,
      metadata: {
        title: goal.title,
        priority: goal.priority,
      },
    })

  await updateLifeMetrics(user.id, impact)

  return newGoal
}


export async function updateGoal(goalId, patch) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: goal, error } = await supabase
    .from("goals")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .select()
    .single()

  if (error) throw error

  // Reward completion
  if (patch.progress === 100 || patch.status === "Completed") {
    const impact = {
      spiritual: goal.life_area === "spiritual" ? 10 : 0,
      mental: goal.life_area === "mental" ? 10 : 0,
      fitness: goal.life_area === "fitness" ? 10 : 0,
      career: goal.life_area === "career" ? 10 : 0,
      finance: goal.life_area === "finance" ? 10 : 0,
      relationships: goal.life_area === "relationships" ? 10 : 0,
    }

    const totalImpact = Object.values(impact).reduce((a, b) => a + b, 0)

    await supabase
      .from("life_events")
      .insert({
        user_id: user.id,
        event_type: "goal_completed",
        source_table: "goals",
        source_id: goal.id,
        life_area: goal.life_area,
        impact_score: totalImpact,
        metadata: {
          title: goal.title,
        },
      })

    await updateLifeMetrics(user.id, impact)
  }

  return goal
}

export async function addHabit(habit) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw authError

  if (!user) throw new Error("No authenticated user")

  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: user.id,
      name: habit.name,
      description: habit.description,
      life_area: habit.life_area,
      frequency: habit.frequency,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function loadHabits() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at")

  if (error) throw error

  return data
}

export async function completeHabit(habit) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw authError

  if (!user) throw new Error("No authenticated user")

  // Prevent duplicate completions for the same day
  const { data: log, error } = await supabase
    .from("habit_logs")
    .upsert(
      {
        habit_id: habit.id,
        user_id: user.id,
        completed_on: new Date().toISOString().split("T")[0],
      },
      {
        onConflict: "habit_id,completed_on",
      }
    )
    .select()
    .single()

  if (error) throw error

  // Calculate impact
  const impact = {
    spiritual: 0,
    mental: 0,
    career: 0,
    finance: 0,
    fitness: 0,
    relationships: 0,
  }

  impact[habit.life_area] = 5

  const totalImpact = Object.values(impact).reduce(
    (sum, value) => sum + value,
    0
  )

  // Timeline
  await supabase.from("life_events").insert({
    user_id: user.id,
    event_type: "habit_completed",
    source_table: "habit_logs",
    source_id: log.id,
    life_area: habit.life_area,
    impact_score: totalImpact,
    metadata: {
      habit: habit.name,
    },
  })

  // Update dashboard metrics
  await updateLifeMetrics(user.id, impact)

  return log
}

export async function deleteHabit(habitId) {
  const { error } = await supabase
    .from("habits")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", habitId)

  if (error) throw error
}


export async function editTask(taskId, patch) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId)

  if (error) throw error
}

export async function deleteGoal(goalId) {
  const { error } = await supabase.from("goals").delete().eq("id", goalId)

  if (error) throw error
}

export async function deleteJournalEntry(entryId) {
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", entryId)

  if (error) throw error
}
