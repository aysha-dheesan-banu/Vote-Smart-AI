import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { streamChat } from '../utils/api'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'

const PARTIES = [
  { name: 'BJP', color: '#FF6600', period: '2019–2024' },
  { name: 'INC', color: '#1E90FF', period: '2019 campaign' },
  { name: 'AAP', color: '#00BCD4', period: 'Delhi governance' },
]

const STATUS_STYLES = {
  Fulfilled: 'text-green-400 bg-green-500/10 border-green-500/30',
  Partial: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Broken: 'text-red-400 bg-red-500/10 border-red-500/30',
  Ongoing: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
}

export default function Scorecard() {
  const [selectedParty, setSelectedParty] = useState(null)
  const [scorecard, setScorecard] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateScorecard = async (party) => {
    setSelectedParty(party)
    setLoading(true)
    setScorecard(null)

    const prompt = `Generate a promise scorecard for ${party.name} based on their ${party.period} manifesto/campaign promises.
List 6-8 major promises and evaluate whether they were Fulfilled, Partially Fulfilled, Broken, or Ongoing.
Return ONLY a JSON object:
{
  "party": "${party.name}",
  "period": "${party.period}",
  "summary": "<1 sentence overall assessment>",
  "fulfilled": <count>,
  "partial": <count>,
  "broken": <count>,
  "ongoing": <count>,
  "promises": [
    {
      "promise": "<promise text>",
      "status": "Fulfilled" | "Partial" | "Broken" | "Ongoing",
      "detail": "<1-2 sentence detail with evidence>",
      "source": "<reference>"
    }
  ]
}`

    try {
      let fullText = ''
      await streamChat([{ role: 'user', content: prompt }], 'en', (chunk) => { fullText += chunk })
      const jsonStart = fullText.indexOf('{')
      const jsonEnd = fullText.lastIndexOf('}') + 1
      if (jsonStart !== -1) {
        const data = JSON.parse(fullText.slice(jsonStart, jsonEnd))
        setScorecard(data)
      }
    } catch {
      toast.error('Failed to generate scorecard. Please try again.')
    }
    setLoading(false)
  }

  const share = () => {
    if (!scorecard) return
    const text = `VoteSmart AI Promise Scorecard for ${scorecard.party}: ${scorecard.fulfilled} Fulfilled, ${scorecard.partial} Partial, ${scorecard.broken} Broken. Check it out!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  const total = scorecard ? (scorecard.fulfilled + scorecard.partial + scorecard.broken + scorecard.ongoing) || 1 : 1

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader icon="📈" title="Promise Scorecard" subtitle="Evaluate how parties kept their election promises" badge="AI Analysis" />



      {/* Party selector */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-3">Select a Party</h3>
        <div className="grid grid-cols-3 gap-3">
          {PARTIES.map(p => (
            <button
              key={p.name}
              onClick={() => generateScorecard(p)}
              disabled={loading}
              className="p-3 rounded-xl border text-sm font-bold transition-all text-left"
              style={selectedParty?.name === p.name ? { background: p.color + '20', borderColor: p.color, color: p.color } : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            >
              <div className="w-4 h-1 rounded mb-2" style={{ background: p.color }} />
              <div>{p.name}</div>
              <div className="text-xs opacity-60 font-normal mt-0.5">{p.period}</div>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="card animate-pulse">
          <div className="h-5 bg-white/5 rounded w-1/3 mb-4" />
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl mb-2" />)}
        </div>
      )}

      {scorecard && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Summary */}
          <div className="card mb-4" style={{ borderLeft: `3px solid ${selectedParty?.color}` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-sora font-bold text-xl" style={{ color: selectedParty?.color }}>{scorecard.party}</h2>
                <p className="text-xs text-white/50">{scorecard.period}</p>
              </div>
              <button onClick={share} className="btn-ghost flex items-center gap-1.5 text-xs"><Share2 size={13} /> Share</button>
            </div>
            <p className="text-sm text-white/70 mb-4">{scorecard.summary}</p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Fulfilled', count: scorecard.fulfilled, style: 'text-green-400' },
                { label: 'Partial', count: scorecard.partial, style: 'text-yellow-400' },
                { label: 'Broken', count: scorecard.broken, style: 'text-red-400' },
                { label: 'Ongoing', count: scorecard.ongoing, style: 'text-blue-400' },
              ].map(s => (
                <div key={s.label} className="text-center p-2 bg-white/5 rounded-lg">
                  <p className={`font-sora font-bold text-xl ${s.style}`}>{s.count}</p>
                  <p className="text-xs text-white/40">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div className="mt-4 flex h-3 rounded-full overflow-hidden gap-0.5">
              <div className="bg-green-500 transition-all" style={{ width: `${(scorecard.fulfilled / total) * 100}%` }} title={`Fulfilled: ${scorecard.fulfilled}`} />
              <div className="bg-yellow-500 transition-all" style={{ width: `${(scorecard.partial / total) * 100}%` }} title={`Partial: ${scorecard.partial}`} />
              <div className="bg-blue-500 transition-all" style={{ width: `${(scorecard.ongoing / total) * 100}%` }} title={`Ongoing: ${scorecard.ongoing}`} />
              <div className="bg-red-500 transition-all" style={{ width: `${(scorecard.broken / total) * 100}%` }} title={`Broken: ${scorecard.broken}`} />
            </div>
          </div>

          {/* Promise list */}
          <div className="space-y-3">
            {scorecard.promises?.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className={`card border ${STATUS_STYLES[p.status]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-white mb-1">{p.promise}</p>
                    <p className="text-xs leading-relaxed opacity-80">{p.detail}</p>
                    {p.source && <p className="text-xs opacity-50 mt-1">Source: {p.source}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg border font-bold flex-shrink-0 ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <button onClick={() => generateScorecard(selectedParty)} className="btn-ghost flex items-center gap-2 mt-4 mx-auto">
            <RefreshCw size={13} /> Regenerate
          </button>
        </motion.div>
      )}

      <Footer />
    </div>
  )
}
