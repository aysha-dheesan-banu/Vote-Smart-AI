import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCandidates, debate } from '../utils/api'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'

const SAMPLE_QUESTIONS = [
  'What is your plan to create jobs for the youth of India?',
  'How will you address farmer distress and ensure fair MSP?',
  'What steps will you take to improve air quality in Indian cities?',
  'How will you tackle corruption and improve governance?',
  'What is your vision for India\'s education system?',
]

export default function Debate() {
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState([])
  const [question, setQuestion] = useState('')
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(false)
  const [followUps, setFollowUps] = useState({})

  useEffect(() => {
    getCandidates().then(setCandidates).catch(() => {})
  }, [])

  const toggleCandidate = (name) => {
    if (selected.includes(name)) {
      setSelected(selected.filter(n => n !== name))
    } else if (selected.length < 3) {
      setSelected([...selected, name])
    } else {
      toast.error('Select up to 3 candidates')
    }
  }

  const runDebate = async () => {
    if (!question.trim()) { toast.error('Enter a debate question'); return }
    if (selected.length === 0) { toast.error('Select at least one candidate'); return }
    setLoading(true)
    setResponses([])
    try {
      const data = await debate(question.trim(), selected)
      setResponses(data.responses || [])
    } catch {
      toast.error('Debate failed. Please try again.')
    }
    setLoading(false)
  }

  const askFollowUp = async (candidateName, followUpQ) => {
    if (!followUpQ.trim()) return
    const original = responses.find(r => r.candidate === candidateName)
    if (!original) return
    try {
      const data = await debate(`Follow-up for ${candidateName}: ${followUpQ} (context: ${question})`, [candidateName])
      if (data.responses?.[0]) {
        setFollowUps(f => ({ ...f, [candidateName]: [...(f[candidateName] || []), { q: followUpQ, a: data.responses[0].response }] }))
      }
    } catch {
      toast.error('Follow-up failed')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader icon="🎙️" title="Debate Simulator" subtitle="Ask any policy question and see how candidates might respond" badge="AI Simulated" />

      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-2 mb-6 text-xs text-yellow-400">
        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
        All responses are AI-simulated based on publicly available manifesto statements. Not actual candidate statements.
      </div>

      {/* Question input */}
      <div className="card mb-4">
        <h3 className="font-sora font-semibold mb-3">Your Policy Question</h3>
        <textarea
          className="input min-h-[80px] resize-none mb-3"
          placeholder="Ask a policy question... e.g. 'What is your plan to reduce unemployment among youth?'"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q, i) => (
            <button key={i} onClick={() => setQuestion(q)} className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all">
              {q.substring(0, 40)}...
            </button>
          ))}
        </div>
      </div>

      {/* Candidate selector */}
      <div className="card mb-4">
        <h3 className="font-sora font-semibold mb-3">Select Candidates (up to 3)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {candidates.map(c => (
            <button
              key={c.id}
              onClick={() => toggleCandidate(c.name)}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${selected.includes(c.name) ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-white/60 hover:border-white/30'}`}
            >
              <div className="w-5 h-1 rounded mb-1.5" style={{ background: c.partyColor }} />
              <div className="truncate">{c.name}</div>
              <div className="text-white/30 font-normal">{c.party}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={runDebate} disabled={loading || selected.length === 0 || !question.trim()} className="btn-primary w-full mb-6 flex items-center justify-center gap-2">
        <Send size={15} />
        {loading ? 'Generating Responses...' : 'Start Debate'}
      </button>

      {/* Responses */}
      <AnimatePresence>
        {responses.map((r, i) => {
          const candidateInfo = candidates.find(c => c.name === r.candidate)
          const [fuInput, setFuInput] = React.useState('')
          return (
            <motion.div
              key={r.candidate}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="card mb-4"
              style={{ borderLeft: `3px solid ${r.partyColor}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ background: r.partyColor + '20' }}>👤</div>
                <div>
                  <p className="font-sora font-bold text-sm">{r.candidate}</p>
                  <p className="text-xs" style={{ color: r.partyColor }}>{r.party}</p>
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{r.response}</p>

              {/* Follow-up section */}
              {(followUps[r.candidate] || []).map((fu, j) => (
                <div key={j} className="mt-3 pl-3 border-l border-white/10">
                  <p className="text-xs text-secondary font-semibold">Follow-up: {fu.q}</p>
                  <p className="text-xs text-white/60 mt-1">{fu.a}</p>
                </div>
              ))}

              <div className="flex gap-2 mt-3">
                <input className="input text-xs py-1.5 flex-1" placeholder="Ask a follow-up..." value={fuInput} onChange={e => setFuInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { askFollowUp(r.candidate, fuInput); setFuInput('') } }} />
                <button onClick={() => { askFollowUp(r.candidate, fuInput); setFuInput('') }} className="btn-ghost text-xs px-3">Ask</button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
