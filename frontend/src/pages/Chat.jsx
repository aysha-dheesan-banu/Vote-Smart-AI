import React, { useState, useRef, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Send, Copy, Trash2, Globe, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { LangContext } from '../App'
import { streamChat } from '../utils/api'

const QUICK_CHIPS = [
  'How do I register to vote?',
  'What is EVM and is it secure?',
  'When is the next election in India?',
  'What is NOTA?',
  'How do I find my polling booth?',
  'What documents do I need to vote?',
]

export default function Chat() {
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('chat_history') || '[]').slice(-50) }
    catch { return [] }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { lang, setLang } = useContext(LangContext)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages.slice(-50)))
  }, [messages])

  const send = async (text = input) => {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text.trim(), ts: Date.now() }
    const history = [...messages, userMsg]
    setMessages([...history, { role: 'assistant', content: '', ts: Date.now() }])
    setInput('')
    setLoading(true)

    const apiMessages = history.map(m => ({ role: m.role, content: m.content }))
    let reply = ''

    try {
      await streamChat(apiMessages, lang, (chunk) => {
        reply += chunk
        setMessages(m => {
          const updated = [...m]
          updated[updated.length - 1] = { role: 'assistant', content: reply, ts: Date.now() }
          return updated
        })
      })
    } catch {
      setMessages(m => {
        const updated = [...m]
        updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', ts: Date.now() }
        return updated
      })
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  const copyMsg = (content) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied!')
  }

  const clear = () => {
    setMessages([])
    localStorage.removeItem('chat_history')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">🤖</div>
        <div>
          <h2 className="font-sora font-bold text-sm">VoteSmart AI Chat</h2>
          <p className="text-xs text-green-400">● Nonpartisan Indian Election Expert</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} className="btn-ghost text-xs flex items-center gap-1">
            <Globe size={13} /> {lang === 'en' ? 'हिंदी' : 'EN'}
          </button>
          <button onClick={clear} className="btn-ghost p-2"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="font-sora font-bold text-lg mb-2">VoteSmart AI</h3>
            <p className="text-white/50 text-sm max-w-sm mx-auto">Your nonpartisan Indian election assistant. Ask me anything about voting, candidates, or civic rights.</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {QUICK_CHIPS.map(chip => (
                <button key={chip} onClick={() => send(chip)} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/30 transition-all">
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">🤖</div>
            )}
            <div className={`max-w-[80%] group relative ${m.role === 'user' ? 'order-first' : ''}`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary text-white' : 'bg-white/5 text-white/90'}`}>
                {m.content || (m.role === 'assistant' && <TypingDots />)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/30">{m.ts ? new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                {m.content && <button onClick={() => copyMsg(m.content)} className="opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={11} className="text-white/30 hover:text-white" /></button>}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick chips (when there are messages) */}
      {messages.length > 0 && messages.length < 4 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0">
          {QUICK_CHIPS.slice(0, 3).map(chip => (
            <button key={chip} onClick={() => send(chip)} className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:border-white/30 transition-all">
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="input flex-1 text-sm"
            placeholder={lang === 'hi' ? 'चुनाव के बारे में पूछें...' : 'Ask about Indian elections...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} className="btn-primary px-4">
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-white/30 mt-1.5 flex items-center gap-1">
          <Zap size={10} className="text-primary" /> Powered by Claude AI — Nonpartisan • Educational Only
        </p>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-1">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-white/40 typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  )
}
