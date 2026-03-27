import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Sparkles, Home as HomeIcon, Clock } from 'lucide-react'
import Home from './pages/Home'
import History from './pages/History'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
          <nav className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-rose-500 to-pink-400 bg-clip-text text-transparent">
                GlowCare AI
              </span>
            </div>
            <div className="flex gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    isActive
                      ? 'bg-rose-100 text-rose-600'
                      : 'text-gray-500 hover:text-rose-400 hover:bg-rose-50'
                  }`
                }
              >
                <HomeIcon size={14} />
                Home
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    isActive
                      ? 'bg-rose-100 text-rose-600'
                      : 'text-gray-500 hover:text-rose-400 hover:bg-rose-50'
                  }`
                }
              >
                <Clock size={14} />
                History
              </NavLink>
            </div>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
