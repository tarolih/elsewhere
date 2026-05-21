import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from '../hooks/useAuth'

const TRAVELER_TYPES = [
  { value: 'solo', label: 'Solo', emoji: '🧭' },
  { value: 'couple', label: 'Couple', emoji: '🫶' },
  { value: 'group', label: 'Group', emoji: '🎉' },
  { value: 'girls_trip', label: "Girls' Trip", emoji: '✨' },
  { value: 'digital_nomad', label: 'Digital Nomad', emoji: '💻' },
  { value: 'family', label: 'Family', emoji: '🏡' },
]

const VIBE_OPTIONS = [
  { value: 'social', label: 'Social' },
  { value: 'nature', label: 'Nature' },
  { value: 'beach', label: 'Beach' },
  { value: 'culture', label: 'Culture' },
  { value: 'food', label: 'Foodie' },
  { value: 'party', label: 'Party' },
  { value: 'surf', label: 'Surf' },
  { value: 'digital_nomad', label: 'Nomad-friendly' },
  { value: 'hidden_gem', label: 'Hidden gems' },
  { value: 'luxury', label: 'Luxury' },
]

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget', desc: 'Hostels & street food' },
  { value: 'medium', label: 'Comfort', desc: 'Mid-range & local spots' },
  { value: 'luxury', label: 'Luxury', desc: 'Boutique & fine dining' },
]

