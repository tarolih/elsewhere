import { Navigate, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import DiscoverPage from './pages/DiscoverPage'
import SearchPage from './pages/SearchPage'
import ExperiencePage from './pages/ExperiencePage'
import IdeasPage from './pages/IdeasPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <div className="app-shell">
      <div className="app-glow app-glow-a" />
      <div className="app-glow app-glow-b" />
      <div className="content-wrap mx-auto min-h-screen max-w-xl px-4 py-5">
        <Routes>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/ideas" element={<IdeasPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <NavBar />
      </div>
    </div>
  )
}
