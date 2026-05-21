import { useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export default function ExperiencePage() {
  const { token } = useAuth()
  const [form, setForm] = useState({ location_id: 4, place_id: 1, experience_type: 'surf', visited_month: 1, visited_year: 2025, social_score: 8, party_score: 7, safety_score: 8, cleanliness_score: 7, sleep_score: 7, value_score: 8, authenticity_score: 8, fun_score: 9, crowd_level: 3, tags: ['sunset'], short_tip: 'Go early', would_recommend: true })
  const [message, setMessage] = useState('')

  const submit = async () => {
    if (!token) return setMessage('Please login from Profile first.')
    const payload = { ...form, tags: Array.isArray(form.tags) ? form.tags : String(form.tags).split(',').map((x) => x.trim()) }
    const data = await apiFetch('/api/experiences', { method: 'POST', body: JSON.stringify(payload) }, token)
    setMessage(`Experience submitted. +${data.points_earned} points`)
  }

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold">Add Experience</h1>
      <textarea className="w-full rounded-xl border p-2" rows={3} value={form.short_tip} onChange={(e) => setForm({ ...form, short_tip: e.target.value })} />
      <button onClick={submit} className="w-full rounded-xl bg-coral px-4 py-2 font-semibold text-white">Submit</button>
      {message && <p className="text-sm text-ocean">{message}</p>}
    </div>
  )
}
