import React, { useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { Search, ExternalLink, Phone, Share2, Info, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { ProgressContext } from '../App'
import { checkRegistration } from '../utils/api'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'

const WHAT_TO_BRING = [
  'Voter ID Card (EPIC) — primary document',
  'Aadhaar Card (accepted as alternate ID)',
  'Passport / Driving License / PAN Card',
  'MGNREGA Job Card',
  'Bank / Post Office Passbook with photograph',
  'Smart Card issued by CGHS / ECHS',
  'Pension document with photo',
  'NPR Smart Card (RGI-issued)',
]

const HOW_TO_FIND = [
  {
    step: '1',
    title: 'Visit Official ECI Voter Search Portal',
    desc: 'Go to electoralsearch.eci.gov.in — the official Election Commission portal',
    link: 'https://electoralsearch.eci.gov.in',
    linkText: 'Open ECI Voter Search ↗',
  },
  {
    step: '2',
    title: 'Search by EPIC Number or Details',
    desc: 'Enter your EPIC (Voter ID) number, or search by Name + Father\'s Name + State + District + Assembly Constituency',
    link: null,
    linkText: null,
  },
  {
    step: '3',
    title: 'View Your Voter Card Details',
    desc: 'Your full voter profile shows: Polling Station Name, Address, Part Number, Serial Number — all official ECI data.',
    link: null,
    linkText: null,
  },
  {
    step: '4',
    title: 'Use the Voter Helpline App',
    desc: 'Download "Voter Helpline" app (official ECI app on Play Store / App Store) to search your booth, download e-EPIC, and get live updates.',
    link: 'https://play.google.com/store/apps/details?id=com.eci.ci',
    linkText: 'Get Voter Helpline App ↗',
  },
  {
    step: '5',
    title: 'Call 1950 Helpline',
    desc: 'Call the national Voter Helpline 1950 (toll-free) and provide your name + state to get your polling booth address.',
    link: null,
    linkText: null,
  },
]

const OFFICIAL_PORTALS = [
  { name: 'Voter Search (Find Booth)', url: 'https://electoralsearch.eci.gov.in', icon: '🔍', desc: 'Search by name or EPIC number' },
  { name: 'Voter Portal (NVSP)', url: 'https://voters.eci.gov.in', icon: '📋', desc: 'Registration, corrections, e-EPIC' },
  { name: 'ECI Official Site', url: 'https://eci.gov.in', icon: '🏛️', desc: 'Official Election Commission' },
  { name: 'KYC (Know Your Candidate)', url: 'https://affidavit.eci.gov.in', icon: '👤', desc: 'Candidate criminal & asset records' },
]

export default function Polling() {
  const [epicNumber, setEpicNumber] = useState('')
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [checklist, setChecklist] = useState({})
  const { setProgress } = useContext(ProgressContext)

  const askAI = async () => {
    const q = aiQuery.trim() || `How do I find my polling booth using EPIC number ${epicNumber}?`
    if (!q) { toast.error('Enter a question or EPIC number'); return }
    setLoading(true)
    setAiResponse('')
    try {
      const data = await checkRegistration([{ role: 'user', content: q }])
      setAiResponse(data.response)
      setProgress('found_booth', true)
    } catch {
      toast.error('AI service unavailable. Please use official ECI portal directly.')
    }
    setLoading(false)
  }

  const share = () => {
    const text = `Find your polling booth at the official ECI portal: https://electoralsearch.eci.gov.in — or call Voter Helpline 1950. Let's vote! 🗳️`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader icon="📍" title="Find Your Polling Booth" subtitle="Official ECI tools to locate your polling station" badge="Official Sources Only" />

      {/* Important notice */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3 mb-6 text-sm text-blue-300">
        <Info size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Real Booth Data = Official ECI Portal Only</p>
          <p className="text-xs text-blue-300/70">Polling booth assignments are maintained exclusively by the Election Commission of India. This page guides you to the official sources — only ECI data is authoritative.</p>
        </div>
      </div>

      {/* Voter Helpline emergency */}
      <div className="card mb-6 flex items-center gap-4">
        <Phone size={28} className="text-gold flex-shrink-0" />
        <div>
          <p className="font-sora font-bold text-2xl text-gold">1950</p>
          <p className="text-sm text-white/70">National Voter Helpline — Toll Free</p>
          <p className="text-xs text-white/40">Tell them your name + state → get booth address instantly</p>
        </div>
      </div>

      {/* Official portals grid */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-4">🏛️ Official ECI Portals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OFFICIAL_PORTALS.map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-secondary/50 hover:bg-secondary/5 transition-all group">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <p className="text-sm font-semibold group-hover:text-secondary transition-colors">{p.name}</p>
                <p className="text-xs text-white/50">{p.desc}</p>
                <p className="text-xs text-secondary mt-0.5">{p.url.replace('https://', '')} ↗</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Step-by-step guide */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-4">📋 How to Find Your Polling Booth</h3>
        <div className="space-y-4">
          {HOW_TO_FIND.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">{s.step}</div>
              <div className="pt-0.5">
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{s.desc}</p>
                {s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-secondary hover:underline mt-1">
                    <ExternalLink size={11} /> {s.linkText}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Assistant for booth queries */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-2">🤖 Ask VoteSmart AI</h3>
        <p className="text-xs text-white/50 mb-3">Ask any question about finding your booth, verifying your voter details, or the official ECI process.</p>
        <div className="flex gap-2 mb-2">
          <input className="input flex-1 text-sm" placeholder="Your EPIC number (e.g. ABC1234567)" value={epicNumber} onChange={e => setEpicNumber(e.target.value.toUpperCase())} maxLength={10} />
        </div>
        <textarea className="input min-h-[70px] resize-none mb-3 text-sm" placeholder="e.g. How do I find my polling booth? What do I do if my name isn't in voter list?" value={aiQuery} onChange={e => setAiQuery(e.target.value)} />
        <button onClick={askAI} disabled={loading} className="btn-primary w-full">
          {loading ? 'Getting guidance...' : 'Get AI Guidance'}
        </button>
        {aiResponse && (
          <div className="mt-3 p-4 bg-white/5 rounded-xl text-sm text-white/80 leading-relaxed whitespace-pre-wrap border border-white/10">
            <p className="text-xs text-primary mb-2">🤖 VoteSmart AI:</p>
            {aiResponse}
          </div>
        )}

      </div>

      {/* What to bring */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold mb-4">📋 Accepted ID Documents on Election Day</h3>
        <p className="text-xs text-white/50 mb-3">Any ONE of these is sufficient. Source: Election Commission of India.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {WHAT_TO_BRING.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setChecklist(c => ({ ...c, [i]: !c[i] }))}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all border ${checklist[i] ? 'bg-green-500/10 border-green-500/20' : 'border-white/5 hover:border-white/15 bg-white/5'}`}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${checklist[i] ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
                {checklist[i] && <span className="text-white text-xs leading-none">✓</span>}
              </div>
              <span className="text-xs text-white/80">{item}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-white/70">
          <strong className="text-primary">Note:</strong> The EPIC (Voter ID Card) remains the primary document. Alternate IDs are accepted if you forgot your EPIC or are awaiting it. — <em>ECI Circular</em>
        </div>
      </div>

      {/* Share */}
      <button onClick={share} className="btn-secondary w-full flex items-center justify-center gap-2 mb-4">
        <Share2 size={14} /> Share Booth-Finding Guide on WhatsApp
      </button>

      <Footer />
    </div>
  )
}
