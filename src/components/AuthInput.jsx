import React from 'react'

export default function AuthInput({ label, ...props }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input {...props} />
    </div>
  )
}
