import React from 'react'
import './Spinner.css'

export default function Spinner({ size = 22 }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )
}

export function FullScreenLoader({ label = 'Loading Life OS…' }) {
  return (
    <div className="fullscreen-loader">
      <div className="fullscreen-loader-mark">✦</div>
      <Spinner size={26} />
      <p>{label}</p>
    </div>
  )
}
