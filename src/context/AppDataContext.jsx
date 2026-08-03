import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as api from "../services/api";
import { loadDashboard } from "../services/dashboardService";
import { buildAnalytics } from "../services/analyticsService";
import { supabase } from "../lib/supabase";

import {
  generateHeadlineMessage,
  generateNudges,
} from "../lib/smartReminder";

const AppDataContext = createContext(null);

const LIFE_AREA_META = [
  { id: "spiritual", name: "Spiritual" },
  { id: "mental", name: "Mental" },
  { id: "career", name: "Career" },
  { id: "fitness", name: "Fitness" },
  { id: "relationships", name: "Relationships" },
  { id: "finance", name: "Finance" },
];

export function AppDataProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [state, setState] = useState({
    tasks: [],
    goals: [],
    journalEntries: [],
    checkIns: [],
    streaks: [],
    habits: [],
    habitLogs: [],
  });

  const [metrics, setMetrics] = useState(null);
  const [events, setEvents] = useState([]);

  const applyDashboard = useCallback((dashboard) => {
    setState({
      tasks: dashboard.tasks ?? [],
      goals: dashboard.goals ?? [],
      journalEntries: dashboard.journalEntries ?? [],
      checkIns: dashboard.checkIns ?? [],
      streaks: dashboard.streaks ?? [],
      habits: dashboard.habits ?? [],
      habitLogs: dashboard.habitLogs ?? [],
    });

    setMetrics(dashboard.metrics ?? null);
    setEvents(dashboard.events ?? []);
  }, []);

  const loadEverything = useCallback(async () => {
    try {
      setError(null);

      const dashboard = await loadDashboard();

      applyDashboard(dashboard);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong loading your data.");
    } finally {
      setLoading(false);
    }
  }, [applyDashboard]);

  // =====================================================
  // Wait for authentication before loading dashboard
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session) {
          await loadEverything();
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session) {
        loadEverything();
      } else {
        setLoading(false);

        setState({
          tasks: [],
          goals: [],
          journalEntries: [],
          checkIns: [],
          streaks: [],
          habits: [],
          habitLogs: [],
        });

        setMetrics(null);
        setEvents([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadEverything]);

  const refreshDashboard = useCallback(async () => {
    try {
      setError(null);

      const dashboard = await loadDashboard();

      applyDashboard(dashboard);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong refreshing your data.");
    }
  }, [applyDashboard]);

  // ---------------------------------------------------------------------
  // Tasks
  // ---------------------------------------------------------------------

  const toggleTask = useCallback(
    async (taskId) => {
      await api.updateTask(taskId);
      await refreshDashboard();
    },
    [refreshDashboard]
  );

  const addTask = useCallback(
    async (task) => {
      const newTask = await api.addTask(task);
      await refreshDashboard();
      return newTask;
    },
    [refreshDashboard]
  );

  const editTask = useCallback(
    async (taskId, patch) => {
      await api.editTask(taskId, patch);
      await refreshDashboard();
    },
    [refreshDashboard]
  );

  const deleteTask = useCallback(
    async (taskId) => {
      await api.deleteTask(taskId);
      await refreshDashboard();
    },
    [refreshDashboard]
  );

  // ---------------------------------------------------------------------
  // Check-ins
  // ---------------------------------------------------------------------

  const submitCheckIn = useCallback(
    async (entry) => {
      const checkIn = await api.addCheckIn(entry);
      await refreshDashboard();
      return checkIn;
    },
    [refreshDashboard]
  );

  // ---------------------------------------------------------------------
  // Journal
  // ---------------------------------------------------------------------

  const addJournalEntry = useCallback(
    async (entry) => {
      const journal = await api.addJournalEntry(entry);
      await refreshDashboard();
      return journal;
    },
    [refreshDashboard]
  );

  const deleteJournalEntry = useCallback(
    async (entryId) => {
      await api.deleteJournalEntry(entryId);
      await refreshDashboard();
    },
    [refreshDashboard]
  );

  // ---------------------------------------------------------------------
  // Goals
  // ---------------------------------------------------------------------

  const addGoal = useCallback(
    async (goal) => {
      const newGoal = await api.addGoal(goal);
      await refreshDashboard();
      return newGoal;
    },
    [refreshDashboard]
  );

  const updateGoal = useCallback(
    async (goalId, patch) => {
      await api.updateGoal(goalId, patch);
      await refreshDashboard();
    },
    [refreshDashboard]
  );

  const deleteGoal = useCallback(
    async (goalId) => {
      await api.deleteGoal(goalId);
      await refreshDashboard();
    },
    [refreshDashboard]
  );

  // ---------------------------------------------------------------------
  // Habits
  // ---------------------------------------------------------------------

  const addHabit = useCallback(
    async (habit) => {
      const newHabit = await api.addHabit(habit);
      await refreshDashboard();
      return newHabit;
    },
    [refreshDashboard]
  );

  const completeHabit = useCallback(
    async (habit) => {
      await api.completeHabit(habit);
      await refreshDashboard();
    },
    [refreshDashboard]
  );

  const deleteHabit = useCallback(
    async (habitId) => {
      await api.deleteHabit(habitId);
      await refreshDashboard();
    },
    [refreshDashboard]
  );

  // ---------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------

  const lifeScore = useMemo(() => {
    return metrics?.overall_score ?? 0;
  }, [metrics]);

  const lifeAreas = useMemo(() => {
    if (!metrics) return [];

    return LIFE_AREA_META.map((area) => ({
      ...area,
      score: metrics[`${area.id}_score`] ?? 0,
    }));
  }, [metrics]);

  const nudgeContext = useMemo(() => {
    return {
      lifeAreas,
      streaks: state.streaks,
      journalEntries: state.journalEntries,
      goals: state.goals,
    };
  }, [lifeAreas, state.streaks, state.journalEntries, state.goals]);

  const nudges = useMemo(() => {
    return generateNudges(state.tasks, nudgeContext);
  }, [state.tasks, nudgeContext]);

  const headline = useMemo(() => {
    return generateHeadlineMessage(state.tasks, nudgeContext);
  }, [state.tasks, nudgeContext]);

  const analytics = useMemo(() => {
    return buildAnalytics({
      tasks: state.tasks,
      goals: state.goals,
      habits: state.habits,
      habitLogs: state.habitLogs,
      journalEntries: state.journalEntries,
      checkIns: state.checkIns,
      metrics,
    });
  }, [
    state.tasks,
    state.goals,
    state.habits,
    state.habitLogs,
    state.journalEntries,
    state.checkIns,
    metrics,
  ]);

  const value = {
    loading,
    error,

    state,

    metrics,
    lifeAreas,

    events,

    analytics,

    lifeScore,

    nudges,

    headline,

    loadEverything,

    refreshDashboard,

    toggleTask,
    addTask,
    editTask,
    deleteTask,

    submitCheckIn,

    addJournalEntry,
    deleteJournalEntry,

    addGoal,
    updateGoal,
    deleteGoal,

    addHabit,
    completeHabit,
    deleteHabit,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }

  return context;
}