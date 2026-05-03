import React, { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, ExternalLink, Share2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { ProgressContext } from '../App'
import { getData, checkRegistration } from '../utils/api'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import LoadingSkeleton from '../components/LoadingSkeleton'

const WIZARD_STEPS = [
  { title: 'Check Eligibility', icon: '✅' },
  { title: 'Registration Status', icon: '🔍' },
  { title: 'Required Documents', icon: '📄' },
  { title: 'Download e-EPIC', icon: '📱' },
]

export default function Registration() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(0)
  const [age, setAge] = useState('')
  const [citizen, setCitizen] = useState(null)
  const [eligible, setEligible] = useState(null)
  const [query, setQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [checkedDocs, setCheckedDocs] = useState({})
  const { setProgress } = useContext(ProgressContext)

  const load = () => {
    setLoading(true)
    setError(null)
    getData('registration')
      .then(setData)
      .catch(() => setError('Failed to load registration data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const checkEligibility = () => {
    const a = parseInt(age)
    const minAge = data?.eligibility_criteria?.min_age || 18
    if (isNaN(a) || a < 1) { toast.error('Please enter a valid age'); return }
    setEligible(a >= minAge && citizen === 'yes')
    setStep(1)
    if (a >= minAge && citizen === 'yes') setProgress('registered', true)
  }

  const checkStatus = async () => {
    if (!query.trim()) { toast.error('Please enter your query'); return }
    setAiLoading(true)
    try {
      const msgs = [{ role: 'user', content: query }]
      const res = await checkRegistration(msgs)
      setAiResponse(res.response)
    } catch {
      toast.error('Failed to fetch. Please try again.')
    }
    setAiLoading(false)
  }

  const shareWhatsApp = () => {
    const text = `Check if you're eligible to vote in India! Visit voters.eci.gov.in to register. Check your status with VoteSmart AI!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  if (loading) return <LoadingSkeleton />
  if (error) return (
    <div className="p-6 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={load} className="btn-primary flex items-center gap-2 mx-auto"><RefreshCw size={14} /> Retry</button>
    </div>
  )
  if (!data) return null

  const { meta, eligibility_criteria, registration_steps, common_issues } = data
  const docsStep = registration_steps?.find(s => s.step === 5)
  const epicStep = registration_steps?.find(s => s.step === 6)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader icon="📋" title="Registration Guide" subtitle="Complete your voter registration in 4 easy steps" badge="Official ECI Process" />

      {/* Source banner */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 mb-6">
        📌 Source: {meta.source}
      </div>

      {/* Step progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {WIZARD_STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <button
              onClick={() => step >= i && setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                step === i ? 'bg-primary text-white' :
                step > i ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'
              }`}
            >
              {step > i ? <Check size={12} /> : <span>{s.icon}</span>}
              <span className="hidden sm:inline">{s.title}</span>
            </button>
            {i < WIZARD_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded ${step > i ? 'bg-primary' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card space-y-5">
            <h2 className="font-sora font-bold text-lg">Am I eligible to vote?</h2>
            <p className="text-xs text-white/40">Source: {eligibility_criteria?.source}</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Your age as of January 1st of the election year</label>
                <input type="number" className="input" placeholder="Enter your age" value={age} onChange={e => setAge(e.target.value)} min="1" max="120" />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-2 block">Are you an Indian citizen?</label>
                <div className="flex gap-3">
                  <button onClick={() => setCitizen('yes')} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${citizen === 'yes' ? 'bg-secondary/20 border-secondary text-secondary' : 'border-white/10 text-white/60 hover:border-white/30'}`}>Yes</button>
                  <button onClick={() => setCitizen('no')} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${citizen === 'no' ? 'bg-red-500/20 border-red-400 text-red-400' : 'border-white/10 text-white/60 hover:border-white/30'}`}>No</button>
                </div>
              </div>
            </div>

            {/* Disqualifications */}
            {eligibility_criteria?.disqualifications?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-xs text-red-400 font-semibold mb-1">Not eligible if:</p>
                {eligibility_criteria.disqualifications.map((d, i) => (
                  <p key={i} className="text-xs text-red-300/70">• {d}</p>
                ))}
              </div>
            )}

            <button onClick={checkEligibility} disabled={!citizen || !age} className="btn-primary w-full flex items-center justify-center gap-2">
              Check Eligibility <ChevronRight size={16} />
            </button>

            {eligible !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-xl border ${eligible ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                {eligible
                  ? '✅ Great! You are eligible to vote. Proceed to check your registration status.'
                  : citizen === 'no'
                    ? '❌ Only Indian citizens are eligible to vote.'
                    : `❌ You must be at least ${eligibility_criteria?.min_age || 18} years old on January 1st of the election year.`}
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card space-y-4">
            <h2 className="font-sora font-bold text-lg">Check Registration Status</h2>
            <p className="text-sm text-white/60">Ask our AI assistant or visit the official portal.</p>

            {/* Registration steps from backend */}
            {registration_steps?.slice(0, 2).map(s => (
              <div key={s.step} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-white/50 mt-0.5">{s.desc}</p>
                  {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary hover:underline mt-1 inline-flex items-center gap-1"><ExternalLink size={10} /> {s.link.replace('https://', '')}</a>}
                  {s.source && <p className="text-xs text-white/25 mt-1">📌 {s.source}</p>}
                </div>
              </div>
            ))}

            <textarea className="input min-h-[100px] resize-none" placeholder="e.g. How do I check if I'm registered to vote? / How do I apply for voter ID?" value={query} onChange={e => setQuery(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={checkStatus} disabled={aiLoading} className="btn-primary flex-1">
                {aiLoading ? 'Asking AI...' : 'Ask VoteSmart AI'}
              </button>
              <a href="https://electoralsearch.eci.gov.in" target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-1">
                Official Portal <ExternalLink size={13} />
              </a>
            </div>
            {aiResponse && (
              <div className="bg-white/5 rounded-xl p-4 text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                <p className="text-xs text-primary mb-2">🤖 VoteSmart AI Response:</p>
                {aiResponse}
              </div>
            )}

            <button onClick={() => setStep(2)} className="btn-ghost w-full flex items-center justify-center gap-2">
              Next: Document Checklist <ChevronRight size={14} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card space-y-4">
            <h2 className="font-sora font-bold text-lg">Required Documents</h2>
            <p className="text-xs text-white/40">Source: {docsStep?.source}</p>
            <p className="text-sm text-white/60">Check off documents you have ready:</p>
            <div className="space-y-2">
              {docsStep?.required?.map((doc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setCheckedDocs(c => ({ ...c, [i]: !c[i] }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checkedDocs[i] ? 'bg-green-500/10 border-green-500/30' : 'border-white/10 hover:border-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${checkedDocs[i] ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
                    {checkedDocs[i] && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm flex-1">{doc.doc}</span>
                  {doc.mandatory && <span className="text-xs text-red-400">Required</span>}
                </motion.div>
              ))}
            </div>

            {/* Form guide from backend */}
            {registration_steps?.find(s => s.step === 3)?.forms && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-primary font-semibold mb-2">Which Form to Use?</p>
                {registration_steps.find(s => s.step === 3).forms.map(f => (
                  <p key={f.form} className="text-xs text-white/60 mb-1"><strong className="text-white">{f.form}:</strong> {f.use}</p>
                ))}
              </div>
            )}

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-sm">
              <strong>Apply online:</strong> Visit <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">voters.eci.gov.in</a> → New Registration → Fill Form 6
            </div>
            <button onClick={() => setStep(3)} className="btn-primary w-full flex items-center justify-center gap-2">
              Next: Get e-EPIC <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card space-y-4">
            <h2 className="font-sora font-bold text-lg">Download your e-EPIC</h2>
            <p className="text-xs text-white/40">Source: {epicStep?.source}</p>
            <p className="text-sm text-white/60">{epicStep?.desc || 'e-EPIC is the digital version of your Voter ID card.'}</p>
            {[
              'Visit voters.eci.gov.in or download the Voter Helpline App',
              'Click on "e-EPIC Download" option',
              'Enter your EPIC number or reference number (from Form 6 submission)',
              'Verify with OTP sent to registered mobile number',
              'Download your e-EPIC as a PDF — it is a valid ID for voting!',
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">{i + 1}</div>
                <p className="text-sm text-white/80 pt-1">{s}</p>
              </div>
            ))}

            {/* Common issues */}
            {common_issues?.length > 0 && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-primary font-semibold mb-2">Common Issues & Solutions</p>
                {common_issues.map((ci, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-xs font-semibold text-white">{ci.issue}</p>
                    <p className="text-xs text-white/50">{ci.solution}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <a href={epicStep?.link || 'https://voters.eci.gov.in'} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-1.5">
                Get e-EPIC <ExternalLink size={14} />
              </a>
              <button onClick={shareWhatsApp} className="btn-secondary flex items-center gap-1.5">
                <Share2 size={14} /> Share with Family
              </button>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400">
              🎉 Congratulations! You've completed the registration guide. Now you're ready to vote!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  )
}
