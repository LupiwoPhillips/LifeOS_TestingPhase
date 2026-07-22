import React from "react";
import TopBar from "../components/TopBar.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import LifeAreaBar from "../components/LifeAreaBar.jsx";
import { completionRate } from "../lib/lifeScore.js";
import { generateInsights } from "../lib/insightEngine.js";
import "./Insights.css";

export default function Insights() {
  const {
    state,
    metrics,
    events,
  } = useAppData();

  if (!state || !metrics) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 160, borderRadius: 24, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 100, borderRadius: 24, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 220, borderRadius: 24 }} />
      </div>
    );
  }

  // Timeline (last 7 activity events)
  const chartData = events
    .slice(0, 7)
    .reverse()
    .map((event) => ({
      date: event.created_at,
      score: event.impact_score,
    }));

  const max = Math.max(
    ...chartData.map((c) => c.score),
    100
  );

  // Life Areas from Supabase
  const AREA_ICON = {
    mental: "🧠",
    spiritual: "🕊️",
    career: "💼",
    fitness: "💪",
    relationships: "❤️",
    finance: "💰",
  };

  const lifeAreas = [
    {
      id: "mental",
      name: "Mental",
      icon: AREA_ICON.mental,
      score: metrics.mental_score,
      color: "var(--color-mental)",
    },
    {
      id: "spiritual",
      name: "Spiritual",
      icon: AREA_ICON.spiritual,
      score: metrics.spiritual_score,
      color: "var(--color-spiritual)",
    },
    {
      id: "career",
      name: "Career",
      icon: AREA_ICON.career,
      score: metrics.career_score,
      color: "var(--color-career)",
    },
    {
      id: "fitness",
      name: "Fitness",
      icon: AREA_ICON.fitness,
      score: metrics.fitness_score,
      color: "var(--color-fitness)",
    },
    {
      id: "relationships",
      name: "Relationships",
      icon: AREA_ICON.relationships,
      score: metrics.relationships_score,
      color: "var(--color-relationships)",
    },
    {
      id: "finance",
      name: "Finance",
      icon: AREA_ICON.finance,
      score: metrics.finance_score,
      color: "var(--color-finance)",
    },
  ];

  const insights = generateInsights(metrics, events);

  return (
    <div className="page">

      <TopBar title="Insights" showBack />

      <section className="card">

        <div className="card-title-row">
          <h3>Life Score Trend</h3>
          <span className="link-muted">Recent Activity</span>
        </div>

        <div className="trend-chart">

          {chartData.map((c, i) => (

            <div
              className="trend-bar-wrap"
              key={i}
            >

              <div
                className="trend-bar"
                style={{
                  height: `${(c.score / max) * 100}%`,
                }}
              />

              <span className="trend-label">
                {formatDay(c.date)}
              </span>

            </div>

          ))}

        </div>

      </section>

      <section className="stats-grid">

        <div className="card stat-card">
          <span className="stat-value">
            {state.tasks.length}
          </span>
          <span className="stat-label">
            Tasks Tracked
          </span>
        </div>

        <div className="card stat-card">
          <span className="stat-value">
            {completionRate(state.tasks)}%
          </span>
          <span className="stat-label">
            Completion Rate
          </span>
        </div>

        <div className="card stat-card">
          <span className="stat-value">
            {events.filter(e => e.event_type === "journal").length}
          </span>
          <span className="stat-label">
            Journal Entries
          </span>
        </div>

        <div className="card stat-card">
          <span className="stat-value">
            {events.length}
          </span>
          <span className="stat-label">
            Activity Events
          </span>
        </div>

      </section>

      <section className="card">

        <div className="card-title-row">
          <h3>Life Areas</h3>
        </div>

        {lifeAreas.map((area) => (
          <LifeAreaBar
            key={area.id}
            area={area}
          />
        ))}

      </section>

      <section className="card">

        <div className="card-title-row">
          <h3>AI Coach</h3>
        </div>

        {insights.map((insight, index) => (

          <div
            key={index}
            className="coach-item"
          >

            <strong>
              {insightIcon(insight.type)} {insight.title}
            </strong>

            {insight.value !== undefined && (
              <p>Score: {insight.value}</p>
            )}

          </div>

        ))}

      </section>

    </div>
  );
}

function formatDay(date) {
  return new Date(date)
    .toLocaleDateString(undefined, {
      weekday: "short",
    })
    .slice(0, 2);
}

function insightIcon(type) {
  return { strength: "💪", warning: "⚠️", trend: "📈", coach: "🧭" }[type] || "✨";
}