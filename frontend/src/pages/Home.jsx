import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import { getData } from '../utils/api'
import Footer from '../components/Footer'

const FEATURES = [
  { path: '/registration', icon: '📋', title: 'Register to Vote', desc: 'Step-by-step voter registration guide', color: 'text-primary' },
  { path: '/candidates', icon: '👥', title: 'Explore Candidates', desc: 'Compare candidates & their stances', color: 'text-secondary' },
  { path: '/polling', icon: '📍', title: 'Find Polling Booth', desc: 'Locate your nearest polling station', color: 'text-gold' },
  { path: '/factcheck', icon: '🔍', title: 'Fact Checker', desc: 'Verify political claims instantly', color: 'text-primary' },
  { path: '/values-match', icon: '💡', title: 'Values Matchmaker', desc: 'Find parties that match your values', color: 'text-secondary' },
  { path: '/debate', icon: '🎙️', title: 'Debate Simulator', desc: 'AI-powered candidate debate', color: 'text-gold' },
  { path: '/timeline', icon: '📅', title: 'Election Timeline', desc: '2024 election phases & results', color: 'text-primary' },
  { path: '/quiz', icon: '🏆', title: 'Quiz Arena', desc: 'Test your election knowledge', color: 'text-secondary' },
  { path: '/first-time', icon: '⭐', title: 'First-Time Voter', desc: 'Interactive comic walkthrough', color: 'text-gold' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function Home() {
  const nav = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getData('results')
      .then(d => setStats({
        seats: d.meta?.total_seats?.toLocaleString('en-IN') || '543',
        voters: d.meta?.total_votes_cast
          ? (d.meta.total_votes_cast / 10000000).toFixed(1) + 'Cr'
          : '96.8Cr',
        phases: d.phase_turnout?.length?.toString() || '7',
        turnout: d.meta?.national_turnout ? d.meta.national_turnout + '%' : '65.79%',
        source: d.meta?.source || 'ECI 2024',
      }))
      .catch(() => setStats({
        seats: '543', voters: '96.8Cr', phases: '7', turnout: '65.79%', source: 'ECI 2024'
      }))
  }, [])

  const statCards = stats ? [
    { value: stats.seats, label: 'Lok Sabha Seats', color: 'text-primary' },
    { value: stats.voters, label: 'Votes Cast (2024)', color: 'text-secondary' },
    { value: stats.phases, label: 'Election Phases', color: 'text-gold' },
    { value: stats.turnout, label: 'National Turnout', color: 'text-white' },
  ] : []

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-6 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="badge-primary mb-6 mx-auto">
            🏆 PromptWars Hackathon — Google for Developers
          </div>
          <h1 className="font-sora font-extrabold text-4xl md:text-6xl text-white mb-4 leading-tight">
            Vote<span className="text-primary">Smart</span> AI
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Your intelligent, nonpartisan Indian election assistant. Powered by Claude AI —
            helping every citizen make an informed choice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => nav('/registration')} className="btn-primary flex items-center gap-2 justify-center">
              Get Started <ArrowRight size={16} />
            </button>
            <button onClick={() => nav('/chat')} className="btn-secondary flex items-center gap-2 justify-center">
              Ask AI Assistant
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats — dynamic from backend */}
      <section className="px-6 pb-10">
        <div className="max-w-4xl mx-auto">
          {stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-2">
                {statCards.map(s => (
                  <div key={s.label} className="card">
                    <p className={`font-sora font-extrabold text-2xl md:text-3xl ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-white/50 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/25 text-center">📌 Source: {stats.source}</p>
            </>
          )}
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-sora font-bold text-xl text-white mb-6">
            Everything you need to vote smart
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {FEATURES.map(f => (
              <motion.div key={f.path} variants={item}>
                <button
                  onClick={() => nav(f.path)}
                  className="card w-full text-left hover:border-white/20 active:scale-98 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{f.icon}</span>
                    <div>
                      <h3 className={`font-sora font-semibold text-sm ${f.color}`}>{f.title}</h3>
                      <p className="text-xs text-white/50 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-white/30 group-hover:text-white/60 transition-colors">
                    Explore <ArrowRight size={12} />
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: <Shield size={24} className="text-secondary mx-auto" />, title: 'Nonpartisan', desc: 'No political bias. No party endorsements.' },
              { icon: <Zap size={24} className="text-primary mx-auto" />, title: 'AI Powered', desc: 'Claude AI for accurate, nuanced answers.' },
              { icon: <Globe size={24} className="text-gold mx-auto" />, title: 'Multilingual', desc: 'Available in English and Hindi.' },
            ].map(b => (
              <div key={b.title}>
                {b.icon}
                <h4 className="font-sora font-semibold text-sm mt-2">{b.title}</h4>
                <p className="text-xs text-white/50 mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
