import React, { createContext, useContext, useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import FloatingChat from './components/FloatingChat'
import LoadingSkeleton from './components/LoadingSkeleton'

// Contexts
export const LangContext = createContext({ lang: 'en', setLang: () => {} })
export const DarkContext = createContext({ dark: true, setDark: () => {} })
export const ProgressContext = createContext({ progress: {}, setProgress: () => {} })

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'))
const Registration = lazy(() => import('./pages/Registration'))
const Candidates = lazy(() => import('./pages/Candidates'))
const Polling = lazy(() => import('./pages/Polling'))
const HowToVote = lazy(() => import('./pages/HowToVote'))
const Results = lazy(() => import('./pages/Results'))
const ValuesMatch = lazy(() => import('./pages/ValuesMatch'))
const Debate = lazy(() => import('./pages/Debate'))
const FactCheck = lazy(() => import('./pages/FactCheck'))
const Constituency = lazy(() => import('./pages/Constituency'))
const Timeline = lazy(() => import('./pages/Timeline'))
const FirstTime = lazy(() => import('./pages/FirstTime'))
const Chat = lazy(() => import('./pages/Chat'))
const Rights = lazy(() => import('./pages/Rights'))
const Budget = lazy(() => import('./pages/Budget'))
const Manifestos = lazy(() => import('./pages/Manifestos'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Scorecard = lazy(() => import('./pages/Scorecard'))
const Progress = lazy(() => import('./pages/Progress'))

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
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
              <Route path="/" element={<Home />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/polling" element={<Polling />} />
              <Route path="/how-to-vote" element={<HowToVote />} />
              <Route path="/results" element={<Results />} />
              <Route path="/values-match" element={<ValuesMatch />} />
              <Route path="/debate" element={<Debate />} />
              <Route path="/factcheck" element={<FactCheck />} />
              <Route path="/constituency" element={<Constituency />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/first-time" element={<FirstTime />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/rights" element={<Rights />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/manifestos" element={<Manifestos />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/scorecard" element={<Scorecard />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>

      <FloatingChat />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12121a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </div>
  )
}

function MobileNav() {
  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/candidates', icon: '👤', label: 'Candidates' },
    { path: '/factcheck', icon: '🔍', label: 'Fact Check' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    { path: '/quiz', icon: '🏆', label: 'Quiz' },
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
  const [dark, setDark] = useState(() => {
    const d = localStorage.getItem('dark')
    return d === null ? true : d === 'true'
  })
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('civic_progress') || '{}') }
    catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  useEffect(() => {
    localStorage.setItem('dark', String(dark))
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  useEffect(() => {
    localStorage.setItem('civic_progress', JSON.stringify(progress))
  }, [progress])

  const setProgressItem = (key, value) => {
    setProgress(prev => ({ ...prev, [key]: value }))
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <DarkContext.Provider value={{ dark, setDark }}>
        <ProgressContext.Provider value={{ progress, setProgress: setProgressItem }}>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </ProgressContext.Provider>
      </DarkContext.Provider>
    </LangContext.Provider>
  )
}
