import React, { useContext, useState, useEffect } from 'react'
import { Menu, Sun, Moon, Globe, Zap } from 'lucide-react'
import { LangContext, DarkContext } from '../App'

function useCountdown() {
  // UP, Punjab, Goa, Uttarakhand elections — Feb 2027 (next major election after 2026 state elections)
  const electionDay = new Date('2027-02-15').getTime()
  const [days, setDays] = useState(0)
  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      setDays(Math.max(0, Math.floor((electionDay - now) / 86400000)))
    }
    tick()
    const t = setInterval(tick, 60000)
    return () => clearInterval(t)
  }, [])
  return days
}

export default function Navbar({ onMenuClick }) {
  const { lang, setLang } = useContext(LangContext)
  const { dark, setDark } = useContext(DarkContext)
  const days = useCountdown()

  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border flex-shrink-0">
      <button onClick={onMenuClick} className="lg:hidden btn-ghost p-2">
        <Menu size={20} />
      </button>

      <a href="/" className="flex items-center gap-2 mr-auto">
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
        title="Toggle language"
      >
        <Globe size={15} />
        {lang === 'en' ? 'हिंदी' : 'EN'}
      </button>

      {/* Dark mode toggle */}
      <button onClick={() => setDark(d => !d)} className="btn-ghost p-2">
        {dark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </header>
  )
}
