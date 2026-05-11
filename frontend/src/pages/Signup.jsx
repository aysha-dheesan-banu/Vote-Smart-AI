import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { AuthContext } from '../App'

export default function Signup() {
  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Fill in all fields'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const users = JSON.parse(localStorage.getItem('vs_users') || '[]')
    if (users.find(u => u.email === form.email)) { toast.error('Account already exists with this email'); setLoading(false); return }
    const user = { name: form.name, email: form.email, password: form.password, joined: new Date().toISOString() }
    users.push(user)
    localStorage.setItem('vs_users', JSON.stringify(users))
    localStorage.setItem('vs_user', JSON.stringify(user))
    setUser(user)
    toast.success(`Welcome, ${form.name}!`)
    navigate('/home')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🗳️</span>
          <span className="font-sora font-bold text-lg">VoteSmart <span className="text-primary">AI</span></span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-card border border-border rounded-3xl p-8">
            <div className="text-center mb-8">
              <span className="text-4xl">🗳️</span>
              <h1 className="font-sora font-bold text-2xl mt-3 mb-1">Create your account</h1>
              <p className="text-sm text-white/50">Join millions of informed Indian voters</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Full name</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Ayisha Dheesana"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Email address</label>
                <input
                  type="email"
                  className="input w-full"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Password</label>
                <input
                  type="password"
                  className="input w-full"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Confirm password</label>
                <input
                  type="password"
                  className="input w-full"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                />
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-base font-semibold rounded-xl mt-2">
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>

            <p className="text-center text-xs text-white/30 mt-4">
              By signing up you agree to use this app for educational purposes only.
            </p>
            <p className="text-center text-sm text-white/40 mt-3">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
