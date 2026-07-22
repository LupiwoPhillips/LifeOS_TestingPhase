import React from 'react'
import { useNavigate } from 'react-router-dom'
import './TopBar.css'

export default function TopBar({ title, showBack = false, right = null }) {
  const navigate = useNavigate()
  return (
    <div className="top-bar">
      {showBack ? (
        <button className="top-bar-back" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="top-bar-spacer" />
      )}
      <h1 className="top-bar-title">{title}</h1>
      <div className="top-bar-right">{right}</div>
    </div>
  )
}
