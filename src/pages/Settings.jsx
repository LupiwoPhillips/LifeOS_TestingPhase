import React, { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { signOut } from '../services/authService.js'
import { supabase } from '../lib/supabase.js'
import './Settings.css'

const NOTIF_KEY = 'lifeos:notifications-enabled'

export default function Settings() {
  const { user } = useAuth()
  const showToast = useToast()

  const [notifsEnabled, setNotifsEnabled] = useState(
    () => localStorage.getItem(NOTIF_KEY) !== 'off'
  )
  const [confirmSignOutAll, setConfirmSignOutAll] = useState(false)
  const [busy, setBusy] = useState(false)

  function toggleNotifs() {
    const next = !notifsEnabled
    setNotifsEnabled(next)
    localStorage.setItem(NOTIF_KEY, next ? 'on' : 'off')
    showToast(next ? 'Nudges enabled on this device.' : 'Nudges muted on this device.', 'default')
  }

  async function handleSignOutEverywhere() {
    try {
      setBusy(true)
      await supabase.auth.signOut({ scope: 'global' })
    } catch (err) {
      showToast(err.message || 'Something went wrong.', 'error')
    } finally {
      setBusy(false)
      setConfirmSignOutAll(false)
    }
  }

  return (
    <div className="page">
      <TopBar title="Settings" showBack />

      <section className="card">
        <span className="section-label">Account</span>
        <div className="settings-row">
          <span>Email</span>
          <span className="settings-value">{user?.email}</span>
        </div>
        <div className="settings-row">
          <span>Status</span>
          <span className="settings-value settings-badge">
            {user?.email_confirmed_at ? 'Verified' : 'Pending verification'}
          </span>
        </div>
      </section>

      <section className="card">
        <span className="section-label">Notifications</span>
        <div className="settings-row">
          <span>Smart nudges on this device</span>
          <button
            className={`toggle ${notifsEnabled ? 'on' : ''}`}
            role="switch"
            aria-checked={notifsEnabled}
            onClick={toggleNotifs}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        <p className="settings-note">
          Nudges are generated from your own tasks, journal entries, and streaks — never sent externally.
        </p>
      </section>

      <section className="card">
        <span className="section-label">Appearance</span>
        <div className="settings-row">
          <span>Theme</span>
          <span className="settings-value">Dark (default)</span>
        </div>
        <p className="settings-note">A light theme is on the roadmap.</p>
      </section>

      <section className="card">
        <span className="section-label">Data &amp; Privacy</span>
        <p className="settings-note">
          Your data is stored securely in Supabase and protected by row-level
          security — only your account can read or write it.
        </p>
        <button className="profile-row" onClick={() => setConfirmSignOutAll(true)}>
          <span className="profile-row-icon">📴</span>
          <span className="profile-row-label">Sign Out on All Devices</span>
        </button>
      </section>

      <button className="btn-secondary settings-signout" onClick={() => signOut()}>
        Sign Out
      </button>

      <ConfirmDialog
        open={confirmSignOutAll}
        onClose={() => setConfirmSignOutAll(false)}
        onConfirm={handleSignOutEverywhere}
        title="Sign out everywhere?"
        message="You'll be signed out on every device where you're currently logged in."
        confirmLabel="Sign Out Everywhere"
        loading={busy}
      />
    </div>
  )
}
