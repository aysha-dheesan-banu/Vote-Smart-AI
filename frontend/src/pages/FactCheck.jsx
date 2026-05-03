import React, { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, AlertTriangle, CheckCircle, XCircle, HelpCircle, Clock, ChevronDown, ChevronUp, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { factCheck } from '../utils/api'
import { ProgressContext } from '../App'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'

const COMMON_MYTHS = [
  'EVMs can be hacked to change votes',
  'Voting with NOTA means the election is cancelled in that constituency',
  'You cannot vote if your name is spelled slightly wrong in voter list',
  'The government can see which candidate you voted for',
]

const VERDICT_CONFIG = {
  TRUE: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: '✅ TRUE' },
  MISLEADING: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: '⚠️ MISLEADING' },
  FALSE: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: '❌ FALSE' },
  UNVERIFIABLE: { icon: HelpCircle, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', label: '❓ UNVERIFIABLE' },
}

export default function FactCheck() {
  const [claim, setClaim] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('factcheck_history') || '[]') } catch { return [] }
  })
  const [expanded, setExpanded] = useState({})
  const { setProgress } = useContext(ProgressContext)

  const check = async (text = claim) => {
    if (!text.trim()) { toast.error('Enter a claim to check'); return }
    setLoading(true)
    setResult(null)
    try {
      const data = await factCheck(text.trim())
      setResult(data)
      setProgress('factchecked', true)
      const entry = { claim: text.trim(), verdict: data.verdict, confidence: data.confidence, timestamp: Date.now() }
      const updated = [entry, ...history].slice(0, 5)
      setHistory(updated)
      localStorage.setItem('factcheck_history', JSON.stringify(updated))
    } catch {
      toast.error('Fact check failed. Please try again.')
    }
    setLoading(false)
  }

  const shareResult = () => {
    if (!result) return
    const text = `Fact Check: "${claim.substring(0, 60)}..." → ${result.verdict} (${result.confidence}% confidence) | Checked with VoteSmart AI`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  const config = result ? (VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.UNVERIFIABLE) : null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader icon="🔍" title="Fake News Radar" subtitle="Instantly verify political claims and WhatsApp forwards" badge="AI Fact Checker" />

      {/* Radar animation */}
      {loading && (
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
            <div className="absolute inset-2 rounded-full border border-primary/20" />
            <div className="absolute inset-4 rounded-full border border-primary/10" />
            <div className="absolute bottom-1/2 left-1/2 w-10 h-0.5 bg-gradient-to-r from-primary to-transparent origin-left animate-[radar_2s_linear_infinite]" style={{ transformOrigin: 'left center' }} />
            <div className="absolute inset-0 flex items-center justify-center text-primary text-xs font-semibold">Scanning...</div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="card mb-4">
        <h3 className="font-sora font-semibold mb-3">Paste a Claim or WhatsApp Forward</h3>
        <textarea
          className="input min-h-[100px] resize-none mb-3"
          placeholder="Paste the political claim, headline, or WhatsApp message you want to verify..."
          value={claim}
          onChange={e => setClaim(e.target.value)}
        />
        <button onClick={() => check()} disabled={loading || !claim.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
          <Search size={15} />
          {loading ? 'Analyzing...' : 'Fact Check This'}
        </button>
      </div>

      {/* Common myths */}
      <div className="card mb-4">
        <h3 className="font-sora font-semibold mb-3">Common Election Myths</h3>
        <div className="space-y-2">
          {COMMON_MYTHS.map((myth, i) => (
            <button key={i} onClick={() => { setClaim(myth); check(myth) }}
              className="w-full text-left text-xs p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all">
              🔍 {myth}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && config && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border mb-4 font-sora font-bold text-lg ${config.bg} ${config.border} ${config.color}`}>
              <config.icon size={20} />
              {config.label}
            </div>

            {/* Confidence meter */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Confidence</span>
                <span className={config.color}>{result.confidence}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${result.verdict === 'TRUE' ? 'bg-green-500' : result.verdict === 'FALSE' ? 'bg-red-500' : result.verdict === 'MISLEADING' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
              </div>
            </div>

            {/* Details */}
            {[
              { key: 'explanation', label: '📝 Explanation', content: result.explanation },
              { key: 'red_flags', label: '🚩 Red Flags', content: Array.isArray(result.red_flags) ? result.red_flags.join(' • ') : result.red_flags },
              { key: 'what_is_true', label: '✅ What Is True', content: result.what_is_true },
              { key: 'sources', label: '📚 Sources', content: Array.isArray(result.sources) ? result.sources.join(', ') : result.sources },
            ].map(section => section.content && (
              <div key={section.key} className="mb-3">
                <button onClick={() => setExpanded(e => ({ ...e, [section.key]: !e[section.key] }))}
                  className="flex items-center justify-between w-full text-sm font-semibold text-white/80 hover:text-white transition-colors">
                  {section.label}
                  {expanded[section.key] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expanded[section.key] && (
                  <p className="text-xs text-white/60 mt-1.5 leading-relaxed">{section.content}</p>
                )}
              </div>
            ))}

            <button onClick={shareResult} className="btn-secondary w-full flex items-center justify-center gap-2 mt-2 text-xs">
              <Share2 size={13} /> Share Result
            </button>

          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <div className="card">
          <h3 className="font-sora font-semibold mb-3 flex items-center gap-2"><Clock size={15} /> Recent Checks</h3>
          <div className="space-y-2">
            {history.map((h, i) => {
              const c = VERDICT_CONFIG[h.verdict] || VERDICT_CONFIG.UNVERIFIABLE
              return (
                <button key={i} onClick={() => { setClaim(h.claim); check(h.claim) }}
                  className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold ${c.color}`}>{c.label}</span>
                    <span className="text-xs text-white/30 ml-auto">{h.confidence}%</span>
                  </div>
                  <p className="text-xs text-white/50 truncate">{h.claim}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
