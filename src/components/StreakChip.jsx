import React from 'react'
import './StreakChip.css'

export default function StreakChip({ streak }) {
  const isActive = streak.days > 0
  return (
    <div className={`streak-chip ${isActive ? '' : 'is-inactive'}`}>
      <div className="streak-icon">{streak.emoji}</div>
      <span className="streak-name">{streak.title}</span>
      <span className="streak-days">{isActive ? `🔥 ${streak.days}d` : '—'}</span>
    </div>
  )
}
