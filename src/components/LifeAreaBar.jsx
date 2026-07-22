import React from 'react'
import './LifeAreaBar.css'

export default function LifeAreaBar({ area }) {
  return (
    <div className="life-area-row">
      <div className="life-area-icon">{area.icon}</div>
      <div className="life-area-main">
        <div className="life-area-top">
          <span className="life-area-name">{area.name}</span>
          <span className="life-area-score">{area.score}%</span>
        </div>
        <div className="life-area-track">
          <div
            className="life-area-fill"
            style={{ width: `${area.score}%`, background: area.color }}
          />
        </div>
      </div>
      {typeof area.weeklyDelta === 'number' && (
        <span className={`life-area-delta ${area.weeklyDelta >= 0 ? 'up' : 'down'}`}>
          {area.weeklyDelta >= 0 ? '↑' : '↓'} {Math.abs(area.weeklyDelta)}%
        </span>
      )}
    </div>
  )
}
