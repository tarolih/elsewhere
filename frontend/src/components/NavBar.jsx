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
    <nav className="fixed bottom-3 left-0 right-0 z-20 px-3">
      <div className="cozy-card mx-auto flex max-w-xl justify-between rounded-2xl px-2 py-2 text-sm">
        {tabs.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `rounded-full px-3 py-1.5 font-medium transition-colors ${
                isActive
                  ? 'pill-button-active text-rose-900'
                  : 'text-slate-600 hover:bg-white/80'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
