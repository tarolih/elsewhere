import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../api/client'
import Card from '../components/Card'

const vibeOptions = ['surf', 'social', 'beach', 'party', 'nature', 'food', 'culture', 'budget', 'safe', 'digital_nomad', 'hidden_gem', 'romantic', 'luxury', 'adventure']

function CozySelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const selected = options.find((option) => option.value === value) || options[0]

  return (
    <div className="cozy-select-wrap" ref={containerRef}>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <button
        type="button"
        className="cozy-input flex w-full items-center justify-between rounded-xl p-3 text-left text-sm"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selected?.label}</span>
        <svg className={`cozy-select-icon-static ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.108l3.71-3.878a.75.75 0 1 1 1.08 1.04l-4.25 4.44a.75.75 0 0 1-1.08 0l-4.25-4.44a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="cozy-select-menu mt-2 overflow-hidden rounded-2xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={`cozy-select-option w-full px-3 py-2 text-left text-sm ${option.value === value ? 'cozy-select-option-active' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DiscoverPage() {
  const [locations, setLocations] = useState([])
  const [scopeLocationId, setScopeLocationId] = useState('1')
  const [locationsStatus, setLocationsStatus] = useState('loading')
  const [locationsError, setLocationsError] = useState('')
  const [vibes, setVibes] = useState(['surf', 'social'])
  const [budget, setBudget] = useState('medium')
  const [results, setResults] = useState([])

  useEffect(() => {
    setLocationsStatus('loading')
    apiFetch('/api/locations')
      .then((data) => {
        setLocations(data)
        if (data.length > 0) {
          setScopeLocationId(String(data[0].id))
          setLocationsStatus('ready')
        } else {
          setLocationsStatus('empty')
        }
      })
      .catch((error) => {
        setLocationsStatus('error')
        setLocationsError(error.message || 'Could not load locations')
      })
  }, [])

  const toggleVibe = (vibe) => setVibes((prev) => (prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]))

  const findPlaces = async () => {
    if (locationsStatus !== 'ready') return
    const data = await apiFetch('/api/recommendations', {
      method: 'POST',
      body: JSON.stringify({ vibes, scope_location_id: Number(scopeLocationId), traveler_type: 'solo', budget }),
    })
    setResults(data)
  }

  const applyPreset = (nextVibes, nextBudget) => {
    setVibes(nextVibes)
    setBudget(nextBudget)
  }

  const scopeOptions = locations.length > 0
    ? locations.map((location) => ({ value: String(location.id), label: `${location.name} (${location.type})` }))
    : [{ value: '1', label: locationsStatus === 'loading' ? 'Loading locations...' : 'No locations available' }]

  const budgetOptions = [
    { value: 'low', label: 'Low - stretched backpacker mode' },
    { value: 'medium', label: 'Medium - balanced comfort' },
    { value: 'high', label: 'High - premium stay and spend' },
  ]

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="page-title text-4xl font-bold">Elsewhere Discover</h1>
        <p className="page-subtitle mt-1 text-sm">Build your next escape based on your mood, pace, and budget.</p>
      </div>

      <section className="cozy-hero rounded-3xl p-5 sm:p-6">
        <h2 className="page-title text-3xl font-semibold">Find a place that matches your energy</h2>
        <p className="page-subtitle mt-2 text-sm">Start with a preset, adjust your mood tags, and get recommendations in seconds.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="pill-button rounded-full px-3 py-1.5 text-sm" onClick={() => applyPreset(['beach', 'surf', 'social'], 'medium')}>
            Cozy Coast
          </button>
          <button className="pill-button rounded-full px-3 py-1.5 text-sm" onClick={() => applyPreset(['culture', 'food', 'hidden_gem'], 'medium')}>
            Slow Discovery
          </button>
          <button className="pill-button rounded-full px-3 py-1.5 text-sm" onClick={() => applyPreset(['luxury', 'romantic', 'beach'], 'high')}>
            Soft Luxury
          </button>
        </div>
        <div className="hero-metrics mt-5 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="metric-value text-lg font-semibold">{locations.length}</p>
            <p className="metric-label text-xs">Destinations</p>
          </div>
          <div>
            <p className="metric-value text-lg font-semibold">{vibes.length}</p>
            <p className="metric-label text-xs">Vibes On</p>
          </div>
          <div>
            <p className="metric-value text-lg font-semibold capitalize">{budget}</p>
            <p className="metric-label text-xs">Budget</p>
          </div>
        </div>
      </section>

      <Card title="Pick your vibe" subtitle="Choose 2-5 vibes for better matches.">
        <div className="stagger flex flex-wrap gap-2">
          {vibeOptions.map((v) => (
            <button
              key={v}
              onClick={() => toggleVibe(v)}
              className={`pill-button rounded-full px-3 py-1 text-sm capitalize ${vibes.includes(v) ? 'pill-button-active' : ''}`}
            >
              {v}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Scope + Budget" subtitle="Anchor your search and set your spend style.">
        <div className="space-y-3">
          <CozySelect
            label="Where are you looking?"
            value={scopeLocationId}
            options={scopeOptions}
            onChange={setScopeLocationId}
          />

          {locationsStatus === 'empty' && (
            <p className="text-sm text-amber-800">No locations yet. Seed your database and refresh this page.</p>
          )}

          {locationsStatus === 'error' && (
            <p className="text-sm text-rose-700">Could not load locations: {locationsError}</p>
          )}

          <CozySelect
            label="Budget comfort"
            value={budget}
            options={budgetOptions}
            onChange={setBudget}
          />
        </div>

        <button
          onClick={findPlaces}
          disabled={locationsStatus !== 'ready'}
          className="cozy-button mt-4 w-full rounded-xl px-4 py-2.5 font-semibold"
        >
          Find my places
        </button>
      </Card>

      <div className="stagger space-y-3">
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
