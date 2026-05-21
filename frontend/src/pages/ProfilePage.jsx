import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function ProfilePage() {
  const { user, token, login, register, loadMe, logout } = useAuth()
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password123')
  const [message, setMessage] = useState('')

  useEffect(() => { if (token) loadMe() }, [token, loadMe])

  const run = async (type) => {
    try {
      if (type === 'login') await login(email, password)
      else await register(email, password)
      setMessage('Success')
    } catch (e) {
      setMessage(e.message)
    }
  }

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold">Profile</h1>
      {!user ? (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <input className="mb-2 w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="mb-2 w-full rounded border p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={() => run('register')} className="rounded bg-ocean px-3 py-2 text-white">Register</button>
            <button onClick={() => run('login')} className="rounded bg-slate-700 px-3 py-2 text-white">Login</button>
          </div>
          {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p>{user.email}</p>
          <p>Vibe Points: {user.vibe_points}</p>
          <p>Trust Level: {user.trust_level}</p>
          <button onClick={logout} className="mt-2 rounded bg-slate-200 px-3 py-1">Logout</button>
        </div>
      )}
    </div>
  )
}
