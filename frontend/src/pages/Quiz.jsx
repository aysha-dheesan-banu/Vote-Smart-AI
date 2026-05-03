import React, { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy, Clock, Share2 } from 'lucide-react'
import { getQuizQuestions } from '../utils/api'
import { ProgressContext } from '../App'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'

const LEVELS = [
  { key: 'beginner', label: 'Beginner', icon: '🌱', desc: 'New to Indian elections', color: 'text-green-400', range: [0, 4] },
  { key: 'intermediate', label: 'Intermediate', icon: '📚', label2: 'Civics aware', color: 'text-yellow-400', range: [4, 8] },
  { key: 'expert', label: 'Expert', icon: '🏆', desc: 'Election enthusiast', color: 'text-primary', range: [0, 10] },
]

function Timer({ seconds, onEnd }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) { onEnd(); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  return (
    <div className={`flex items-center gap-1.5 text-sm font-bold ${left <= 5 ? 'text-red-400' : 'text-secondary'}`}>
      <Clock size={14} /> {left}s
    </div>
  )
}

export default function Quiz() {
  const [level, setLevel] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [answered, setAnswered] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leaderboard, setLeaderboard] = useState(() => {
    try { return JSON.parse(localStorage.getItem('quiz_leaderboard') || '[]') } catch { return [] }
  })
  const [timedOut, setTimedOut] = useState(false)
  const { setProgress } = useContext(ProgressContext)

  const startQuiz = async (lvl) => {
    setLevel(lvl)
    setLoading(true)
    try {
      const data = await getQuizQuestions()
      setQuestions(data.questions || [])
    } catch {
      setQuestions([])
    }
    setLoading(false)
  }

  const answer = (optionIdx) => {
    if (answered) return
    setAnswers(a => ({ ...a, [current]: optionIdx }))
    setAnswered(true)
  }

  const next = () => {
    setAnswered(false)
    setTimedOut(false)
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = () => {
    setDone(true)
    setProgress('quiz_done', true)
    const score = questions.filter((q, i) => answers[i] === q.answer).length
    if (score >= questions.length * 0.7) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#ff2d7a', '#00f5d4', '#ffd700'] })
    }
    const entry = { level: level?.key, score, total: questions.length, date: new Date().toLocaleDateString() }
    const updated = [entry, ...leaderboard].slice(0, 5)
    setLeaderboard(updated)
    localStorage.setItem('quiz_leaderboard', JSON.stringify(updated))
  }

  const handleTimeout = () => {
    setTimedOut(true)
    setAnswered(true)
  }

  const reset = () => {
    setLevel(null)
    setCurrent(0)
    setAnswers({})
    setAnswered(false)
    setDone(false)
    setTimedOut(false)
  }

  if (!level) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <PageHeader icon="🏆" title="Quiz Arena" subtitle="Test your Indian election knowledge" badge="3 Difficulty Levels" />

        <div className="grid gap-4 mb-6">
          {LEVELS.map(l => (
            <motion.button key={l.key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => startQuiz(l)} className="card text-left flex items-center gap-4 hover:border-white/20 transition-all">
              <span className="text-3xl">{l.icon}</span>
              <div>
                <p className={`font-sora font-bold ${l.color}`}>{l.label}</p>
                <p className="text-sm text-white/50">{l.desc || l.label2}</p>
              </div>
              <span className="ml-auto text-white/30">→</span>
            </motion.button>
          ))}
        </div>

        {leaderboard.length > 0 && (
          <div className="card">
            <h3 className="font-sora font-semibold mb-3 flex items-center gap-2"><Trophy size={16} className="text-gold" /> My Recent Scores</h3>
            <div className="space-y-2">
              {leaderboard.map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-white/40">{e.date}</span>
                  <span className="capitalize text-white/60">{e.level}</span>
                  <span className="ml-auto font-bold text-primary">{e.score}/{e.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <Footer />
      </div>
    )
  }

  if (loading) return <div className="p-6 text-center"><div className="animate-spin text-4xl">⏳</div><p className="mt-4 text-white/60">Loading questions...</p></div>

  if (done) {
    const score = questions.filter((q, i) => answers[i] === q.answer).length
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="card text-center py-10">
          <div className="text-5xl mb-4">{pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚'}</div>
          <h2 className="font-sora font-extrabold text-3xl text-primary mb-2">{score}/{questions.length}</h2>
          <p className="text-white/60 mb-1">{pct}% correct</p>
          <p className="text-sm text-white/40 mb-6">{pct >= 80 ? 'Election Expert! 🏆' : pct >= 60 ? 'Good Knowledge! 📚' : 'Keep learning! 🌱'}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { const text = `I scored ${score}/${questions.length} (${pct}%) on the VoteSmart AI Election Quiz! Test your knowledge too!`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`) }} className="btn-primary flex items-center gap-2"><Share2 size={14} /> Share Score</button>
            <button onClick={reset} className="btn-secondary">Play Again</button>
          </div>
        </div>

        <div className="card mt-4">
          <h3 className="font-sora font-semibold mb-3">Review Answers</h3>
          {questions.map((q, i) => {
            const correct = answers[i] === q.answer
            return (
              <div key={i} className={`mb-3 p-3 rounded-xl border text-xs ${correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <p className="font-semibold text-sm mb-1">{i + 1}. {q.question}</p>
                <p className={correct ? 'text-green-400' : 'text-red-400'}>Your answer: {q.options[answers[i]] || '(no answer)'}</p>
                {!correct && <p className="text-green-400">Correct: {q.options[q.answer]}</p>}
                {q.explanation && <p className="text-white/40 mt-1">{q.explanation}</p>}
              </div>
            )
          })}
        </div>
        <Footer />
      </div>
    )
  }

  const q = questions[current]
  if (!q) return null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-white/40">Question {current + 1} of {questions.length}</p>
          <p className="text-xs text-primary font-semibold">{q.category}</p>
        </div>
        {!answered && <Timer seconds={15} onEnd={handleTimeout} />}
        <button onClick={reset} className="btn-ghost text-xs">Quit</button>
      </div>

      <div className="h-1 bg-white/10 rounded mb-6 overflow-hidden">
        <div className="h-full bg-primary rounded transition-all" style={{ width: `${((current) / questions.length) * 100}%` }} />
      </div>

      <div className="card mb-4">
        <h2 className="font-sora font-semibold text-lg mb-6">{q.question}</h2>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all '
            if (!answered) {
              cls += answers[current] === i ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-white/70 hover:border-white/30'
            } else {
              if (i === q.answer) cls += 'border-green-500 bg-green-500/15 text-green-400'
              else if (answers[current] === i) cls += 'border-red-500 bg-red-500/15 text-red-400'
              else cls += 'border-white/5 text-white/30'
            }
            return <button key={i} onClick={() => answer(i)} disabled={answered} className={cls}>{opt}</button>
          })}
        </div>
        {timedOut && !answers[current] && <p className="text-red-400 text-sm mt-3">⏰ Time's up! The correct answer is: {q.options[q.answer]}</p>}
        {answered && q.explanation && <p className="text-xs text-white/50 mt-3 p-2 bg-white/5 rounded-lg">💡 {q.explanation}</p>}
      </div>

      {answered && (
        <button onClick={next} className="btn-primary w-full">
          {current < questions.length - 1 ? 'Next Question →' : 'See Results 🏆'}
        </button>
      )}
    </div>
  )
}
