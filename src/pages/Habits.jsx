import React, { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { FormField, TextInput, Select } from '../components/FormField.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import './Habits.css'

const LIFE_AREAS = [
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'mental', label: 'Mental' },
  { id: 'career', label: 'Career' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'finance', label: 'Finance' },
]

const EMPTY_FORM = { name: '', life_area: 'fitness', frequency: 'daily' }

export default function Habits() {
  const { state, addHabit, completeHabit, deleteHabit } = useAppData()
  const showToast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const today = new Date().toISOString().slice(0, 10)
  const doneToday = new Set(
    state.habitLogs.filter((log) => log.completed_on === today).map((log) => log.habit_id)
  )

  const streakFor = (habitId) => {
    const streak = state.streaks.find((s) => s.id === habitId)
    return streak?.days ?? 0
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      setSaving(true)
      await addHabit({
        name: form.name.trim(),
        life_area: form.life_area,
        frequency: form.frequency,
      })
      setForm(EMPTY_FORM)
      setModalOpen(false)
      showToast('Habit added.', 'success')
    } catch (err) {
      showToast(err.message || "Couldn't add that habit.", 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete(habit) {
    if (doneToday.has(habit.id)) return
    try {
      setBusyId(habit.id)
      await completeHabit(habit)
      showToast(`"${habit.name}" logged for today.`, 'success')
    } catch (err) {
      showToast(err.message || "Couldn't log that habit.", 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    try {
      setBusyId(confirmDelete.id)
      await deleteHabit(confirmDelete.id)
      showToast('Habit removed.', 'default')
    } catch (err) {
      showToast(err.message || "Couldn't remove that habit.", 'error')
    } finally {
      setBusyId(null)
      setConfirmDelete(null)
    }
  }

  return (
    <div className="page">
      <TopBar title="Habits" />

      {state.habits.length === 0 ? (
        <EmptyState
          icon="🔥"
          title="No habits yet"
          message="Add something small you want to do consistently — Life OS will track your streak."
        />
      ) : (
        <div className="habits-list">
          {state.habits.map((habit) => {
            const done = doneToday.has(habit.id)
            const streak = streakFor(habit.id)
            return (
              <div key={habit.id} className={`card habit-card ${done ? 'is-done' : ''}`}>
                <button
                  className={`habit-check ${done ? 'checked' : ''}`}
                  onClick={() => handleComplete(habit)}
                  disabled={busyId === habit.id || done}
                  aria-label={done ? 'Completed today' : 'Mark done today'}
                >
                  {done ? '✓' : ''}
                </button>

                <div className="habit-info">
                  <h3>{habit.name}</h3>
                  <p>
                    <span className="habit-area-tag" style={{ color: `var(--color-${habit.life_area})` }}>
                      {formatArea(habit.life_area)}
                    </span>
                    {streak > 0 && <span className="habit-streak">🔥 {streak} day{streak === 1 ? '' : 's'}</span>}
                  </p>
                </div>

                <button
                  className="icon-btn danger habit-delete"
                  onClick={() => setConfirmDelete(habit)}
                  aria-label="Delete habit"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      <button className="btn-primary" onClick={() => setModalOpen(true)}>+ New Habit</button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Habit">
        <form className="modal-form" onSubmit={handleCreate}>
          <FormField label="What do you want to build?">
            <TextInput
              autoFocus
              placeholder="e.g. Read for 20 minutes"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FormField>

          <FormField label="Life area">
            <Select
              value={form.life_area}
              onChange={(e) => setForm((f) => ({ ...f, life_area: e.target.value }))}
            >
              {LIFE_AREAS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
          </FormField>

          <FormField label="Frequency">
            <Select
              value={form.frequency}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
          </FormField>

          <button className="btn-primary" type="submit" disabled={saving || !form.name.trim()}>
            {saving ? 'Adding…' : 'Add Habit'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Remove this habit?"
        message={confirmDelete ? `"${confirmDelete.name}" and its streak history will be removed.` : ''}
        loading={busyId === confirmDelete?.id}
      />
    </div>
  )
}

function formatArea(area) {
  if (!area) return 'General'
  return area.charAt(0).toUpperCase() + area.slice(1)
}