function OnboardingWizard({ token, onDone }) {
  const [step, setStep] = useState(1)
  const [travelerType, setTravelerType] = useState('solo')
  const [vibes, setVibes] = useState([])
  const [budget, setBudget] = useState('medium')
  const [saving, setSaving] = useState(false)

  const toggleVibe = (v) =>
    setVibes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))

  const finish = async () => {
    setSaving(true)
    try {
      await apiFetch(
        '/api/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            traveler_type: travelerType,
            preferred_vibes: vibes,
            preferred_budget: budget,
            interests: vibes,
          }),
        },
        token,
      )
      onDone()
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="cozy-card rounded-3xl p-6 space-y-6">
      {/* progress dots */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: step === s ? '2rem' : '0.5rem',
              background: step >= s ? 'var(--accent)' : 'var(--muted)',
            }}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="page-title text-xl font-semibold text-center">Who's travelling?</h2>
          <div className="grid grid-cols-3 gap-2">
            {TRAVELER_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTravelerType(t.value)}
                className="flex flex-col items-center gap-1 rounded-2xl p-3 text-sm font-medium transition-all"
                style={{
                  background: travelerType === t.value ? 'var(--accent)' : 'var(--card)',
                  color: travelerType === t.value ? '#fff' : 'var(--ink)',
                  boxShadow: travelerType === t.value ? '0 4px 14px rgba(210,105,30,0.3)' : 'none',
                }}
              >
                <span className="text-2xl">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="cozy-button w-full mt-2">Next →</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="page-title text-xl font-semibold text-center">What's your vibe?</h2>
          <p className="page-subtitle text-sm text-center">Pick everything that feels like you</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {VIBE_OPTIONS.map((v) => (
              <button
                key={v.value}
                onClick={() => toggleVibe(v.value)}
                className="pill-button text-sm"
                style={vibes.includes(v.value) ? {
                  background: 'var(--accent)',
                  color: '#fff',
                  border: '1.5px solid var(--accent)',
                } : {}}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setStep(1)} className="pill-button flex-1">← Back</button>
            <button onClick={() => setStep(3)} className="cozy-button flex-1" disabled={vibes.length === 0}>Next →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="page-title text-xl font-semibold text-center">Your travel budget?</h2>
          <div className="space-y-2">
            {BUDGET_OPTIONS.map((b) => (
              <button
                key={b.value}
                onClick={() => setBudget(b.value)}
                className="w-full rounded-2xl p-4 text-left transition-all"
                style={{
                  background: budget === b.value ? 'var(--accent)' : 'var(--card)',
                  color: budget === b.value ? '#fff' : 'var(--ink)',
                  border: budget === b.value ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                  boxShadow: budget === b.value ? '0 4px 14px rgba(210,105,30,0.25)' : 'none',
                }}
              >
                <div className="font-semibold">{b.label}</div>
                <div className="text-xs mt-0.5 opacity-75">{b.desc}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setStep(2)} className="pill-button flex-1">← Back</button>
            <button onClick={finish} disabled={saving} className="cozy-button flex-1">
              {saving ? 'Saving…' : "Let's go ✦"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { user, token, login, register, loadMe, logout } = useAuth()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => { if (token) loadMe() }, [token, loadMe])

  const fetchProfile = useCallback(async () => {
    if (!token) return
    try {
      const p = await apiFetch('/api/profile', {}, token)
      setProfile(p)
    } catch { /* ignore */ }
  }, [token])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const submit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
        setShowOnboarding(true)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onboardingDone = async () => {
    setShowOnboarding(false)
    await fetchProfile()
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '?'
  const vibeLabels = { social: 'Social', nature: 'Nature', beach: 'Beach', culture: 'Culture', food: 'Foodie', party: 'Party', surf: 'Surf', digital_nomad: 'Nomad', hidden_gem: 'Hidden gems', luxury: 'Luxury' }
  const travelerLabels = { solo: '🧭 Solo', couple: '🫶 Couple', group: '🎉 Group', girls_trip: '✨ Girls\' Trip', digital_nomad: '💻 Nomad', family: '🏡 Family' }

  if (token && showOnboarding) {
    return (
      <div className="px-4 pt-6 pb-24 max-w-md mx-auto space-y-4">
        <div className="cozy-hero rounded-3xl px-6 py-8 text-center">
          <h1 className="page-title text-2xl font-bold">Welcome to Elsewhere ✦</h1>
          <p className="page-subtitle mt-1 text-sm">Let's build your travel identity</p>
        </div>
        <OnboardingWizard token={token} onDone={onboardingDone} />
      </div>
    )
  }

  if (token && user) {
    return (
      <div className="px-4 pt-6 pb-24 max-w-md mx-auto space-y-4">
        {/* Avatar card */}
        <div className="cozy-card rounded-3xl p-6 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate" style={{ color: 'var(--ink)' }}>{user.email}</div>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className="pill-button text-xs py-0.5 px-2">
                ✦ {user.vibe_points} vibe pts
              </span>
              <span className="pill-button text-xs py-0.5 px-2">
                Lv.{user.trust_level} explorer
              </span>
            </div>
          </div>
        </div>

        {/* Travel DNA */}
        {profile && (
          <div className="cozy-card rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="page-title font-semibold">Your Travel DNA</h2>
              <button
                onClick={() => setShowOnboarding(true)}
                className="pill-button text-xs px-3 py-1"
              >
                Edit
              </button>
            </div>

            {profile.traveler_type && (
              <div>
                <p className="page-subtitle text-xs mb-1">Traveller type</p>
                <span className="pill-button-active text-sm">
                  {travelerLabels[profile.traveler_type] ?? profile.traveler_type}
                </span>
              </div>
            )}

            {profile.preferred_vibes?.length > 0 && (
              <div>
                <p className="page-subtitle text-xs mb-1">Vibes</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.preferred_vibes.map((v) => (
                    <span key={v} className="pill-button-active text-xs">{vibeLabels[v] ?? v}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.preferred_budget && (
              <div>
                <p className="page-subtitle text-xs mb-1">Budget</p>
                <span className="pill-button-active text-sm capitalize">{profile.preferred_budget}</span>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => { logout(); setProfile(null) }}
          className="w-full pill-button py-3 text-sm"
          style={{ color: 'var(--ink-light)' }}
        >
          Sign out
        </button>
      </div>
    )
  }

  // Auth form
  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto space-y-4">
      <div className="cozy-hero rounded-3xl px-6 py-10 text-center">
        <h1 className="page-title text-2xl font-bold">Your travel identity</h1>
        <p className="page-subtitle mt-1 text-sm">Find places that truly match you</p>
      </div>

      <div className="cozy-card rounded-3xl p-6 space-y-5">
        {/* tabs */}
        <div className="flex rounded-2xl p-1" style={{ background: 'var(--bg-peach)' }}>
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === t ? 'var(--card)' : 'transparent',
                color: tab === t ? 'var(--ink)' : 'var(--ink-light)',
                boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
              }}
            >
              {t === 'login' ? 'Sign in' : 'Join free'}
            </button>
          ))}
        </div>

        {/* inputs */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="cozy-input w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="cozy-input w-full"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          onClick={submit}
          disabled={loading || !email || !password}
          className="cozy-button w-full"
          style={{ opacity: loading || !email || !password ? 0.6 : 1 }}
        >
          {loading ? 'One moment…' : tab === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--ink-light)' }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError('') }} className="underline">
            {tab === 'login' ? 'Join free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
