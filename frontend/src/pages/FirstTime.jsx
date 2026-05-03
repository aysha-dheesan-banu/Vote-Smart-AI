import React, { useState, useContext, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { ProgressContext } from '../App'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'

const SCREENS = [
  { title: 'Meet Voti!', emoji: '🤖', subtitle: 'Your Election Guide', text: 'Hi! I\'m Voti, your friendly election robot! I\'m here to guide you through your FIRST voting experience. It\'s easier than you think!', fun: '📊 Fun Fact: India is the world\'s largest democracy with 96.8 crore registered voters!' },
  { title: 'Are You 18?', emoji: '🎂', subtitle: 'Eligibility Check', text: 'To vote in India, you must be 18 years or older on January 1st of the election year. You must also be an Indian citizen. If you qualify — you have the RIGHT to vote!', fun: '🗳️ Fun Fact: The voting age was reduced from 21 to 18 in 1989 by the 61st Constitutional Amendment.' },
  { title: 'Get Your Voter ID', emoji: '🪪', subtitle: 'EPIC Card', text: 'The Electors Photo Identity Card (EPIC) is your voter ID. Apply online at voters.eci.gov.in using Form 6. You can also download the e-EPIC (digital version) on your phone!', fun: '💡 Fun Fact: You can use 12 other photo IDs including Aadhaar, PAN, or Passport if you don\'t have your EPIC.' },
  { title: 'Find Your Booth', emoji: '📍', subtitle: 'Polling Station', text: 'Each voter is assigned a specific polling booth based on their registered address. You can find your booth on voters.eci.gov.in or via the Voter Helpline app. Booths are usually schools or community centers!', fun: '🏫 Fun Fact: There are over 10.5 lakh polling stations across India.' },
  { title: 'Election Day!', emoji: '🗓️', subtitle: 'D-Day Guide', text: 'Polling stations open at 7:00 AM. Carry your Voter ID. You\'ll verify your identity, get ink marked on your left index finger, and then vote on the Electronic Voting Machine (EVM).', fun: '☑️ Fun Fact: The indelible ink used for marking fingers was first used in Indian elections in 1962.' },
  { title: 'The EVM Machine', emoji: '🗳️', subtitle: 'How to Vote', text: 'Inside the voting booth, you\'ll see the EVM — a simple electronic device. Press the button next to your chosen candidate. A beep confirms your vote. The VVPAT machine shows a paper slip for 7 seconds.', fun: '🔒 Fun Fact: EVMs work without internet and cannot be hacked remotely — they\'re standalone devices.' },
  { title: 'What is NOTA?', emoji: '❌', subtitle: 'None Of The Above', text: 'NOTA appears as the last option on the EVM. If you don\'t want to vote for any candidate, you can press NOTA. Your vote is counted separately. It\'s YOUR democratic right!', fun: '📜 Fun Fact: NOTA was introduced in India in 2013 following a Supreme Court order.' },
  { title: 'Your Vote Matters!', emoji: '⭐', subtitle: 'Make a Difference', text: 'In the 2024 election, BJP won Varanasi by 152,513 votes. In Kerala, some seats were won by just a few thousand votes. YOUR vote could be the deciding one. Every vote shapes India\'s future!', fun: '🌟 Fun Fact: India\'s constitution grants every adult citizen equal voting power — from a prime minister to a daily wage worker.' },
]

const QUIZ_QUESTIONS = [
  { q: 'What is the minimum age to vote in India?', options: ['16', '18', '21', '25'], answer: 1 },
  { q: 'What does EPIC stand for?', options: ['Electors Photo Identity Card', 'Election Party Identification Code', 'Electoral Process ID Certificate', 'Electronic Poll Identity Card'], answer: 0 },
  { q: 'What is the Voter Helpline number?', options: ['100', '1800', '1950', '112'], answer: 2 },
  { q: 'NOTA was introduced in India in which year?', options: ['2009', '2011', '2013', '2019'], answer: 2 },
  { q: 'How long is the VVPAT paper slip visible?', options: ['3 seconds', '7 seconds', '10 seconds', '15 seconds'], answer: 1 },
]

export default function FirstTime() {
  const [screen, setScreen] = useState(0)
  const [mode, setMode] = useState('story') // 'story' | 'quiz' | 'cert'
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [userName, setUserName] = useState('')
  const certRef = useRef(null)
  const { setProgress } = useContext(ProgressContext)

  const goNext = () => {
    if (screen < SCREENS.length - 1) {
      setScreen(s => s + 1)
    } else {
      setMode('quiz')
      setProgress('first_timer', true)
    }
  }

  const submitQuiz = () => {
    setQuizSubmitted(true)
    const score = QUIZ_QUESTIONS.filter((q, i) => quizAnswers[i] === q.answer).length
    if (score >= 4) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#ff2d7a', '#00f5d4', '#ffd700'] })
    }
  }

  const score = QUIZ_QUESTIONS.filter((q, i) => quizAnswers[i] === q.answer).length

  if (mode === 'cert') {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div ref={certRef} className="card text-center py-10 px-6 border-2 border-gold relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-primary/5 pointer-events-none" />
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-xs text-gold uppercase tracking-widest mb-2">Certificate of Achievement</p>
          <h2 className="font-sora font-extrabold text-2xl text-white mb-1">{userName || 'Election Champion'}</h2>
          <p className="text-sm text-white/60 mb-4">has completed the First-Time Voter Journey</p>
          <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-4">
            <p className="font-sora font-bold text-3xl text-primary">{score}/5</p>
            <p className="text-xs text-white/60">Quiz Score</p>
          </div>
          <p className="text-xs text-white/40">Issued by VoteSmart AI | India Election 2024</p>
          <p className="text-xs text-primary mt-2">🗳️ Election Ready!</p>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={() => { const text = `I just completed the First-Time Voter course on VoteSmart AI! I scored ${score}/5 on the election quiz. 🗳️ Ready to vote!`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`) }} className="btn-primary flex-1">
            Share on WhatsApp
          </button>
          <button onClick={() => { setMode('story'); setScreen(0); setQuizAnswers({}); setQuizSubmitted(false) }} className="btn-secondary flex-1">Start Over</button>
        </div>
        <Footer />
      </div>
    )
  }

  if (mode === 'quiz') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <PageHeader icon="📝" title="Election Knowledge Quiz" subtitle="Test what you learned from the voter story!" />

        {QUIZ_QUESTIONS.map((qq, i) => (
          <div key={i} className="card mb-4">
            <p className="font-semibold text-sm mb-3">{i + 1}. {qq.q}</p>
            <div className="grid grid-cols-1 gap-2">
              {qq.options.map((opt, j) => {
                let btnClass = 'w-full text-left px-3 py-2 rounded-lg border text-sm transition-all '
                if (!quizSubmitted) {
                  btnClass += quizAnswers[i] === j ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-white/60 hover:border-white/30'
                } else {
                  if (j === qq.answer) btnClass += 'border-green-500 bg-green-500/10 text-green-400'
                  else if (quizAnswers[i] === j) btnClass += 'border-red-500 bg-red-500/10 text-red-400'
                  else btnClass += 'border-white/5 text-white/30'
                }
                return (
                  <button key={j} onClick={() => !quizSubmitted && setQuizAnswers(a => ({ ...a, [i]: j }))} className={btnClass}>
                    {quizSubmitted && j === qq.answer && '✅ '}{quizSubmitted && quizAnswers[i] === j && j !== qq.answer && '❌ '}{opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {!quizSubmitted ? (
          <button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length} className="btn-primary w-full">Submit Answers</button>
        ) : (
          <div className="card text-center">
            <div className="text-4xl mb-2">{score >= 4 ? '🎉' : score >= 3 ? '👍' : '📚'}</div>
            <p className="font-sora font-bold text-2xl text-primary mb-1">{score}/{QUIZ_QUESTIONS.length}</p>
            <p className="text-sm text-white/60 mb-4">{score >= 4 ? 'Excellent! You\'re election-ready!' : score >= 3 ? 'Good job! You know your elections!' : 'Keep learning! Review the story again.'}</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <input className="input text-sm" placeholder="Enter your name for certificate" value={userName} onChange={e => setUserName(e.target.value)} />
              </div>
              <button onClick={() => setMode('cert')} className="btn-primary">Get Certificate</button>
            </div>
          </div>
        )}
        <Footer />
      </div>
    )
  }

  const s = SCREENS[screen]

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader icon="⭐" title="First-Time Voter Journey" subtitle="An interactive guide for new voters" badge={`Screen ${screen + 1}/${SCREENS.length}`} />

      {/* Progress dots */}
      <div className="flex gap-2 justify-center mb-6">
        {SCREENS.map((_, i) => (
          <button key={i} onClick={() => setScreen(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === screen ? 'bg-primary scale-125' : i < screen ? 'bg-primary/40' : 'bg-white/20'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={screen} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="card text-center py-10 px-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="text-7xl mb-4">{s.emoji}</motion.div>
          <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">{s.subtitle}</p>
          <h2 className="font-sora font-extrabold text-2xl mb-4">{s.title}</h2>
          <p className="text-white/70 leading-relaxed mb-6">{s.text}</p>
          <div className="bg-gold/10 border border-gold/20 rounded-xl p-3 text-xs text-gold mb-8">{s.fun}</div>
          <button onClick={goNext} className="btn-primary px-8">
            {screen === SCREENS.length - 1 ? '🧠 Take the Quiz!' : 'Next →'}
          </button>
        </motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
