import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts'
import { ExternalLink, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { getData, streamChat } from '../utils/api'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import LoadingSkeleton from '../components/LoadingSkeleton'

const STATUS_STYLES = {
  Fulfilled: 'text-green-400 bg-green-500/10 border-green-500/30',
  Partial:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Broken:    'text-red-400 bg-red-500/10 border-red-500/30',
  Ongoing:   'text-blue-400 bg-blue-500/10 border-blue-500/30',
}

const MANIFESTO_LINKS = [
  { party: 'BJP', name: 'Sankalp Patra 2024', url: 'https://www.bjp.org/manifesto' },
  { party: 'INC', name: 'Nyay Patra 2024', url: 'https://www.inc.in/en/media/document' },
  { party: 'ECI', name: 'All Party Affidavits & Manifestos', url: 'https://eci.gov.in/candidate-corner/manifestos' },
  { party: 'ADR', name: 'Manifesto Analysis Reports', url: 'https://adrindia.org' },
]

export default function Manifestos() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [party1, setParty1] = useState('BJP')
  const [party2, setParty2] = useState('INC')
  const [comparison, setComparison] = useState(null)
  const [comparing, setComparing] = useState(false)
  const [activeParty, setActiveParty] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getData('manifesto-priorities')
      .then(d => { setData(d); setParty1(d.parties[0]?.name || 'BJP'); setParty2(d.parties[1]?.name || 'INC') })
      .catch(() => setError('Failed to load manifesto data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const getComparison = async () => {
    if (party1 === party2) { toast.error('Select two different parties'); return }
    setComparing(true)
    setComparison(null)

    const p1full = data.parties.find(p => p.name === party1)?.fullName
    const p2full = data.parties.find(p => p.name === party2)?.fullName
    const cats = data.categories.join(', ')

    const prompt = `Compare the official 2024 election manifestos of ${party1} (${p1full}) and ${party2} (${p2full}) across these categories: ${cats}.
For each category, give a 1-2 sentence summary of each party's KEY PROMISE from their 2024 manifesto. Sources: BJP Sankalp Patra 2024, INC Nyay Patra 2024, AAP 2024 manifesto, TMC 2024 manifesto, SP 2024 manifesto.
Return ONLY valid JSON: { "categories": { ${data.categories.map(c => `"${c}": {"${party1}": "...", "${party2}": "..."}`).join(', ')} } }`

    try {
      let fullText = ''
      await streamChat([{ role: 'user', content: prompt }], 'en', chunk => { fullText += chunk })
      const jsonStart = fullText.indexOf('{')
      const jsonEnd = fullText.lastIndexOf('}') + 1
      if (jsonStart !== -1) setComparison(JSON.parse(fullText.slice(jsonStart, jsonEnd)))
    } catch {
      toast.error('Failed to generate comparison. Please try again.')
    }
    setComparing(false)
  }

  if (loading) return <LoadingSkeleton />
  if (error) return (
    <div className="p-6 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={load} className="btn-primary flex items-center gap-2 mx-auto"><RefreshCw size={14} /> Retry</button>
    </div>
  )
  if (!data) return null

  const { meta, parties, categories, promise_tracker } = data
  const p1obj = parties.find(p => p.name === party1)
  const p2obj = parties.find(p => p.name === party2)

  const radarData = categories.map(cat => ({
    category: cat,
    [party1]: p1obj?.scores?.[cat] || 70,
    [party2]: p2obj?.scores?.[cat] || 70,
  }))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader icon="📄" title="Manifesto Analyzer" subtitle="Official 2024 election manifesto comparison — based on published party documents" badge="2024 Official Manifestos" />

      {/* Source note */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 mb-6">
        <p className="font-semibold mb-1">📌 Data Sources:</p>
        <p>{Object.values(meta.sources || {}).join(' • ')}</p>
      </div>

      {/* Party selector */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[{ val: party1, set: setParty1, label: 'Party 1' }, { val: party2, set: setParty2, label: 'Party 2' }].map((sel, idx) => {
          const selParty = parties.find(p => p.name === sel.val)
          return (
            <div key={idx} className="card">
              <p className="text-xs text-white/40 mb-2">{sel.label}</p>
              <div className="flex flex-wrap gap-2">
                {parties.map(p => (
                  <button key={p.name} onClick={() => sel.set(p.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${sel.val === p.name ? 'text-white' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                    style={sel.val === p.name ? { background: p.color + '30', borderColor: p.color, color: p.color } : {}}>
                    {p.name}
                  </button>
                ))}
              </div>
              {selParty && (
                <div className="mt-2">
                  <p className="text-xs text-white/30">{selParty.fullName}</p>
                  <p className="text-xs text-white/20 italic">{selParty.tagline}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={getComparison} disabled={comparing} className="btn-primary w-full mb-6 flex items-center justify-center gap-2 py-3">
        {comparing ? '🤖 Analyzing Manifestos...' : `⚖️ Compare ${party1} vs ${party2} Manifestos`}
      </button>

      {/* Radar chart — real data from backend */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-1">Policy Priority Distribution</h3>
        <p className="text-xs text-white/40 mb-1">{meta.note}</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} />
            <Radar name={`${party1} (${p1obj?.fullName})`} dataKey={party1} stroke={p1obj?.color} fill={p1obj?.color} fillOpacity={0.25} strokeWidth={2} />
            <Radar name={`${party2} (${p2obj?.fullName})`} dataKey={party2} stroke={p2obj?.color} fill={p2obj?.color} fillOpacity={0.2} strokeWidth={2} />
            <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{v}</span>} />
          </RadarChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-white/30 text-center">
          Sources: {meta.sources?.[party1]} | {meta.sources?.[party2]}
        </div>
      </div>

      {/* Party top promises */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[p1obj, p2obj].filter(Boolean).map(p => (
          <div key={p.name} className="card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
              <h3 className="font-sora font-semibold text-sm" style={{ color: p.color }}>{p.name} — {p.manifesto}</h3>
            </div>
            <p className="text-xs text-white/40 italic mb-3">"{p.tagline}"</p>
            <ul className="space-y-1.5">
              {p.top_promises?.map((pr, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                  <span className="text-primary mt-0.5 flex-shrink-0">→</span> {pr}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* AI comparison table */}
      {comparison?.categories && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card mb-6">
          <h3 className="font-sora font-semibold mb-1">Side-by-Side Policy Comparison</h3>
          <p className="text-xs text-white/40 mb-4">AI analysis based on official 2024 manifesto documents</p>
          <div className="space-y-4">
            {Object.entries(comparison.categories).map(([cat, stances]) => (
              <div key={cat}>
                <h4 className="text-sm font-bold text-primary mb-2">{cat}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[party1, party2].map(p => (
                    <div key={p} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs font-bold mb-1" style={{ color: parties.find(x => x.name === p)?.color }}>{p}</p>
                      <p className="text-xs text-white/70 leading-relaxed">{stances[p] || 'Data not available'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Promise tracker — real documented data from backend */}
      {promise_tracker && (
        <div className="card mb-6">
          <h3 className="font-sora font-semibold mb-1">📊 Promise Tracker: 2019 Manifesto vs Reality (2024)</h3>
          <p className="text-xs text-white/40 mb-4">Documented by ECI filings, government press releases, and verified media fact-checks</p>
          <div className="flex gap-2 mb-4 flex-wrap">
            {Object.keys(promise_tracker).map(p => {
              const pObj = parties.find(x => x.name === p)
              return (
                <button key={p} onClick={() => setActiveParty(activeParty === p ? null : p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeParty === p ? '' : 'border-white/10 text-white/50'}`}
                  style={activeParty === p ? { background: pObj?.color + '20', borderColor: pObj?.color, color: pObj?.color } : {}}>
                  {pObj?.fullName} ({p})
                </button>
              )
            })}
          </div>
          {activeParty && promise_tracker[activeParty] && (
            <div className="space-y-2">
              {promise_tracker[activeParty].map((pr, i) => (
                <div key={i} className={`p-3 rounded-xl border text-xs ${STATUS_STYLES[pr.status]}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-white">{pr.promise}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-bold flex-shrink-0 ml-2 ${STATUS_STYLES[pr.status]}`}>{pr.status}</span>
                  </div>
                  <p className="opacity-80 leading-relaxed">{pr.detail}</p>
                  <p className="opacity-50 mt-1">📌 Source: {pr.source}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Official manifesto links */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-3">📥 Official Manifesto Documents</h3>
        <div className="space-y-2 text-sm">
          {MANIFESTO_LINKS.map(l => {
            const pColor = parties.find(p => p.name === l.party)?.color || '#555'
            return (
              <a key={l.party} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <span className="text-xs px-2 py-0.5 rounded font-bold text-white" style={{ background: pColor }}>{l.party}</span>
                <span className="text-white/70">{l.name}</span>
                <ExternalLink size={12} className="text-white/30 ml-auto" />
              </a>
            )
          })}
        </div>
      </div>

      <Footer />
    </div>
  )
}
