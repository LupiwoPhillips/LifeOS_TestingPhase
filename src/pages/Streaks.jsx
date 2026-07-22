import React from 'react'
import TopBar from '../components/TopBar.jsx'
import StreakChip from '../components/StreakChip.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import './Streaks.css'

export default function Streaks() {
  const { state } = useAppData()

  const sorted = [...state.streaks].sort((a, b) => b.days - a.days)
  const longest = sorted[0]
  const active = sorted.filter((s) => s.days > 0)
  const inactive = sorted.filter((s) => s.days === 0)

  return (
    <div className="page">
      <TopBar title="Streaks" />

      {longest && longest.days > 0 && (
        <div className="card longest-card">
          <span className="longest-value">🔥 {longest.days}</span>
          <span className="longest-name">{longest.title} — your longest active streak</span>
        </div>
      )}

      <section className="card">
        <h3 className="section-heading">Active</h3>
        {active.length === 0 ? (
          <EmptyState
            icon="🔥"
            title="No active streaks"
            message="Check in, journal, or complete a habit today to start one."
          />
        ) : (
          active.map((streak) => <StreakChip key={streak.id} streak={streak} />)
        )}
      </section>

      {inactive.length > 0 && (
        <section className="card">
          <h3 className="section-heading">Not started</h3>
          {inactive.map((streak) => <StreakChip key={streak.id} streak={streak} />)}
        </section>
      )}
    </div>
  )
}
