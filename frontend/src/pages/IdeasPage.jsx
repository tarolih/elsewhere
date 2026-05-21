import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import Card from '../components/Card'

export default function IdeasPage() {
  const { token } = useAuth()
  const [ideas, setIdeas] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')

  const load = () => apiFetch('/api/ideas').then(setIdeas)
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!token) return setMessage('Login required')
    await apiFetch('/api/ideas', { method: 'POST', body: JSON.stringify({ title, description, category: 'product' }) }, token)
    setTitle(''); setDescription(''); setMessage('Idea submitted'); load()
  }

  const vote = async (id) => {
    if (!token) return setMessage('Login required')
    await apiFetch(`/api/ideas/${id}/vote`, { method: 'POST' }, token)
    load()
  }

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold">Ideas</h1>
      <Card title="Submit an idea">
        <input className="w-full rounded border p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="mt-2 w-full rounded border p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={submit} className="mt-2 rounded bg-ocean px-3 py-2 text-white">Submit</button>
      </Card>
      {message && <p className="text-sm text-ocean">{message}</p>}
      {ideas.map((i) => (
        <Card key={i.id} title={i.title} subtitle={`${i.status} • votes ${i.vote_count}`}>
          <p className="text-sm">{i.description}</p>
          <button onClick={() => vote(i.id)} className="mt-2 rounded bg-slate-100 px-3 py-1">Vote</button>
        </Card>
      ))}
    </div>
  )
}
