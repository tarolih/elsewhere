import { useState } from 'react'
import { apiFetch } from '../api/client'
import Card from '../components/Card'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState({ locations: [], places: [] })

  const runSearch = async () => {
    if (!q) return
    const data = await apiFetch(`/api/search?q=${encodeURIComponent(q)}`)
    setResults(data)
  }

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="flex gap-2">
        <input className="flex-1 rounded-xl border p-2" placeholder="Search destinations or places" value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={runSearch} className="rounded-xl bg-ocean px-3 text-white">Go</button>
      </div>
      <Card title="Locations">{results.locations.map((l) => <p key={l.id}>{l.name} ({l.type})</p>)}</Card>
      <Card title="Places">{results.places.map((p) => <p key={p.id}>{p.name} ({p.type})</p>)}</Card>
    </div>
  )
}
