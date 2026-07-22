import React from 'react'
import { useNavigate } from 'react-router-dom'
import './QuickActionCard.css'

export default function QuickActionCard({ icon, label, sublabel, to, color }) {
  const navigate = useNavigate()
  return (
    <button className="quick-action" onClick={() => navigate(to)}>
      <div className="quick-action-icon" style={{ background: color }}>
        {icon}
      </div>
      <div className="quick-action-text">
        <span className="quick-action-label">{label}</span>
        <span className="quick-action-sub">{sublabel}</span>
      </div>
    </button>
  )
}
