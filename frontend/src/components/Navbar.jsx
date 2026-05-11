import React, { useContext, useState, useEffect } from 'react'
import { Menu, Globe, Zap, LogOut } from 'lucide-react'
import { LangContext, DarkContext, AuthContext } from '../App'
import { useNavigate } from 'react-router-dom'

function useCountdown() {
  const electionDay = new Date('2027-02-15').getTime()
  const [days, setDays] = useState(0)
  useEffect(() => {
    const tick = () => setDays(Math.max(0, Math.floor((electionDay - Date.now()) / 86400000)))
    tick()
    const t = setInterval(tick, 60000)
    return () => clearInterval(t)
  }, [])
  return days
}

export default function Navbar({ onMenuClick }) {
  const { lang, setLang } = useContext(LangContext)
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const days = useCountdown()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border flex-shrink-0">
      <button onClick={onMenuClick} className="lg:hidden btn-ghost p-2">
        <Menu size={20} />
      </button>

      <a href="/home" className="flex items-center gap-2 mr-auto">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-sora font-bold text-white hidden sm:block">
          Vote<span className="text-primary">Smart</span> AI
        </span>
      </a>

      {/* Countdown pill */}
      <div className="hidden md:flex items-center gap-1.5 bg-gold/10 border border-gold/30 rounded-full px-3 py-1 text-xs text-gold font-semibold">
        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        UP/Punjab 2027 — {days} days
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
        className="btn-ghost flex items-center gap-1.5 text-xs font-semibold"
      >
        <Globe size={15} />
        {lang === 'en' ? 'हिंदी' : 'EN'}
      </button>

      {/* User + logout */}
      {user && (
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-white/70 font-medium max-w-[80px] truncate">{user.name}</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost p-2 text-white/50 hover:text-red-400 transition-colors" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      )}
    </header>
  )
}
