import React, { useState, useRef, useEffect, useContext } from 'react'
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LangContext } from '../App'
import { streamChat } from '../utils/api'

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m VoteSmart AI. Ask me anything about Indian elections! 🗳️' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { lang } = useContext(LangContext)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    const history = [...messages, userMsg].slice(-6)
    let reply = ''
    setMessages(m => [...m, { role: 'assistant', content: '' }])

    try {
      await streamChat(history, lang, (chunk) => {
        reply += chunk
        setMessages(m => {
          const updated = [...m]
          updated[updated.length - 1] = { role: 'assistant', content: reply }
          return updated
        })
      })
    } catch {
      setMessages(m => {
        const updated = [...m]
        updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
        return updated
      })
    }
    setLoading(false)
  }

  const limitedMessages = messages.slice(-5)

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-80 bg-card border border-border rounded-2xl shadow-card overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-sm">🤖</div>
                <div>
                  <p className="text-sm font-semibold">VoteSmart AI</p>
                  <p className="text-xs text-green-400">● Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost p-1">
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-56 overflow-y-auto p-3 space-y-2">
              {limitedMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-white/90'
                  }`}>
                    {m.content || <TypingDots />}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input
                  className="input text-xs py-2 flex-1"
                  placeholder="Ask about elections..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                />
                <button onClick={send} disabled={loading} className="btn-primary px-3 py-2">
                  <Send size={14} />
                </button>
              </div>
              <a href="/chat" className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                <ExternalLink size={11} /> Open full chat
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 right-4 z-50 lg:bottom-6 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-primary hover:scale-110 active:scale-95 transition-transform"
        style={{ boxShadow: '0 0 25px rgba(255,45,122,0.5)' }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-0.5">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/60 typing-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}
