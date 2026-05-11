import React, { createContext, useContext, useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import FloatingChat from './components/FloatingChat'
import LoadingSkeleton from './components/LoadingSkeleton'

// Contexts
export const LangContext = createContext({ lang: 'en', setLang: () => {} })
export const DarkContext = createContext({ dark: true, setDark: () => {} })
export const ProgressContext = createContext({ progress: {}, setProgress: () => {} })
export const AuthContext = createContext({ user: null, logout: () => {} })

// Public pages
const Landing = lazy(() => import('./pages/Landing'))
const Login   = lazy(() => import('./pages/Login'))
const Signup  = lazy(() => import('./pages/Signup'))

// Protected pages
const Home         = lazy(() => import('./pages/Home'))
const Registration = lazy(() => import('./pages/Registration'))
const Candidates   = lazy(() => import('./pages/Candidates'))
const Polling      = lazy(() => import('./pages/Polling'))
const HowToVote    = lazy(() => import('./pages/HowToVote'))
const Results      = lazy(() => import('./pages/Results'))
const ValuesMatch  = lazy(() => import('./pages/ValuesMatch'))
const Debate       = lazy(() => import('./pages/Debate'))
const FactCheck    = lazy(() => import('./pages/FactCheck'))
const Constituency = lazy(() => import('./pages/Constituency'))
const Timeline     = lazy(() => import('./pages/Timeline'))
const FirstTime    = lazy(() => import('./pages/FirstTime'))
const Chat         = lazy(() => import('./pages/Chat'))
const Rights       = lazy(() => import('./pages/Rights'))
const Budget       = lazy(() => import('./pages/Budget'))
const Manifestos   = lazy(() => import('./pages/Manifestos'))
const Quiz         = lazy(() => import('./pages/Quiz'))
const Scorecard    = lazy(() => import('./pages/Scorecard'))
const Progress     = lazy(() => import('./pages/Progress'))

function RequireAuth({ children }) {
  const { user } = useContext(AuthContext)
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<LoadingSkeleton />}>
            <Routes>
              <Route path="/home"         element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/registration" element={<RequireAuth><Registration /></RequireAuth>} />
              <Route path="/candidates"   element={<RequireAuth><Candidates /></RequireAuth>} />
              <Route path="/polling"      element={<RequireAuth><Polling /></RequireAuth>} />
              <Route path="/how-to-vote"  element={<RequireAuth><HowToVote /></RequireAuth>} />
              <Route path="/results"      element={<RequireAuth><Results /></RequireAuth>} />
              <Route path="/values-match" element={<RequireAuth><ValuesMatch /></RequireAuth>} />
              <Route path="/debate"       element={<RequireAuth><Debate /></RequireAuth>} />
              <Route path="/factcheck"    element={<RequireAuth><FactCheck /></RequireAuth>} />
              <Route path="/constituency" element={<RequireAuth><Constituency /></RequireAuth>} />
              <Route path="/timeline"     element={<RequireAuth><Timeline /></RequireAuth>} />
              <Route path="/first-time"   element={<RequireAuth><FirstTime /></RequireAuth>} />
              <Route path="/chat"         element={<RequireAuth><Chat /></RequireAuth>} />
              <Route path="/rights"       element={<RequireAuth><Rights /></RequireAuth>} />
              <Route path="/budget"       element={<RequireAuth><Budget /></RequireAuth>} />
              <Route path="/manifestos"   element={<RequireAuth><Manifestos /></RequireAuth>} />
              <Route path="/quiz"         element={<RequireAuth><Quiz /></RequireAuth>} />
              <Route path="/scorecard"    element={<RequireAuth><Scorecard /></RequireAuth>} />
              <Route path="/progress"     element={<RequireAuth><Progress /></RequireAuth>} />
              <Route path="*"            element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </main>
        <MobileNav />
      </div>

      <FloatingChat />
    </div>
  )
}

function MobileNav() {
  const navItems = [
    { path: '/home',      icon: '🏠', label: 'Home' },
    { path: '/candidates',icon: '👤', label: 'Candidates' },
    { path: '/factcheck', icon: '🔍', label: 'Fact Check' },
    { path: '/chat',      icon: '💬', label: 'Chat' },
    { path: '/quiz',      icon: '🏆', label: 'Quiz' },
  ]
  return (
    <nav className="lg:hidden flex items-center bg-card border-t border-border safe-bottom">
      {navItems.map(item => (
        <a key={item.path} href={item.path}
          className="flex-1 flex flex-col items-center py-2 text-white/50 hover:text-primary transition-colors text-xs gap-0.5">
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  )
}

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')
  const [dark] = useState(true)
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('civic_progress') || '{}') } catch { return {} }
  })
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vs_user') || 'null') } catch { return null }
  })

  useEffect(() => { localStorage.setItem('lang', lang) }, [lang])
  useEffect(() => { localStorage.setItem('civic_progress', JSON.stringify(progress)) }, [progress])

  const logout = () => {
    localStorage.removeItem('vs_user')
    setUser(null)
  }

  const setProgressItem = (key, value) => setProgress(prev => ({ ...prev, [key]: value }))

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <LangContext.Provider value={{ lang, setLang }}>
        <DarkContext.Provider value={{ dark, setDark: () => {} }}>
          <ProgressContext.Provider value={{ progress, setProgress: setProgressItem }}>
            <BrowserRouter>
              <Suspense fallback={<LoadingSkeleton />}>
                <Routes>
                  {/* Public */}
                  <Route path="/"       element={user ? <Navigate to="/home" replace /> : <Landing />} />
                  <Route path="/login"  element={user ? <Navigate to="/home" replace /> : <Login />} />
                  <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <Signup />} />
                  {/* Protected — all other routes inside AppShell */}
                  <Route path="/*" element={<AppShell />} />
                </Routes>
              </Suspense>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: { background: '#12121a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
                }}
              />
            </BrowserRouter>
          </ProgressContext.Provider>
        </DarkContext.Provider>
      </LangContext.Provider>
    </AuthContext.Provider>
  )
}
