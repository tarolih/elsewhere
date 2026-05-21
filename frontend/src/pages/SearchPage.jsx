import { useRef, useState } from 'react'
import { apiFetch } from '../api/client'

const TYPE_COLORS = {
  country: '#0e7490',
  region: '#7c3aed',
  city: '#b45309',
  town: '#d2691e',
  hostel: '#be123c',
  cafe: '#854d0e',
  restaurant: '#166534',
  bar: '#6d28d9',
}

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()

  const runSearch = async () => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const data = await apiFetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      setResults(data)
    } catch {
      setResults({ locations: [], places: [] })
    } finally {
      setLoading(false)
    }
  }

  const total = results ? (results.locations?.length ?? 0) + (results.places?.length ?? 0) : 0

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto space-y-4">
      <div className="cozy-hero rounded-3xl px-6 py-8">
        <h1 className="page-title text-2xl font-bold">Explore</h1>
        <p className="page-subtitle mt-1 text-sm">Find destinations &amp; places</p>

        <div className="mt-4 flex gap-2">
          <input
            ref={inputRef}
            className="cozy-input flex-1"
            placeholder="Bali, surf bar, hidden café…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          />
          <button
            onClick={runSearch}
            disabled={loading || !q.trim()}
            className="cozy-button px-5"
            style={{ opacity: loading || !q.trim() ? 0.6 : 1 }}
          >
            {loading ? '…' : 'Go'}
          </button>
        </div>
      </div>

      {results && (
        <p className="page-subtitle text-xs px-1">
          {total === 0 ? 'No results found' : `${total} result${total !== 1 ? 's' : ''} found`}
        </p>
      )}

      {results?.locations?.length > 0 && (
        <div className="space-y-2">
          <h2 className="page-title text-sm font-semibold px-1">Destinations</h2>
          {results.locations.map((l) => (
            <div key={l.id} className="cozy-card rounded-2xl px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--ink)' }} className="font-medium">{l.name}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: TYPE_COLORS[l.type] ?? 'var(--accent)', color: '#fff' }}
              >
                {l.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {results?.places?.length > 0 && (
        <div className="space-y-2">
          <h2 className="page-title text-sm font-semibold px-1">Places</h2>
          {results.places.map((p) => (
            <div key={p.id} className="cozy-card rounded-2xl px-4 py-3 flex items-center justify-between">
              <span style={{ color: 'var(--ink)' }} className="font-medium">{p.name}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: TYPE_COLORS[p.type] ?? 'var(--accent)', color: '#fff' }}
              >
                {p.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
