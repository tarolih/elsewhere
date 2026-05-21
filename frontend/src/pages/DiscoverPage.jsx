import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import Card from '../components/Card'

const vibeOptions = ['surf', 'social', 'beach', 'party', 'nature', 'food', 'culture', 'budget', 'safe', 'digital_nomad', 'hidden_gem', 'romantic', 'luxury', 'adventure']

export default function DiscoverPage() {
  const [locations, setLocations] = useState([])
  const [scopeLocationId, setScopeLocationId] = useState('1')
  const [vibes, setVibes] = useState(['surf', 'social'])
  const [budget, setBudget] = useState('medium')
  const [results, setResults] = useState([])

  useEffect(() => {
    apiFetch('/api/locations').then(setLocations).catch(() => {})
  }, [])

  const toggleVibe = (vibe) => setVibes((prev) => (prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]))

  const findPlaces = async () => {
    const data = await apiFetch('/api/recommendations', {
      method: 'POST',
      body: JSON.stringify({ vibes, scope_location_id: Number(scopeLocationId), traveler_type: 'solo', budget }),
    })
    setResults(data)
  }

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold">Elsewhere Discover</h1>
      <Card title="Pick your vibe">
        <div className="flex flex-wrap gap-2">
          {vibeOptions.map((v) => (
            <button key={v} onClick={() => toggleVibe(v)} className={`rounded-full px-3 py-1 text-sm ${vibes.includes(v) ? 'bg-ocean text-white' : 'bg-slate-100'}`}>
              {v}
            </button>
          ))}
        </div>
      </Card>
      <Card title="Scope + budget">
        <select className="w-full rounded-lg border p-2" value={scopeLocationId} onChange={(e) => setScopeLocationId(e.target.value)}>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
          ))}
        </select>
        <select className="mt-2 w-full rounded-lg border p-2" value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
        </select>
        <button onClick={findPlaces} className="mt-3 w-full rounded-xl bg-coral px-4 py-2 font-semibold text-white">Find my places</button>
      </Card>

      <div className="space-y-3">
        {results.map((r) => (
          <Card key={r.location_id} title={`${r.location_name} • ${r.match_score}`} subtitle={r.why_it_matches}>
            <p className="text-sm text-slate-600">Downside: {r.possible_downside}</p>
            <p className="text-sm">Best for: {r.best_for.join(', ')}</p>
            <p className="mt-1 text-sm">Top places: {r.top_places.map((p) => p.name).join(', ')}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
