import React, { useContext } from 'react'
import { motion } from 'framer-motion'
import { Share2, Trophy, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import { ProgressContext } from '../App'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'

const TASKS = [
  { key: 'registered', icon: '📋', label: 'Explored voter registration', path: '/registration', badge: '🏅 Civic Starter' },
  { key: 'found_booth', icon: '📍', label: 'Found your polling booth', path: '/polling', badge: '🗺️ Location Pro' },
  { key: 'learned_candidates', icon: '👥', label: 'Explored candidates', path: '/candidates', badge: '🎭 Informed Voter' },
  { key: 'read_howto', icon: '🗳️', label: 'Learned how to vote', path: '/how-to-vote', badge: '📖 Voting Ready' },
  { key: 'values_matched', icon: '💡', label: 'Completed values matchmaker', path: '/values-match', badge: '💎 Self-Aware' },
  { key: 'factchecked', icon: '🔍', label: 'Used fact checker', path: '/factcheck', badge: '🕵️ Truth Seeker' },
  { key: 'constituency', icon: '🗺️', label: 'Explored your constituency', path: '/constituency', badge: '🏛️ Local Expert' },
  { key: 'read_rights', icon: '⚖️', label: 'Learned voter rights', path: '/rights', badge: '⚖️ Rights Aware' },
  { key: 'quiz_done', icon: '🏆', label: 'Completed election quiz', path: '/quiz', badge: '🧠 Knowledge Master' },
  { key: 'first_timer', icon: '⭐', label: 'Completed first voter journey', path: '/first-time', badge: '🌟 Election Champion' },
]

const LEVEL_BADGES = [
  { minPct: 0, label: 'Civic Newbie', icon: '🌱', color: 'text-green-400' },
  { minPct: 30, label: 'Engaged Citizen', icon: '📚', color: 'text-blue-400' },
  { minPct: 60, label: 'Informed Voter', icon: '🗳️', color: 'text-primary' },
  { minPct: 80, label: 'Democracy Champion', icon: '🏆', color: 'text-gold' },
  { minPct: 100, label: 'Civic Hero', icon: '⭐', color: 'text-secondary' },
]

export default function Progress() {
  const { progress, setProgress } = useContext(ProgressContext)

  const completedCount = TASKS.filter(t => progress[t.key]).length
  const pct = Math.round((completedCount / TASKS.length) * 100)

  const currentLevel = [...LEVEL_BADGES].reverse().find(b => pct >= b.minPct) || LEVEL_BADGES[0]
  const nextLevel = LEVEL_BADGES.find(b => b.minPct > pct)

  const share = () => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
    const text = `I'm ${pct}% Election Ready on VoteSmart AI! I've completed ${completedCount}/${TASKS.length} civic tasks. Join me in being an informed voter! 🗳️`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader icon="🎯" title="My Civic Journey" subtitle="Track your progress towards becoming an informed voter" badge={currentLevel.label} />

      {/* Main progress card */}
      <div className="card mb-6 text-center py-8">
        <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="50" fill="none"
              stroke="#ff2d7a" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
              initial={{ strokeDashoffset: `${2 * Math.PI * 50}` }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - pct / 100)}` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute text-center">
            <p className="font-sora font-extrabold text-2xl text-primary">{pct}%</p>
            <p className="text-xs text-white/50">Complete</p>
          </div>
        </div>
        <div className="text-3xl mb-1">{currentLevel.icon}</div>
        <h2 className={`font-sora font-bold text-xl ${currentLevel.color}`}>{currentLevel.label}</h2>
        <p className="text-sm text-white/50 mt-1">{completedCount} of {TASKS.length} tasks done</p>
        {nextLevel && <p className="text-xs text-white/30 mt-2">Next: {nextLevel.icon} {nextLevel.label} at {nextLevel.minPct}%</p>}

        <button onClick={share} className="btn-primary mt-5 flex items-center gap-2 mx-auto">
          <Share2 size={14} /> Share My Progress
        </button>
      </div>

      {/* Task checklist */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-4">Your Civic Checklist</h3>
        <div className="space-y-2">
          {TASKS.map((task, i) => {
            const done = progress[task.key]
            return (
              <motion.div
                key={task.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-white/20'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
                  {done && <Check size={13} className="text-white" />}
                </div>
                <span className="text-base">{task.icon}</span>
                <span className={`text-sm flex-1 ${done ? 'line-through text-white/40' : 'text-white/80'}`}>{task.label}</span>
                {done
                  ? <span className="text-xs text-green-400 font-semibold">{task.badge}</span>
                  : <a href={task.path} className="text-xs text-primary hover:underline">Start →</a>
                }
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Level badges */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-4 flex items-center gap-2"><Trophy size={16} className="text-gold" /> Achievable Badges</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {LEVEL_BADGES.map(b => (
            <div key={b.label} className={`text-center p-3 rounded-xl border transition-all ${pct >= b.minPct ? 'border-white/20 bg-white/5' : 'border-white/5 opacity-40'}`}>
              <div className="text-2xl mb-1">{b.icon}</div>
              <p className={`text-xs font-semibold ${b.color}`}>{b.label}</p>
              <p className="text-xs text-white/30">{b.minPct}%+</p>
            </div>
          ))}
        </div>
      </div>

      {pct === 100 && (
        <div className="card text-center py-6 border-gold/30 bg-gold/5">
          <div className="text-5xl mb-3">🌟</div>
          <h3 className="font-sora font-bold text-gold text-xl mb-2">You're a Civic Hero!</h3>
          <p className="text-sm text-white/60">You've completed all 10 civic tasks. India thanks you for being an informed voter!</p>
        </div>
      )}

      <Footer />
    </div>
  )
}
