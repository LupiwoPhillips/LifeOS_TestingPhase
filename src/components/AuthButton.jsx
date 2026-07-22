import React from 'react'

export default function AuthButton({ loading, loadingLabel, children, ...props }) {
  return (
    <button className="auth-button" disabled={loading} {...props}>
      {loading ? loadingLabel || 'Please wait…' : children}
    </button>
  )
}
