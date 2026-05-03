import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react'
import { ProgressContext } from '../App'
import { getData } from '../utils/api'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function Rights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openRight, setOpenRight] = useState(null)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizDone, setQuizDone] = useState(false)
  const { setProgress } = useContext(ProgressContext)

  const load = () => {
    setLoading(true)
    setError(null)
    getData('rights')
      .then(setData)
      .catch(() => setError('Failed to load voter rights data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRightClick = (i) => {
    setOpenRight(openRight === i ? null : i)
    setProgress('read_rights', true)
  }

  if (loading) return <LoadingSkeleton />
  if (error) return (
    <div className="p-6 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={load} className="btn-primary flex items-center gap-2 mx-auto"><RefreshCw size={14} /> Retry</button>
    </div>
  )
  if (!data) return null

  const { meta, rights, emergency_contacts, complaint_types, quiz_questions } = data
  const score = quiz_questions?.filter((q, i) => quizAnswers[i] === q.answer).length || 0

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader icon="⚖️" title="Voter Rights & Grievances" subtitle="Know your rights and how to report violations" badge="Constitutional Rights" />

      {/* Emergency contacts */}
      <div className="card mb-6 border-primary/30 bg-primary/5">
        <h3 className="font-sora font-semibold mb-3 text-primary">🆘 Emergency Contacts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {emergency_contacts?.map(c => (
            <div key={c.name} className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-white/50">{c.name}</p>
              {c.number
                ? <p className="font-sora font-bold text-gold text-xl">{c.number}</p>
                : c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-secondary text-xs flex items-center gap-1 mt-1 hover:underline">
                    <ExternalLink size={10} /> Open App
                  </a>
                )
              }
              <p className="text-xs text-white/40">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rights accordion */}
      <div className="mb-6">
        <h2 className="font-sora font-bold text-lg mb-4">Your {rights?.length} Key Voter Rights</h2>
        <p className="text-xs text-white/40 mb-3">Source: {meta.source}</p>
        <div className="space-y-2">
          {rights?.map((r, i) => (
            <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
              <button onClick={() => handleRightClick(i)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-2"><span className="text-primary font-bold">{i + 1}.</span> {r.title}</span>
                {openRight === i ? <ChevronUp size={15} className="text-primary flex-shrink-0" /> : <ChevronDown size={15} className="text-white/40 flex-shrink-0" />}
              </button>
              {openRight === i && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-3 border-t border-white/5">
                  <p className="text-sm text-white/60 leading-relaxed mt-2">{r.text}</p>
                  {r.source && <p className="text-xs text-white/25 mt-1.5">📌 {r.source}</p>}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Complaint guide */}
      <div className="card mb-6">
        <h2 className="font-sora font-bold text-base mb-4">📋 File a Complaint</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {complaint_types?.map(c => (
            <button key={c.type} onClick={() => setSelectedComplaint(c)}
              className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${selectedComplaint?.type === c.type ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-white/60 hover:border-white/30'}`}>
              <div className="text-xl mb-1">{c.icon}</div>
              {c.type}
            </button>
          ))}
        </div>
        {selectedComplaint && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 rounded-xl p-4 text-sm text-white/70 leading-relaxed">
            <p className="font-semibold text-white mb-2">{selectedComplaint.icon} How to report: {selectedComplaint.type}</p>
            {selectedComplaint.steps}
          </motion.div>
        )}
      </div>

      {/* Rights quiz */}
      <div className="card mb-6">
        <h2 className="font-sora font-bold text-base mb-4">🧠 Know Your Rights Quiz</h2>
        {quiz_questions?.map((qq, i) => (
          <div key={i} className="mb-4">
            <p className="text-sm font-semibold mb-2">{i + 1}. {qq.q}</p>
            <div className="flex flex-wrap gap-2">
              {qq.options.map((opt, j) => {
                let cls = 'text-xs px-3 py-1.5 rounded-lg border transition-all '
                if (!quizDone) cls += quizAnswers[i] === j ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-white/60 hover:border-white/30'
                else if (j === qq.answer) cls += 'border-green-500 text-green-400 bg-green-500/10'
                else if (quizAnswers[i] === j) cls += 'border-red-500 text-red-400 bg-red-500/10'
                else cls += 'border-white/5 text-white/20'
                return <button key={j} onClick={() => !quizDone && setQuizAnswers(a => ({ ...a, [i]: j }))} className={cls}>{opt}</button>
              })}
            </div>
            {quizDone && quizAnswers[i] !== qq.answer && qq.explanation && (
              <p className="text-xs text-white/40 mt-1 leading-relaxed">💡 {qq.explanation}</p>
            )}
          </div>
        ))}
        {!quizDone ? (
          <button onClick={() => setQuizDone(true)} disabled={Object.keys(quizAnswers).length < (quiz_questions?.length || 0)} className="btn-primary">Submit</button>
        ) : (
          <div className="text-center py-3 bg-primary/10 rounded-xl">
            <p className="font-sora font-bold text-primary text-xl">{score}/{quiz_questions?.length}</p>
            <p className="text-sm text-white/60">{score >= quiz_questions?.length - 1 ? 'Excellent! You know your rights!' : 'Keep learning — your rights matter!'}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
