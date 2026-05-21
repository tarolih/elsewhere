import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from '../hooks/useAuth'

const STATUS_COLORS = {
  suggested: '#d97706',
  planned: '#0e7490',
  in_progress: '#7c3aed',
  done: '#166534',
}

export default function IdeasPage() {
  const { token } = useAuth()
  const [ideas, setIdeas] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  const load = () => apiFetch('/api/ideas').then(setIdeas).catch(() => {})
  useEffect(() => { load() }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const submit = async () => {
    if (!token) return showToast('Sign in to submit ideas')
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await apiFetch('/api/ideas', { method: 'POST', body: JSON.stringify({ title, description, category: 'product' }) }, token)
      setTitle('')
      setDescription('')
      setShowForm(false)
      showToast('Idea submitted ✦')
      load()
    } catch (e) {
      showToast(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const vote = async (id) => {
    if (!token) return showToast('Sign in to vote')
    try {
      await apiFetch(`/api/ideas/${id}/vote`, { method: 'POST' }, token)
      load()
    } catch (e) {
      showToast(e.message)
    }
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto space-y-4">
      {/* hero */}
      <div className="cozy-hero rounded-3xl px-6 py-8">
        <h1 className="page-title text-2xl font-bold">Shape Elsewhere</h1>
        <p className="page-subtitle mt-1 text-sm">Vote on what gets built next</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="cozy-button mt-4 text-sm"
        >
          {showForm ? 'Cancel' : '+ Share an idea'}
        </button>
      </div>

      {/* submit form */}
      {showForm && (
        <div className="cozy-card rounded-3xl p-5 space-y-3">
          <h2 className="page-title font-semibold">Your idea</h2>
          <input
            className="cozy-input w-full"
            placeholder="What should Elsewhere build?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="cozy-input w-full resize-none"
            rows={3}
            placeholder="Tell us more (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={submit}
            disabled={submitting || !title.trim()}
            className="cozy-button w-full"
            style={{ opacity: submitting || !title.trim() ? 0.6 : 1 }}
          >
            {submitting ? 'Submitting…' : 'Submit idea'}
          </button>
        </div>
      )}

      {/* ideas list */}
      {ideas.length === 0 && (
        <div className="cozy-card rounded-3xl px-6 py-10 text-center">
          <p className="page-subtitle text-sm">No ideas yet — be the first!</p>
        </div>
      )}

      {ideas.map((idea) => (
        <div key={idea.id} className="cozy-card rounded-3xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="page-title font-semibold text-sm leading-snug">{idea.title}</h3>
              {idea.description && (
                <p className="page-subtitle text-xs mt-1 line-clamp-2">{idea.description}</p>
              )}
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
              style={{ background: STATUS_COLORS[idea.status] ?? 'var(--accent)', color: '#fff' }}
            >
              {idea.status}
            </span>
          </div>
          <button
            onClick={() => vote(idea.id)}
            className="pill-button text-sm flex items-center gap-1.5"
          >
            <span>▲</span>
            <span>{idea.vote_count} vote{idea.vote_count !== 1 ? 's' : ''}</span>
          </button>
        </div>
      ))}

      {/* toast */}
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
