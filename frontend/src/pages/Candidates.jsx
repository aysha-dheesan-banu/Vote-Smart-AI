import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X, ChevronDown, ChevronUp, Scale } from 'lucide-react'
import { getCandidates } from '../utils/api'
import { ProgressContext } from '../App'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

export default function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterParty, setFilterParty] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [comparing, setComparing] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  const { setProgress } = useContext(ProgressContext)

  useEffect(() => {
    getCandidates().then(data => { setCandidates(data); setLoading(false); setProgress('learned_candidates', true) })
      .catch(() => setLoading(false))
  }, [])

  const parties = ['All', ...new Set(candidates.map(c => c.party))]

  const filtered = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.constituency.toLowerCase().includes(search.toLowerCase())
    const matchParty = filterParty === 'All' || c.party === filterParty
    return matchSearch && matchParty
  })

  const toggleCompare = (id) => {
    if (comparing.includes(id)) {
      setComparing(comparing.filter(x => x !== id))
    } else if (comparing.length < 2) {
      setComparing([...comparing, id])
    }
  }

  const compareData = candidates.filter(c => comparing.includes(c.id))

  if (loading) return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {[1,2,3,4].map(i => <div key={i} className="card h-48 animate-pulse bg-white/5" />)}
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader icon="👥" title="Candidate Explorer" subtitle="Key Indian political leaders as of 2026 — current roles, stances & real data" badge="2026 Updated" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input className="input pl-9" placeholder="Search by name or constituency..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {parties.map(p => (
            <button key={p} onClick={() => setFilterParty(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterParty === p ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Compare bar */}
      {comparing.length > 0 && (
        <div className="mb-4 p-3 bg-secondary/10 border border-secondary/30 rounded-xl flex items-center gap-3 flex-wrap">
          <Scale size={16} className="text-secondary flex-shrink-0" />
          <span className="text-sm text-secondary font-semibold">Comparing: {compareData.map(c => c.name).join(' vs ')}</span>
          {comparing.length === 2 && (
            <button onClick={() => setShowCompare(true)} className="btn-secondary text-xs px-3 py-1.5 ml-auto">View Comparison</button>
          )}
          <button onClick={() => setComparing([])} className="btn-ghost p-1"><X size={14} /></button>
        </div>
      )}

      {/* Comparison modal */}
      {showCompare && compareData.length === 2 && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora font-bold text-lg">Candidate Comparison</h3>
              <button onClick={() => setShowCompare(false)} className="btn-ghost p-1"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="font-semibold text-white/50">Issue</div>
              {compareData.map(c => (
                <div key={c.id} className="font-sora font-semibold" style={{ color: c.partyColor }}>{c.name}</div>
              ))}
              {['economy', 'education', 'health', 'farmers', 'environment'].map(key => (
                <React.Fragment key={key}>
                  <div className="text-white/50 capitalize">{key}</div>
                  {compareData.map(c => (
                    <div key={c.id} className="text-xs text-white/70">{c.stances[key]}</div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(c => (
          <motion.div key={c.id} variants={item}>
            <div className={`card overflow-hidden border transition-all ${comparing.includes(c.id) ? 'border-secondary' : ''}`}>
              {/* Party banner */}
              <div className="h-1.5 rounded-t-2xl -mx-5 -mt-5 mb-4" style={{ background: c.partyColor }} />

              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0" style={{ background: c.partyColor + '20', border: `2px solid ${c.partyColor}40` }}>
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-sora font-bold text-base truncate">{c.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: c.partyColor }}>{c.party}</span>
                    <span className="text-xs text-white/50 truncate">{c.state}</span>
                  </div>
                  {c.role && (
                    <p className="text-xs text-secondary mt-0.5 font-semibold truncate">🏛 {c.role}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                {c.keyPromises.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                    <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  className="btn-ghost text-xs flex items-center gap-1 flex-1"
                >
                  {expanded === c.id ? <><ChevronUp size={13} /> Hide Stances</> : <><ChevronDown size={13} /> View Stances</>}
                </button>
                <button
                  onClick={() => toggleCompare(c.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${comparing.includes(c.id) ? 'bg-secondary/20 border-secondary text-secondary' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                >
                  {comparing.includes(c.id) ? '✓ Selected' : 'Compare'}
                </button>
              </div>

              {expanded === c.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 border-t border-border pt-3 space-y-2">
                  {c.background && (
                    <p className="text-xs text-white/60 leading-relaxed bg-white/5 rounded-lg p-2">{c.background}</p>
                  )}
                  {Object.entries(c.stances).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-xs text-primary capitalize font-semibold">{k}: </span>
                      <span className="text-xs text-white/60">{v}</span>
                    </div>
                  ))}
                  {c.source && <p className="text-xs text-white/25 mt-1">📌 {c.source}</p>}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center text-white/40 py-12">No candidates match your search.</div>
      )}

      <Footer />
    </div>
  )
}
