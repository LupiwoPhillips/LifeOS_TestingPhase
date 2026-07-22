import React from 'react'
import Modal from './Modal.jsx'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  danger = true,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {message && <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>{message}</p>}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 4 }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
          Cancel
        </button>
        <button
          className={danger ? 'btn-danger' : 'btn-primary'}
          style={{ flex: 1 }}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
