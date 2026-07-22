import React, { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import './Journal.css'

const LIFE_AREAS = [
  { id: 'spiritual', label: 'Spiritual', emoji: '🕊️' },
  { id: 'mental', label: 'Mental', emoji: '🧠' },
  { id: 'career', label: 'Career', emoji: '💼' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'relationships', label: 'Relationships', emoji: '❤️' },
  { id: 'finance', label: 'Finance', emoji: '💰' },
]

const MOODS = [
  { score: 2, emoji: '😞' },
  { score: 4, emoji: '😕' },
  { score: 6, emoji: '🙂' },
  { score: 8, emoji: '😄' },
  { score: 10, emoji: '🤩' },
]

export default function Journal() {
  const { state, addJournalEntry, deleteJournalEntry } = useAppData()
  const showToast = useToast()

  const [composing, setComposing] = useState(false)
  const [content, setContent] = useState('')
  const [lifeArea, setLifeArea] = useState('mental')
  const [mood, setMood] = useState(8)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    if (!content.trim()) return
    try {
      setSaving(true)
      await addJournalEntry({
        title: 'Daily Reflection',
        content: content.trim(),
        life_area: lifeArea,
        mood_score: mood,
        impact_score: 0,
      })
      setContent('')
      setComposing(false)
      showToast('Entry saved.', 'success')
    } catch (err) {
      showToast(err.message || "Couldn't save that entry.", 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    try {
      setDeleting(true)
      await deleteJournalEntry(confirmDelete.id)
      showToast('Entry deleted.', 'default')
    } catch (err) {
      showToast(err.message || "Couldn't delete that entry.", 'error')
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }

  return (
    <div className="page">
      <TopBar title="Journal" />

      {composing ? (
        <section className="card">
          <textarea
            autoFocus
            className="journal-compose"
            rows={8}
            placeholder="What's on your mind today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="journal-picker-row">
            <span className="journal-picker-label">Area</span>
            <div className="journal-area-chips">
              {LIFE_AREAS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`area-chip ${lifeArea === a.id ? 'active' : ''}`}
                  style={lifeArea === a.id ? { borderColor: `var(--color-${a.id})`, color: `var(--color-${a.id})` } : undefined}
                  onClick={() => setLifeArea(a.id)}
                >
                  {a.emoji} {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="journal-picker-row">
            <span className="journal-picker-label">Mood</span>
            <div className="journal-mood-chips">
              {MOODS.map((m) => (
                <button
                  key={m.score}
                  type="button"
                  className={`mood-chip ${mood === m.score ? 'active' : ''}`}
                  onClick={() => setMood(m.score)}
                  aria-label={`Mood ${m.score}`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="journal-compose-actions">
            <button className="btn-secondary" onClick={() => setComposing(false)}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving || !content.trim()}>
              {saving ? 'Saving…' : 'Save Entry'}
            </button>
          </div>
        </section>
      ) : (
        <button className="btn-primary" onClick={() => setComposing(true)}>
          New Journal Entry
        </button>
      )}

      <div className="journal-list">
        {state.journalEntries.length === 0 ? (
          <EmptyState
            icon="📖"
            title="No entries yet"
            message="Your first one starts the pattern Life OS learns from."
          />
        ) : (
          state.journalEntries.map((entry) => (
            <article key={entry.id} className="card journal-entry">
              <div className="journal-entry-top">
                <div className="journal-entry-date">{formatDate(entry.created_at)}</div>
                <button
                  className="icon-btn danger journal-delete"
                  onClick={() => setConfirmDelete(entry)}
                  aria-label="Delete entry"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <p className="journal-entry-text">{entry.content}</p>
              <div className="journal-tags">
                {entry.life_area && (
                  <span className="pill" style={{ color: `var(--color-${entry.life_area})` }}>
                    {formatArea(entry.life_area)}
                  </span>
                )}
                {typeof entry.mood_score === 'number' && (
                  <span className="pill">{moodEmoji(entry.mood_score)} {entry.mood_score}/10</span>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete this entry?"
        message="This journal entry will be permanently removed."
        loading={deleting}
      />
    </div>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatArea(area) {
  return area.charAt(0).toUpperCase() + area.slice(1)
}

function moodEmoji(score) {
  if (score <= 2) return '😞'
  if (score <= 4) return '😕'
  if (score <= 6) return '🙂'
  if (score <= 8) return '😄'
  return '🤩'
}
