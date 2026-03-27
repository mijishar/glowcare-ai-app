import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Sparkles, Home as HomeIcon, Clock, Camera, TrendingUp, MessageCircle, Trophy } from 'lucide-react'
import Home from './pages/Home'
import History from './pages/History'
import PhotoAnalysis from './pages/PhotoAnalysis'
import SkinProgress from './pages/SkinProgress'
import DermChat from './pages/DermChat'
import Achievements from './pages/Achievements'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans">
        {/* Premium header */}
        <header className="sticky top-0 z-50 glass border-b border-white/40 shadow-card">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-premium flex items-center justify-center shadow-glow-teal">
                <Sparkles size={17} className="text-white" />
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-teal-600 via-cyan-500 to-violet-500 bg-clip-text text-transparent tracking-tight">
                GlowCare AI
              </span>
            </div>

            {/* Nav */}
            <div className="flex gap-0.5 flex-wrap">
              {[
                { to: '/',             end: true,  icon: <HomeIcon size={12} />,       label: 'Home' },
                { to: '/analyze',      end: false, icon: <Camera size={12} />,         label: 'Scan' },
                { to: '/chat',         end: false, icon: <MessageCircle size={12} />,  label: 'Chat' },
                { to: '/progress',     end: false, icon: <TrendingUp size={12} />,     label: 'Progress' },
                { to: '/achievements', end: false, icon: <Trophy size={12} />,         label: 'Badges' },
                { to: '/history',      end: false, icon: <Clock size={12} />,          label: 'History' },
              ].map(({ to, end, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-glow-teal'
                        : 'text-gray-500 hover:text-teal-600 hover:bg-teal-50'
                    }`
                  }
                >
                  {icon} {label}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<PhotoAnalysis />} />
            <Route path="/chat" element={<DermChat />} />
            <Route path="/progress" element={<SkinProgress />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
