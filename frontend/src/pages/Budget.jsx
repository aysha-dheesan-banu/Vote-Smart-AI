import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { getData } from '../utils/api'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function Budget() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [revealedFacts, setRevealedFacts] = useState({})

  const load = () => {
    setLoading(true)
    setError(null)
    getData('budget')
      .then(setData)
      .catch(() => setError('Failed to load budget data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 text-xs max-w-xs shadow-card">
          <p className="font-semibold text-white mb-1">{d.name || d.party || d.category}</p>
          <p className="text-primary font-bold">₹{(payload[0].value).toLocaleString('en-IN')} Crore (est.)</p>
          {d.source && <p className="text-white/50 mt-1">📌 {d.source}</p>}
          {d.details && <p className="text-white/40 mt-1">{d.details}</p>}
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

  const { meta, key_stats, spending_breakdown, party_spending, candidate_limits, verified_facts, reporting_channels } = data

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader icon="💰" title="Election Budget Tracker" subtitle="2024 Lok Sabha election spending — sourced from official ECI, ADR India, CMS India data" badge="Cited Real Data" />

      {/* Source banner */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 mb-6">
        <p className="font-semibold mb-1">📌 Data Sources:</p>
        <p>{meta.primary_sources?.join(' • ')}</p>
      </div>

      {/* Key stats from backend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {key_stats?.map(s => (
          <div key={s.label} className="card text-center">
            <p className="font-sora font-extrabold text-xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold text-white/70 mt-1">{s.label}</p>
            <p className="text-xs text-white/40 mt-0.5">{s.note}</p>
            <p className="text-xs text-white/25 mt-1">📌 {s.source}</p>
            {s.official && <span className="text-xs text-green-400">✓ Official</span>}
          </div>
        ))}
      </div>

      {/* Spending breakdown */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-1">Estimated Expenditure Breakdown (₹ Crore)</h3>
        <p className="text-xs text-white/40 mb-4">Hover bars for source citations</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={spending_breakdown} layout="vertical" margin={{ top: 0, right: 90, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${v/1000}K` : v} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 9 }} width={200} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {spending_breakdown?.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 space-y-1">
          {spending_breakdown?.filter(s => s.official).map(s => (
            <p key={s.name} className="text-xs text-green-400">✓ Official: {s.name} — {s.source}</p>
          ))}
        </div>
      </div>

      {/* Party spending */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-1">Estimated Party Campaign Spending (₹ Crore)</h3>
        <p className="text-xs text-white/40 mb-4">Source: ADR India analysis and party expenditure statements to ECI</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={party_spending} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <XAxis dataKey="party" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={v => `₹${v}Cr`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
              {party_spending?.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Official limits */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-1">📋 Official Candidate Spending Limits</h3>
        <p className="text-xs text-white/40 mb-4">Source: {candidate_limits?.[0]?.source}</p>
        <div className="space-y-2">
          {candidate_limits?.map(l => (
            <div key={l.category} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="text-sm font-semibold text-white">{l.category}</p>
                <p className="text-xs text-white/40">{l.note}</p>
                <p className="text-xs text-white/25">📌 {l.source}</p>
              </div>
              <span className="ml-auto font-sora font-bold text-gold flex-shrink-0">{l.limit}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          ⚠️ Exceeding these limits is an election offense under Sections 77, 123(6) of RPA 1951. Report via cVIGIL or call 1950.
        </div>
      </div>

      {/* Verified facts */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-4">🎯 Verified Election Finance Facts</h3>
        <div className="space-y-3">
          {verified_facts?.map((f, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm font-semibold text-white/90 mb-2">❓ {f.claim}</p>
              {revealedFacts[i] ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-sm font-bold text-secondary mb-1">✔ {f.verdict}</p>
                  <p className="text-xs text-white/60 leading-relaxed">{f.detail}</p>
                  <p className="text-xs text-white/30 mt-1.5">📌 Source: {f.source}</p>
                </motion.div>
              ) : (
                <button onClick={() => setRevealedFacts(r => ({ ...r, [i]: true }))} className="btn-ghost text-xs px-3 py-1.5">
                  Reveal Verified Answer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reporting channels */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-3">🚨 Report Election Finance Violations</h3>
        <div className="space-y-2">
          {reporting_channels?.map(c => (
            <div key={c.name} className="flex items-start gap-3 text-sm text-white/70">
              <span className="text-primary mt-0.5 flex-shrink-0">→</span>
              <div>
                <strong className="text-white">{c.name}</strong> — {c.detail}
                {c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-secondary hover:underline text-xs inline-flex items-center gap-0.5">
                    <ExternalLink size={10} /> {c.url.replace('https://', '')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
