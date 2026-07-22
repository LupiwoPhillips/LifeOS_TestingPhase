import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import './CheckIn.css'
import '../components/FormField.css'

const MOODS = [
  { key: 'terrible', emoji: '😣', value: 1 },
  { key: 'bad', emoji: '🙁', value: 3 },
  { key: 'okay', emoji: '😐', value: 5 },
  { key: 'good', emoji: '😊', value: 8 },
  { key: 'amazing', emoji: '🤩', value: 10 },
]

export default function CheckIn() {
  const { submitCheckIn } = useAppData()
  const navigate = useNavigate()

  const [mood, setMood] = useState(MOODS[3])
  const [energy, setEnergy] = useState(70)
  const [stress, setStress] = useState(30)
  const [mind, setMind] = useState('')
  const [gratitude, setGratitude] = useState(['', ''])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleGratitudeChange = (index, value) => {
    setGratitude((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    )
  }

  const addGratitudeField = () => {
    setGratitude((prev) => [...prev, ''])
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")

      await submitCheckIn({
        mood: mood.key,
        mood_score: mood.value,
        energy,
        stress,
        mind,
        gratitude: gratitude.filter(g => g.trim() !== ""),
      })

      navigate("/home")
    } catch (err) {
      setError(err.message || "Couldn't save your check-in.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <TopBar title="Daily Check-In" showBack />

      <section className="card">
        <h3 className="section-heading">How are you feeling today?</h3>

        <div className="mood-row">
          {MOODS.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`mood-btn ${mood.key === m.key ? 'active' : ''}`}
              onClick={() => setMood(m)}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-title-row">
          <h3>Energy Level</h3>
          <span>{energy}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={energy}
          onChange={(e) => setEnergy(Number(e.target.value))}
        />
      </section>

      <section className="card">
        <div className="card-title-row">
          <h3>Stress Level</h3>
          <span>{stress}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={stress}
          onChange={(e) => setStress(Number(e.target.value))}
        />
      </section>

      <section className="card">
        <h3 className="section-heading">What's on your mind?</h3>

        <textarea
          className="form-input form-textarea"
          rows={4}
          value={mind}
          maxLength={300}
          placeholder="Anything you want to capture about today…"
          onChange={(e) => setMind(e.target.value)}
        />

        <small className="char-count">{mind.length}/300</small>
      </section>

      <section className="card">
        <h3 className="section-heading">What are you grateful for?</h3>

        <div className="gratitude-list">
          {gratitude.map((item, index) => (
            <input
              key={index}
              className="form-input"
              value={item}
              placeholder={`Gratitude ${index + 1}`}
              onChange={(e) =>
                handleGratitudeChange(index, e.target.value)
              }
            />
          ))}
        </div>

        <button
          type="button"
          className="btn-ghost add-gratitude-btn"
          onClick={addGratitudeField}
        >
          + Add another
        </button>
      </section>

      {error && <p className="error-message">{error}</p>}

      <button
        className="btn-primary"
        disabled={saving}
        onClick={handleSave}
      >
        {saving ? 'Saving...' : 'Save Check-In'}
      </button>
    </div>
  )
}