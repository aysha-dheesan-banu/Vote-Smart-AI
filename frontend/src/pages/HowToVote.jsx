import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { ProgressContext } from '../App'
import { getData } from '../utils/api'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function HowToVote() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('in-person')
  const [openFaq, setOpenFaq] = useState(null)
  const { setProgress } = useContext(ProgressContext)

  const load = () => {
    setLoading(true)
    setError(null)
    getData('howto')
      .then(setData)
      .catch(() => setError('Failed to load voting guide.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleTabChange = (t) => {
    setTab(t)
    setProgress('read_howto', true)
  }

  if (loading) return <LoadingSkeleton />
  if (error) return (
    <div className="p-6 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={load} className="btn-primary flex items-center gap-2 mx-auto"><RefreshCw size={14} /> Retry</button>
    </div>
  )
  if (!data) return null

  const { meta, in_person_steps, postal_ballot_steps, alternate_ids, faq } = data
  const steps = tab === 'in-person' ? in_person_steps : postal_ballot_steps

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader icon="🗳️" title="How to Vote" subtitle="Complete guide to casting your vote in Indian elections" badge="Official Process" />

      {/* Source banner */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 mb-6">
        <p className="font-semibold mb-1">📌 Source: {meta.source}</p>
      </div>

      {/* EVM Illustration */}
      <div className="card mb-6 flex items-center justify-center py-8">
        <div className="relative">
          <div className="w-48 h-56 bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 shadow-card">
            <div className="text-xs text-white/60 font-semibold mb-2">Electronic Voting Machine</div>
            {['BJP', 'INC', 'AAP', 'NOTA'].map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 w-36 px-2 py-1 rounded bg-white/5 hover:bg-primary/20 cursor-pointer transition-all group"
              >
                <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-cyan-500' : 'bg-gray-500'}`} />
                <span className="text-xs text-white/70 group-hover:text-white">{p}</span>
                <div className="ml-auto w-4 h-4 rounded-full border border-white/20 group-hover:border-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full group-hover:bg-primary transition-all" />
                </div>
              </motion.div>
            ))}
            <div className="mt-2 px-4 py-1 rounded bg-green-500/20 border border-green-500/30 text-xs text-green-400 font-semibold">VOTE ✓</div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/30 whitespace-nowrap">Simulated EVM — not actual interface</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ key: 'in-person', label: '🏫 In-Person Voting' }, { key: 'postal', label: '📬 Postal Ballot' }].map(t => (
          <button key={t.key} onClick={() => handleTabChange(t.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${tab === t.key ? 'bg-primary/15 border-primary text-primary' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-8">
        {steps?.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-start gap-4 card"
          >
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-lg">{step.icon}</div>
              {i < steps.length - 1 && <div className="w-0.5 h-4 bg-primary/20 mt-1" />}
            </div>
            <div className="pt-1.5 flex-1">
              <h4 className="font-sora font-semibold text-sm text-white">Step {i + 1}: {step.title}</h4>
              <p className="text-sm text-white/60 mt-1 leading-relaxed">{step.desc}</p>
              {step.source && <p className="text-xs text-white/25 mt-1">📌 {step.source}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alternate IDs */}
      {tab === 'in-person' && alternate_ids?.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-sora font-semibold mb-3">🪪 12 ECI-Approved Alternative Photo IDs</h3>
          <p className="text-xs text-white/40 mb-3">Source: ECI Order No. 3/2014</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {alternate_ids.map((id, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                <span className="text-primary font-bold">{i + 1}.</span> {id}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="card mb-6">
        <h3 className="font-sora font-bold text-base mb-4">❓ Frequently Asked Questions</h3>
        <div className="space-y-2">
          {faq?.map((item, i) => (
            <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left hover:bg-white/5 transition-colors"
              >
                {item.q}
                {openFaq === i ? <ChevronUp size={15} className="text-primary flex-shrink-0 ml-2" /> : <ChevronDown size={15} className="text-white/40 flex-shrink-0 ml-2" />}
              </button>
              {openFaq === i && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-3 text-sm text-white/60 leading-relaxed border-t border-white/5">
                  <p>{item.a}</p>
                  {item.source && <p className="text-xs text-white/30 mt-1.5">📌 {item.source}</p>}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
