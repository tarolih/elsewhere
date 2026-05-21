import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from '../hooks/useAuth'

const EXP_TYPES = [
  { value: 'surf', label: '🏄 Surf' },
  { value: 'food', label: '🍜 Food' },
  { value: 'explore', label: '🗺️ Explore' },
  { value: 'nightlife', label: '🌙 Nightlife' },
  { value: 'nature', label: '🌿 Nature' },
  { value: 'culture', label: '🏛️ Culture' },
  { value: 'stay', label: '🏡 Stay' },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function ScoreRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="page-subtitle text-xs w-20 flex-shrink-0">{label}</span>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-amber-600"
      />
      <span className="page-title text-xs w-4 text-right font-semibold">{value}</span>
    </div>
  )
}

export default function ExperiencePage() {
  const { token } = useAuth()
  const [locations, setLocations] = useState([])
  const [locationId, setLocationId] = useState('')
  const [expType, setExpType] = useState('explore')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [tip, setTip] = useState('')
  const [scores, setScores] = useState({ social: 7, safety: 7, value: 7, fun: 8 })
  const [recommend, setRecommend] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    apiFetch('/api/locations').then(setLocations).catch(() => {})
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const submit = async () => {
    if (!token) return showToast('Sign in to log an experience')
    if (!locationId) return showToast('Pick a destination first')
    if (!tip.trim()) return showToast('Add a short tip')
    setSubmitting(true)
    try {
      const payload = {
        location_id: Number(locationId),
        experience_type: expType,
        visited_month: month,
        visited_year: year,
        social_score: scores.social,
        party_score: 5,
        safety_score: scores.safety,
        value_score: scores.value,
        fun_score: scores.fun,
        authenticity_score: 7,
        crowd_level: 3,
        tags: [expType],
        short_tip: tip.trim(),
        would_recommend: recommend,
      }
      const data = await apiFetch('/api/experiences', { method: 'POST', body: JSON.stringify(payload) }, token)
      showToast(`Logged! +${data.points_earned ?? 0} vibe points ✦`)
      setTip('')
      setLocationId('')
    } catch (e) {
      showToast(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto space-y-4">
      {/* hero */}
      <div className="cozy-hero rounded-3xl px-6 py-8">
        <h1 className="page-title text-2xl font-bold">Log an experience</h1>
        <p className="page-subtitle mt-1 text-sm">Share the vibe, earn points</p>
      </div>

      {!token ? (
        <div className="cozy-card rounded-3xl px-6 py-10 text-center space-y-3">
          <p className="page-title font-semibold">Sign in to contribute</p>
          <p className="page-subtitle text-sm">Your experiences help others find their perfect place</p>
        </div>
      ) : (
        <div className="cozy-card rounded-3xl p-5 space-y-5">
          {/* destination */}
          <div className="space-y-1">
            <label className="page-subtitle text-xs">Destination</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="cozy-input w-full"
            >
              <option value="">Pick a place…</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* experience type */}
          <div className="space-y-1">
            <label className="page-subtitle text-xs">Type of experience</label>
            <div className="flex flex-wrap gap-2">
              {EXP_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setExpType(t.value)}
                  className="pill-button text-sm"
                  style={expType === t.value ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : {}}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* when */}
          <div className="space-y-1">
            <label className="page-subtitle text-xs">When did you visit?</label>
            <div className="flex gap-2">
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="cozy-input flex-1">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="cozy-input w-24">
                {[2026,2025,2024,2023,2022].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* scores */}
          <div className="space-y-2">
            <label className="page-subtitle text-xs">Rate the vibe</label>
            <ScoreRow label="Social" value={scores.social} onChange={(v) => setScores((s) => ({ ...s, social: v }))} />
            <ScoreRow label="Safety" value={scores.safety} onChange={(v) => setScores((s) => ({ ...s, safety: v }))} />
            <ScoreRow label="Value" value={scores.value} onChange={(v) => setScores((s) => ({ ...s, value: v }))} />
            <ScoreRow label="Fun" value={scores.fun} onChange={(v) => setScores((s) => ({ ...s, fun: v }))} />
          </div>

          {/* tip */}
          <div className="space-y-1">
            <label className="page-subtitle text-xs">Your tip</label>
            <textarea
              className="cozy-input w-full resize-none"
              rows={2}
              placeholder={'What should people know? (e.g. "Go at sunrise, skip weekends")'}
              value={tip}
              onChange={(e) => setTip(e.target.value)}
            />
          </div>

          {/* recommend toggle */}
          <button
            onClick={() => setRecommend((v) => !v)}
            className="flex items-center gap-2 text-sm"
            style={{ color: recommend ? 'var(--accent)' : 'var(--ink-light)' }}
          >
            <span
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: recommend ? 'var(--accent)' : 'var(--muted)', background: recommend ? 'var(--accent)' : 'transparent' }}
            >
              {recommend && <span className="text-white text-xs">✓</span>}
            </span>
            I'd recommend this place
          </button>

          <button
            onClick={submit}
            disabled={submitting}
            className="cozy-button w-full"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Logging…' : 'Submit experience'}
          </button>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl text-sm font-medium text-white shadow-lg"
          style={{ background: 'var(--accent)', zIndex: 100 }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
