import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const FEATURES = [
  { icon: '🔍', title: 'Fake News Radar', desc: 'Instantly fact-check political claims and WhatsApp forwards with AI.' },
  { icon: '💡', title: 'Values Matchmaker', desc: 'Discover which party aligns with your priorities in 10 questions.' },
  { icon: '👥', title: 'Candidate Explorer', desc: 'Real 2026-updated profiles, stances and side-by-side comparisons.' },
  { icon: '🎭', title: 'AI Debate Simulator', desc: 'See how leaders respond to policy questions based on their manifestos.' },
  { icon: '📅', title: 'Election Timeline', desc: 'Complete 2024–2029 schedule: results, turnout, upcoming dates.' },
  { icon: '🏛️', title: 'My Constituency', desc: "Look up your constituency's history, winners and local issues." },
]

const STATS = [
  { value: '970M+', label: 'Registered Voters' },
  { value: '543', label: 'Lok Sabha Seats' },
  { value: '65.79%', label: '2024 Turnout' },
  { value: '7', label: 'Election Phases' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗳️</span>
          <span className="font-sora font-bold text-lg">VoteSmart <span className="text-primary">AI</span></span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors">
            Sign In
          </button>
          <button onClick={() => navigate('/signup')} className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/80 transition-all">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/20 text-primary border border-primary/30 rounded-full mb-6">
            Built for PromptWars · Google for Developers
          </span>
          <h1 className="font-sora font-extrabold text-5xl md:text-6xl leading-tight mb-6">
            India's Smartest<br />
            <span className="text-primary">Election Assistant</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Fact-check claims, explore candidates, match your values to parties, and become a more informed voter — all powered by AI and real ECI data.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => navigate('/signup')} className="px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/80 transition-all text-base shadow-lg shadow-primary/20">
              Start for Free →
            </button>
            <button onClick={() => navigate('/login')} className="px-8 py-3.5 border border-white/20 text-white font-semibold rounded-2xl hover:border-white/40 transition-all text-base">
              Sign In
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="font-sora font-extrabold text-2xl text-primary">{s.value}</p>
              <p className="text-xs text-white/50 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="font-sora font-bold text-2xl text-center mb-10">Everything you need to vote smart</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-primary/30 hover:bg-primary/5 transition-all">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-sora font-semibold mt-3 mb-1">{f.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 py-16 text-center px-6">
        <h2 className="font-sora font-bold text-3xl mb-4">Ready to vote smarter?</h2>
        <p className="text-white/50 mb-8">Join voters across India using VoteSmart AI for accurate, nonpartisan election information.</p>
        <button onClick={() => navigate('/signup')} className="px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/80 transition-all text-base shadow-lg shadow-primary/20">
          Create Free Account →
        </button>
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/30 px-6">
        VoteSmart AI · Nonpartisan · Educational · Powered by Google Gemini · Data from ECI
      </footer>
    </div>
  )
}
