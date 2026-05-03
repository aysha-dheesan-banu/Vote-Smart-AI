import React, { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { valuesMatch, getData } from '../utils/api'
import { ProgressContext } from '../App'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function ValuesMatch() {
  const [questions, setQuestions] = useState(null)
  const [qMeta, setQMeta] = useState(null)
  const [qLoading, setQLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [currentQ, setCurrentQ] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { setProgress } = useContext(ProgressContext)

  useEffect(() => {
    getData('values-questions')
      .then(d => { setQuestions(d.questions); setQMeta(d.meta) })
      .catch(() => toast.error('Failed to load quiz questions.'))
      .finally(() => setQLoading(false))
  }, [])

  const setAnswer = (key, val) => {
    setAnswers(a => ({ ...a, [key]: val }))
    setTimeout(() => {
      if (currentQ < questions.length - 1) setCurrentQ(c => c + 1)
    }, 300)
  }

  const submit = async () => {
    setLoading(true)
    try {
      const data = await valuesMatch(answers)
      setResult(data)
      setProgress('values_matched', true)
      localStorage.setItem('values_result', JSON.stringify(data))
    } catch {
      toast.error('Failed to analyze. Please try again.')
    }
    setLoading(false)
  }

  const shareWhatsApp = () => {
    if (!result?.matches) return
    const top = result.matches.sort((a, b) => b.matchPercent - a.matchPercent)[0]
    const text = `I took the VoteSmart AI Values Quiz! My top match is ${top.party} at ${top.matchPercent}% alignment. Find your match at VoteSmart AI!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  if (qLoading) return <LoadingSkeleton />

  if (result) {
    const sorted = [...(result.matches || [])].sort((a, b) => b.matchPercent - a.matchPercent)
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <PageHeader icon="💡" title="Your Values Match" subtitle="Based on your stated priorities" />
        <div className="space-y-3 mb-6">
          {sorted.map((m, i) => (
            <motion.div key={m.party} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: m.color }} />
                <h3 className="font-sora font-bold text-base flex-1">{m.party}</h3>
                <span className="font-sora font-extrabold text-xl" style={{ color: m.color }}>{m.matchPercent}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full mb-3 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${m.matchPercent}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }} className="h-full rounded-full" style={{ background: m.color }} />
              </div>
              {m.aligningPolicies?.length > 0 && (
                <div className="text-xs space-y-1">
                  <p className="text-green-400 font-semibold">✓ Aligning policies:</p>
                  {m.aligningPolicies.slice(0, 2).map((p, j) => <p key={j} className="text-white/60">→ {p}</p>)}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={shareWhatsApp} className="btn-primary flex items-center gap-2"><Share2 size={15} /> Share My Match</button>
          <button onClick={() => { setResult(null); setAnswers({}); setCurrentQ(0) }} className="btn-secondary">Retake Quiz</button>
        </div>
        <Footer />
      </div>
    )
  }

  if (!questions) return null

  const q = questions[currentQ]
  const answeredAll = questions.every(q => answers[q.key])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader icon="💡" title="Values Matchmaker" subtitle="Discover which parties align with your priorities" badge="10-Question Quiz" />


      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {questions.map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= currentQ ? 'bg-primary' : answers[questions[i].key] ? 'bg-primary/50' : 'bg-white/10'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card mb-6">
          <div className="text-3xl mb-3">{q.icon}</div>
          <p className="text-xs text-white/40 mb-1">Question {currentQ + 1} of {questions.length}</p>
          <h3 className="font-sora font-bold text-lg mb-6">{q.label}</h3>
          <div className="space-y-2 mb-4">
            {[1, 2, 3, 4, 5].map(v => (
              <button
                key={v}
                onClick={() => setAnswer(q.key, v)}
                className={`w-full py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${answers[q.key] === v ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-white/60 hover:border-white/30'}`}
              >
                {v === 1 ? `1 — ${q.low}` : v === 5 ? `5 — ${q.high}` : `${v} — Somewhat ${v < 3 ? q.low.split(' ')[0] : q.high.split(' ')[0]}`}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {currentQ > 0 && <button onClick={() => setCurrentQ(c => c - 1)} className="btn-ghost">← Back</button>}
            {currentQ < questions.length - 1 && answers[q.key] && (
              <button onClick={() => setCurrentQ(c => c + 1)} className="btn-ghost ml-auto">Next →</button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {answeredAll && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={submit} disabled={loading} className="btn-primary w-full text-base py-3">
          {loading ? '🤖 Analyzing your values...' : '🎯 Show My Party Match'}
        </motion.button>
      )}
    </div>
  )
}
