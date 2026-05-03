import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { getTimeline } from '../utils/api'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'

function Countdown({ targetDate, label }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [targetDate])
  return (
    <div className="flex gap-2">
      {Object.entries(time).map(([k, v]) => (
        <div key={k} className="text-center">
          <div className="bg-white/10 rounded-lg px-2 py-1 font-sora font-bold text-lg text-secondary">{String(v).padStart(2, '0')}</div>
          <div className="text-xs text-white/40 mt-0.5">{k}</div>
        </div>
      ))}
    </div>
  )
}

const WINNER_COLOR = {
  BJP: '#FF6600', DMK: '#D91E27', TMC: '#00A86B', JDU: '#00BFFF',
  NC: '#008000', JMM: '#008000', LDF: '#CC0000', TDP: '#FFFF00', SKM: '#F4A460',
}

export default function Timeline() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getTimeline()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="h-8 bg-white/5 rounded animate-pulse w-1/3" />
      <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
    </div>
  )
  if (!data) return <div className="p-6 text-white/40">Failed to load timeline</div>

  const filtered = data.phases?.filter(p =>
    (filter === 'all' || p.status === filter) &&
    (categoryFilter === 'all' || p.category === categoryFilter)
  ) || []

  const nextEvent = data.phases?.find(p => p.status === 'future')
  const pastCount = data.phases?.filter(p => p.status === 'past').length || 0
  const futureCount = data.phases?.filter(p => p.status === 'future').length || 0

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        icon="📅"
        title="Indian Election Timeline"
        subtitle="2024 Lok Sabha → 2026 State Elections → 2027 & 2029 Upcoming"
        badge="2024–2029"
      />

      {/* Source note */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 mb-6">
        <p className="font-semibold mb-1">📌 Source: {data.meta?.source}</p>
        <p>{data.meta?.note}</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <p className="font-sora font-bold text-2xl text-primary">{pastCount}</p>
          <p className="text-xs text-white/50 mt-1">Completed Events</p>
        </div>
        <div className="card text-center">
          <p className="font-sora font-bold text-2xl text-gold">2026</p>
          <p className="text-xs text-white/50 mt-1">Latest State Elections</p>
        </div>
        <div className="card text-center">
          <p className="font-sora font-bold text-2xl text-secondary">{futureCount}</p>
          <p className="text-xs text-white/50 mt-1">Upcoming Elections</p>
        </div>
      </div>

      {/* Next event countdown */}
      {nextEvent && (
        <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-secondary/30 bg-secondary/5">
          <div>
            <p className="text-xs text-secondary font-semibold mb-1">⏱️ Next Scheduled Election</p>
            <p className="font-sora font-bold">{nextEvent.event}</p>
            <p className="text-xs text-white/50">{nextEvent.date} • {nextEvent.seats} seats</p>
            <p className="text-xs text-white/40 mt-1">{nextEvent.states.join(', ')}</p>
          </div>
          <div className="sm:ml-auto">
            <Countdown targetDate={nextEvent.date} />
          </div>
        </div>
      )}

      {/* 2024 Lok Sabha summary */}
      <div className="card mb-6 border-orange-500/30 bg-orange-500/5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-xs text-gold font-semibold">2024 Lok Sabha — Final Result</p>
            <p className="font-sora font-bold">NDA won 293 seats · INDIA 234 · Others 16</p>
            <p className="text-xs text-white/60 mt-0.5">PM Narendra Modi sworn in for 3rd term · June 9, 2024 · National turnout: 65.79%</p>
          </div>
          <a href="https://results.eci.gov.in" target="_blank" rel="noopener noreferrer" className="ml-auto btn-ghost text-xs flex items-center gap-1 flex-shrink-0">
            <ExternalLink size={11} /> ECI
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1">
          {['all', 'past', 'future'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${filter === f ? 'bg-primary/15 border-primary text-primary' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
              {f === 'all' ? 'All Events' : f === 'past' ? 'Completed' : 'Upcoming'}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['all', 'lok_sabha', 'state'].map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${categoryFilter === c ? 'bg-secondary/15 border-secondary text-secondary' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
              {c === 'all' ? 'All Types' : c === 'lok_sabha' ? 'Lok Sabha' : 'State'}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10" />
        <div className="space-y-4">
          {filtered.map((phase, i) => {
            const isPast = phase.status === 'past'
            const isFuture = phase.status === 'future'
            const isLS = phase.category === 'lok_sabha'
            return (
              <motion.div key={phase.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-4">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 text-sm ${
                  isPast ? 'bg-primary border-primary text-white' :
                  'bg-transparent border-secondary text-secondary'
                }`}>
                  {isPast ? '✓' : '○'}
                </div>

                <div className="flex-1 pb-4">
                  <button onClick={() => setSelected(selected === phase.id ? null : phase.id)} className="w-full text-left">
                    <div className={`card hover:border-white/20 transition-all ${selected === phase.id ? 'border-primary/30' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPast ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                              {phase.phase}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isLS ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {isLS ? 'Lok Sabha' : 'State'}
                            </span>
                            {phase.seats > 0 && <span className="text-xs text-white/40">{phase.seats} seats</span>}
                          </div>
                          <h3 className="font-sora font-semibold text-sm">{phase.event}</h3>
                          <p className="text-xs text-white/50 mt-0.5">{phase.date}</p>
                          {phase.turnout && <p className="text-xs text-secondary mt-1">Turnout: {phase.turnout}%</p>}
                        </div>
                      </div>

                      {selected === phase.id && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border">
                          <p className="text-sm text-white/70 leading-relaxed">{phase.details || phase.description}</p>
                          {phase.states && phase.states.length > 0 && phase.states[0] !== 'All States' && (
                            <div className="mt-2">
                              <p className="text-xs text-white/40 mb-1">States:</p>
                              <div className="flex flex-wrap gap-1">
                                {phase.states.slice(0, 8).map(s => <span key={s} className="text-xs bg-white/5 px-2 py-0.5 rounded">{s}</span>)}
                                {phase.states.length > 8 && <span className="text-xs text-white/40">+{phase.states.length - 8} more</span>}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* State elections grid */}
      <div className="mt-8">
        <h2 className="font-sora font-bold text-lg mb-4">State Elections 2024–2027 — All Results</h2>
        <p className="text-xs text-white/40 mb-4">Source: Election Commission of India — eci.gov.in</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.stateElections2024_2027?.map(e => (
            <div key={e.state} className={`card text-sm ${e.status === 'future' ? 'border-secondary/30 bg-secondary/5' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white">{e.state}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${e.status === 'past' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                  {e.status === 'past' ? 'Completed' : 'Upcoming'}
                </span>
              </div>
              <p className="text-xs text-white/40">{e.date}</p>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">{e.result}</p>
              {e.winner && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: WINNER_COLOR[e.winner] || '#aaa' }} />
                  <span className="text-xs font-bold" style={{ color: WINNER_COLOR[e.winner] || '#aaa' }}>{e.winner}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
