import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import Modal from '../components/Modal.jsx'
import { FormField, TextInput } from '../components/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { updateProfile, updatePassword, signOut } from '../services/authService.js'
import './Profile.css'

export default function Profile() {
  const { user } = useAuth()
  const { state } = useAppData()
  const showToast = useToast()
  const navigate = useNavigate()

  const [editOpen, setEditOpen] = useState(false)
  const [securityOpen, setSecurityOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [savingName, setSavingName] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const fullName = user?.user_metadata?.full_name || 'Life OS User'
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U'

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null

  async function handleSaveName(e) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      setSavingName(true)
      await updateProfile({ full_name: name.trim() })
      showToast('Profile updated.', 'success')
      setEditOpen(false)
    } catch (err) {
      showToast(err.message || "Couldn't update your profile.", 'error')
    } finally {
      setSavingName(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordError('')
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    try {
      setSavingPassword(true)
      await updatePassword(newPassword)
      showToast('Password updated.', 'success')
      setNewPassword('')
      setConfirmPassword('')
      setSecurityOpen(false)
    } catch (err) {
      setPasswordError(err.message || "Couldn't update your password.")
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      showToast('Signed out.', 'default')
    } catch (err) {
      showToast(err.message || "Couldn't sign out.", 'error')
    }
  }

  const totalDone = state.tasks.filter((t) => t.completed).length
  const journalCount = state.journalEntries.length
  const longestStreak = state.streaks.reduce((max, s) => Math.max(max, s.days), 0)

  return (
    <div className="page">
      <TopBar title="Profile" />

      <div className="card profile-hero">
        <div className="avatar">{initials}</div>
        <div>
          <h2>{fullName}</h2>
          <p>{user?.email}</p>
          {memberSince && <p>Member since {memberSince}</p>}
        </div>
      </div>

      <div className="card profile-stats-grid">
        <div className="profile-stat">
          <span className="profile-stat-value">{totalDone}</span>
          <span className="profile-stat-label">Tasks done</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{journalCount}</span>
          <span className="profile-stat-label">Journal entries</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{longestStreak}</span>
          <span className="profile-stat-label">Best streak</span>
        </div>
      </div>

      <div className="card">
        <ProfileRow icon="✏️" label="Edit Profile" onClick={() => setEditOpen(true)} />
        <ProfileRow icon="⚙️" label="Preferences" onClick={() => navigate('/settings')} />
        <ProfileRow icon="🔒" label="Security" onClick={() => setSecurityOpen(true)} />
        <ProfileRow icon="❓" label="Help Center" onClick={() => setHelpOpen(true)} />
        <ProfileRow
          icon="💬"
          label="Send Feedback"
          onClick={() => window.open('mailto:feedback@lifeos.app?subject=Life%20OS%20Feedback', '_blank')}
        />
      </div>

      <button className="btn-danger profile-signout" onClick={handleSignOut}>
        Sign Out
      </button>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <form className="modal-form" onSubmit={handleSaveName}>
          <FormField label="Full name">
            <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <button className="btn-primary" type="submit" disabled={savingName || !name.trim()}>
            {savingName ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </Modal>

      <Modal open={securityOpen} onClose={() => setSecurityOpen(false)} title="Change Password">
        <form className="modal-form" onSubmit={handleChangePassword}>
          <FormField label="New password">
            <TextInput
              type="password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormField>
          <FormField label="Confirm new password">
            <TextInput
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormField>
          {passwordError && <p className="error-message">{passwordError}</p>}
          <button className="btn-primary" type="submit" disabled={savingPassword}>
            {savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </Modal>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Help Center">
        <div className="help-content">
          <div className="help-item">
            <strong>How does the Life Score work?</strong>
            <p>It's the average of your six life-area scores, which move as you complete tasks, check in, journal, and log habits.</p>
          </div>
          <div className="help-item">
            <strong>Why did a task disappear from Today's Focus?</strong>
            <p>Only tasks due today show there. Check the Goals or Insights pages for the full picture.</p>
          </div>
          <div className="help-item">
            <strong>How do streaks work?</strong>
            <p>A streak counts consecutive days you've checked in, journaled, completed a habit, or finished a task.</p>
          </div>
          <div className="help-item">
            <strong>Still need help?</strong>
            <p>Reach out any time using Send Feedback — a real person reads every message.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ProfileRow({ icon, label, onClick }) {
  return (
    <button className="profile-row" onClick={onClick}>
      <span className="profile-row-icon">{icon}</span>
      <span className="profile-row-label">{label}</span>
      <span className="profile-row-chevron">›</span>
    </button>
  )
}
