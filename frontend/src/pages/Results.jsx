import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { getData } from '../utils/api'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import LoadingSkeleton from '../components/LoadingSkeleton'

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const step = target / 50
    let c = 0
    const t = setInterval(() => {
      c = Math.min(c + step, target)
      setCount(Math.round(c))
      if (c >= target) clearInterval(t)
    }, 20)
    return () => clearInterval(t)
  }, [target])
  return <span>{count.toLocaleString('en-IN')}{suffix}</span>
}

export default function Results() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getData('results')
      .then(setData)
      .catch(() => setError('Failed to load results. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs max-w-xs shadow-card">
          <p className="font-semibold text-white">{d.party || d.name || d.phase}</p>
          <p className="text-primary">{payload[0].value}{typeof payload[0].value === 'number' && payload[0].name === 'turnout' ? '%' : ' seats'}</p>
          {d.vote_share && <p className="text-white/50">Vote share: {d.vote_share}</p>}
          {d.parties && <p className="text-white/40 mt-1">{d.parties}</p>}
          {d.seats && d.phase && <p className="text-white/50">{d.seats} constituencies</p>}
        </div>
      )
    }
    return null
  }

  if (loading) return <LoadingSkeleton />
  if (error) return (
    <div className="p-6 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={load} className="btn-primary flex items-center gap-2 mx-auto"><RefreshCw size={14} /> Retry</button>
    </div>
  )
  if (!data) return null

  const { meta, winner, alliances, party_results, phase_turnout, state_results, notable_constituencies, key_facts } = data

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader icon="📊" title={`${meta.election} Results`} subtitle={`Official results — Source: ${meta.source}`} badge="Official ECI Data" />

      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-400 mb-6 flex items-start gap-2">
        <span className="font-semibold flex-shrink-0">📌 Source:</span>
        <span>{meta.source} — Final declared {meta.declared}. {meta.total_votes_cast?.toLocaleString('en-IN')} votes cast at {meta.national_turnout}% national turnout.</span>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Seats', value: meta.total_seats, note: 'Lok Sabha constituencies', color: 'text-white', suffix: '' },
          { label: 'NDA Won', value: alliances[0]?.seats, note: alliances[0]?.composition || alliances[0]?.parties, color: 'text-orange-400', suffix: '' },
          { label: 'INDIA Won', value: alliances[1]?.seats, note: alliances[1]?.parties?.split('+')[0]?.trim(), color: 'text-blue-400', suffix: '' },
          { label: 'National Turnout', value: meta.national_turnout, note: `${(meta.total_votes_cast/10000000).toFixed(0)} crore votes cast`, color: 'text-secondary', suffix: '%' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`font-sora font-extrabold text-2xl ${s.color}`}><AnimatedCounter target={s.value} suffix={s.suffix} /></p>
            <p className="text-xs font-semibold text-white/70 mt-1">{s.label}</p>
            <p className="text-xs text-white/40 mt-0.5 truncate">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Winner card */}
      <div className="card mb-6 border border-orange-500/30 bg-orange-500/5">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🏆</div>
          <div className="flex-1">
            <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-1">Winner — {meta.election}</p>
            <h3 className="font-sora font-bold text-xl">{winner.alliance} Coalition — {winner.seats} Seats</h3>
            <p className="text-sm text-white/60 mt-0.5">{winner.composition}</p>
            <p className="text-xs text-white/40 mt-1">{winner.pm} sworn in as PM — {winner.sworn_in} ({winner.term})</p>
          </div>
          <a href="https://results.eci.gov.in" target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center gap-1 flex-shrink-0">
            <ExternalLink size={11} /> ECI Data
          </a>
        </div>
      </div>

      {/* Party bar chart */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-1">Party-wise Seat Count</h3>
        <p className="text-xs text-white/40 mb-4">Source: {meta.source}</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={party_results} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <XAxis dataKey="party" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="seats" radius={[4, 4, 0, 0]}>
              {party_results.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alliance pie + Turnout chart */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="font-sora font-semibold mb-1">Alliance Distribution</h3>
          <p className="text-xs text-white/40 mb-3">Source: ECI 2024</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={alliances} dataKey="seats" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                label={({ name, seats }) => `${name}: ${seats}`} labelLine={false}>
                {alliances.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {alliances.map(a => <p key={a.name} className="text-xs text-white/40 truncate">{a.name}: {a.parties}</p>)}
          </div>
        </div>

        <div className="card">
          <h3 className="font-sora font-semibold mb-1">Phase-wise Voter Turnout (%)</h3>
          <p className="text-xs text-white/40 mb-3">Source: ECI Phase-wise reports 2024</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={phase_turnout} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
              <YAxis domain={[55, 75]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="turnout" stroke="#00f5d4" strokeWidth={2} dot={{ fill: '#00f5d4', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State-wise results */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-1">State-wise Results</h3>
        <p className="text-xs text-white/40 mb-4">Source: ECI state-wise results 2024 | NDA = orange • INDIA = blue • Others = grey | Right = turnout %</p>
        <div className="space-y-2">
          {state_results.map(s => (
            <div key={s.state} className="flex items-center gap-3">
              <span className="text-xs text-white/60 w-28 flex-shrink-0 truncate">{s.state}</span>
              <div className="flex-1 flex h-5 rounded overflow-hidden gap-px">
                <div className="bg-orange-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${(s.nda / s.total) * 100}%` }}>
                  {s.nda > 3 ? s.nda : ''}
                </div>
                <div className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${(s.india / s.total) * 100}%` }}>
                  {s.india > 3 ? s.india : ''}
                </div>
                {s.others > 0 && <div className="bg-gray-500" style={{ width: `${(s.others / s.total) * 100}%` }} />}
              </div>
              <span className="text-xs text-white/40 w-7 text-right flex-shrink-0">{s.total}</span>
              <span className="text-xs text-secondary w-12 text-right flex-shrink-0">{s.turnout}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notable constituencies */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-1">Notable Constituency Results</h3>
        <p className="text-xs text-white/40 mb-4">Source: ECI constituency-level results 2024</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left pb-2">Constituency</th>
                <th className="text-left pb-2">Winner</th>
                <th className="text-right pb-2">Votes</th>
                <th className="text-right pb-2">Margin</th>
                <th className="text-right pb-2">Turnout</th>
              </tr>
            </thead>
            <tbody>
              {notable_constituencies.map((r, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2 font-semibold">{r.constituency}</td>
                  <td className="py-2 text-white/70">{r.winner}</td>
                  <td className="py-2 text-right text-white/60">{r.votes.toLocaleString('en-IN')}</td>
                  <td className="py-2 text-right text-primary">{r.margin.toLocaleString('en-IN')}</td>
                  <td className="py-2 text-right text-secondary">{r.turnout}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key facts */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-3">🔑 Key Facts from 2024 Election</h3>
        <ul className="space-y-2">
          {key_facts.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
              <span className="text-primary mt-0.5 flex-shrink-0">→</span> {f}
            </li>
          ))}
        </ul>
      </div>

      <a href="https://results.eci.gov.in" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 btn-secondary w-full mb-4">
        <ExternalLink size={14} /> View Full Official Results at results.eci.gov.in
      </a>

      <Footer />
    </div>
  )
}
