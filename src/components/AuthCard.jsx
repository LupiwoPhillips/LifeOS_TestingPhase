import React from 'react'

export default function AuthCard({ icon, title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="logo-circle">{icon}</div>
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
        {footer}
      </div>
    </div>
  )
}
