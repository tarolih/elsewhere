import { NavLink } from 'react-router-dom'

const tabs = [
  ['/', 'Discover'],
  ['/search', 'Search'],
  ['/experience', 'Add'],
  ['/ideas', 'Ideas'],
  ['/profile', 'Profile'],
]

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-xl justify-between px-3 py-2 text-sm">
        {tabs.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-3 py-1 ${isActive ? 'bg-ocean text-white' : 'text-slate-500'}`}>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
