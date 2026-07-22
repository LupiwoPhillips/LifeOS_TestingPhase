import React, { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { FormField, TextInput, TextArea, Select } from '../components/FormField.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import './Goals.css'

const LIFE_AREAS = [
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'mental', label: 'Mental' },
  { id: 'career', label: 'Career' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'finance', label: 'Finance' },
]

const EMPTY_FORM = { title: '', description: '', life_area: 'career', priority: 'medium', target_date: '' }

export default function Goals() {
  const { state, addGoal, updateGoal, deleteGoal } = useAppData()
  const showToast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      setSaving(true)
      await addGoal({
        title: form.title.trim(),
        description: form.description.trim(),
        life_area: form.life_area,
        priority: form.priority,
        target_date: form.target_date || null,
      })
      setForm(EMPTY_FORM)
      setModalOpen(false)
      showToast('Goal created.', 'success')
    } catch (err) {
      showToast(err.message || "Couldn't create that goal.", 'error')
    } finally {
      setSaving(false)
    }
  }

  async function bumpProgress(goal, delta) {
    const next = Math.max(0, Math.min(100, (goal.progress ?? 0) + delta))
    try {
      setBusyId(goal.id)
      await updateGoal(goal.id, {
        progress: next,
        status: next === 100 ? 'Completed' : 'In Progress',
      })
      if (next === 100) showToast(`"${goal.title}" complete — nice work!`, 'success')
    } catch (err) {
      showToast(err.message || "Couldn't update progress.", 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    try {
      setBusyId(confirmDelete.id)
      await deleteGoal(confirmDelete.id)
      showToast('Goal deleted.', 'default')
    } catch (err) {
      showToast(err.message || "Couldn't delete that goal.", 'error')
    } finally {
      setBusyId(null)
      setConfirmDelete(null)
    }
  }

  const sorted = [...state.goals].sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0))

  return (
    <div className="page">
      <TopBar title="Goals" />

      {state.goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No goals yet"
          message="Set the first thing you're working toward — Life OS will track it alongside everything else."
        />
      ) : (
        <div className="goals-list">
          {sorted.map((goal) => (
            <div key={goal.id} className="card goal-card">
              <div className="goal-top">
                <div>
                  <span className="goal-area-tag" style={{ color: `var(--color-${goal.life_area})` }}>
                    {formatArea(goal.life_area)}
                  </span>
                  <h3>{goal.title}</h3>
                </div>
                <span className="goal-pct">{goal.progress ?? 0}%</span>
              </div>

              {goal.description && <p className="goal-description">{goal.description}</p>}

              <div className="goal-track">
                <div className="goal-fill" style={{ width: `${goal.progress ?? 0}%` }} />
              </div>

              <div className="goal-footer">
                <span className="goal-target">
                  {goal.target_date ? `Target: ${formatDate(goal.target_date)}` : 'No target date'}
                </span>

                <div className="goal-actions">
                  <button
                    className="icon-btn"
                    disabled={busyId === goal.id}
                    onClick={() => bumpProgress(goal, -10)}
                    aria-label="Decrease progress"
                  >
                    −
                  </button>
                  <button
                    className="icon-btn"
                    disabled={busyId === goal.id}
                    onClick={() => bumpProgress(goal, 10)}
                    aria-label="Increase progress"
                  >
                    +
                  </button>
                  <button
                    className="icon-btn danger"
                    disabled={busyId === goal.id}
                    onClick={() => setConfirmDelete(goal)}
                    aria-label="Delete goal"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn-primary" onClick={() => setModalOpen(true)}>+ New Goal</button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Goal">
        <form className="modal-form" onSubmit={handleCreate}>
          <FormField label="Goal title">
            <TextInput
              autoFocus
              placeholder="e.g. Run a marathon"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </FormField>

          <FormField label="Details (optional)">
            <TextArea
              rows={3}
              placeholder="What does success look like?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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

          <FormField label="Priority">
            <Select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormField>

          <FormField label="Target date (optional)">
            <TextInput
              type="date"
              value={form.target_date}
              onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
            />
          </FormField>

          <button className="btn-primary" type="submit" disabled={saving || !form.title.trim()}>
            {saving ? 'Creating…' : 'Create Goal'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete this goal?"
        message={confirmDelete ? `"${confirmDelete.title}" will be removed permanently.` : ''}
        loading={busyId === confirmDelete?.id}
      />
    </div>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatArea(area) {
  if (!area) return 'General'
  return area.charAt(0).toUpperCase() + area.slice(1)
}
