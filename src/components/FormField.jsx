import React from 'react'
import './FormField.css'

export function FormField({ label, children, hint }) {
  return (
    <label className="form-field">
      <span className="form-field-label">{label}</span>
      {children}
      {hint && <span className="form-field-hint">{hint}</span>}
    </label>
  )
}

export function TextInput(props) {
  return <input className="form-input" {...props} />
}

export function TextArea(props) {
  return <textarea className="form-input form-textarea" {...props} />
}

export function Select({ children, ...props }) {
  return (
    <div className="form-select-wrap">
      <select className="form-input form-select" {...props}>
        {children}
      </select>
      <svg className="form-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
