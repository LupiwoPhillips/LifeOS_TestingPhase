import React from 'react'
import './SmartNudgeCard.css'

const SEVERITY_META = {
  today: { label: 'Still open today', tone: 'info' },
  gentle: { label: 'Slipped a little', tone: 'warning' },
  firm: { label: 'Needs a decision', tone: 'danger' },
}

export default function SmartNudgeCard({ nudge, onResolve, onSnooze }) {
  if (!nudge) return null
  const meta = SEVERITY_META[nudge.severity] || SEVERITY_META.gentle

  return (
    <div className={`nudge-card tone-${meta.tone}`}>
      <div className="nudge-top">
        <span className="nudge-badge">{meta.label}</span>
        {nudge.missedDays > 0 && <span className="nudge-days">{nudge.missedDays}d ago</span>}
      </div>
      <p className="nudge-message">{nudge.message}</p>
      <div className="nudge-actions">
        <button className="nudge-btn primary" onClick={() => onResolve?.(nudge)}>
          {nudge.actionLabel}
        </button>
        <button className="nudge-btn ghost" onClick={() => onSnooze?.(nudge)}>
          Not now
        </button>
      </div>
    </div>
  )
}
