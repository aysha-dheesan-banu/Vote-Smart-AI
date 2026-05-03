import React, { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { X, Zap } from 'lucide-react'
import { ProgressContext } from '../App'

const NAV = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/registration', icon: '📋', label: 'Register to Vote' },
  { path: '/candidates', icon: '👥', label: 'Candidates' },
  { path: '/polling', icon: '📍', label: 'Find Polling Booth' },
  { path: '/how-to-vote', icon: '🗳️', label: 'How to Vote' },
  { path: '/results', icon: '📊', label: 'Election Results' },
  { path: '/values-match', icon: '💡', label: 'Values Match' },
  { path: '/debate', icon: '🎙️', label: 'Debate Simulator' },
  { path: '/factcheck', icon: '🔍', label: 'Fact Checker' },
  { path: '/constituency', icon: '🗺️', label: 'My Constituency' },
  { path: '/timeline', icon: '📅', label: 'Election Timeline' },
  { path: '/first-time', icon: '⭐', label: 'First-Time Voter' },
  { path: '/chat', icon: '💬', label: 'AI Chat Assistant' },
  { path: '/rights', icon: '⚖️', label: 'Voter Rights' },
  { path: '/budget', icon: '💰', label: 'Election Budget' },
  { path: '/manifestos', icon: '📄', label: 'Manifesto Analyzer' },
  { path: '/quiz', icon: '🏆', label: 'Quiz Arena' },
  { path: '/scorecard', icon: '📈', label: 'Promise Scorecard' },
  { path: '/progress', icon: '🎯', label: 'My Progress' },
]

const CIVIC_TASKS = [
  { key: 'registered', label: 'Registered to vote' },
  { key: 'found_booth', label: 'Found polling booth' },
  { key: 'learned_candidates', label: 'Learned about candidates' },
  { key: 'values_matched', label: 'Completed values match' },
  { key: 'quiz_done', label: 'Taken election quiz' },
  { key: 'factchecked', label: 'Used fact checker' },
  { key: 'read_rights', label: 'Learned voter rights' },
  { key: 'read_howto', label: 'Read how to vote' },
  { key: 'constituency', label: 'Explored constituency' },
  { key: 'first_timer', label: 'Completed voter story' },
]

export default function Sidebar({ onClose }) {
  const location = useLocation()
  const { progress } = useContext(ProgressContext)

  const completedCount = CIVIC_TASKS.filter(t => progress[t.key]).length
  const pct = Math.round((completedCount / CIVIC_TASKS.length) * 100)

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-sora font-bold text-sm">VoteSmart AI</span>
        </a>
        {onClose && (
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map(item => {
          const active = location.pathname === item.path
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm mb-0.5 transition-all ${
                active
                  ? 'bg-primary/15 text-primary font-semibold border border-primary/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </a>
          )
        })}
      </nav>

      {/* Progress mini widget */}
      <div className="p-3 border-t border-border">
        <a href="/progress" className="block">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/60">Civic Journey</span>
            <span className="text-xs font-bold text-primary">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-1">{completedCount}/{CIVIC_TASKS.length} tasks done</p>
        </a>
      </div>
    </div>
  )
}
