import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { AuthContext } from '../App'
import { createPKCE } from '../utils/pkce'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSSO = async () => {
    try {
      const { verifier, challenge } = await createPKCE();
      const state = crypto.randomUUID();

      sessionStorage.setItem('pkce_verifier', verifier);
      sessionStorage.setItem('oauth_state', state);

      const isProd = window.location.hostname === 'project.dhilip.in'
      
      // The consent screen is ALWAYS on the frontend domain
      const ssoFrontend = isProd ? 'https://wytnet.com' : (import.meta.env.VITE_SSO_URL || 'http://localhost:3000')
      
      const redirectUri = window.location.origin + '/callback'
      const authPath = isProd ? '/consent/authorize' : '/oauth/authorize'

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: import.meta.env.VITE_CLIENT_ID || 'client_Qp_NU6L_ltuKCTOfnL4KGg',
        redirect_uri: redirectUri,
        scope: 'openid profile email',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      });

      window.location.href = `${ssoFrontend}${authPath}?${params}`;
    } catch (err) {
      console.error('SSO Redirect Error:', err);
      toast.error('Failed to start SSO flow');
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const users = JSON.parse(localStorage.getItem('vs_users') || '[]')
    const user = users.find(u => u.email === form.email && u.password === form.password)
    if (!user) { toast.error('Invalid email or password'); setLoading(false); return }
    localStorage.setItem('vs_user', JSON.stringify(user))
    setUser(user)
    toast.success(`Welcome back, ${user.name}!`)
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
              <h1 className="font-sora font-bold text-2xl mt-3 mb-1">Welcome back</h1>
              <p className="text-sm text-white/50">Sign in to your VoteSmart AI account</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-base font-semibold rounded-xl mt-2">
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-white/40">Or continue with</span></div>
            </div>

            <button 
              onClick={handleSSO}
              className="w-full bg-white text-black py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors mb-4"
            >
              <span className="text-xl">🛡️</span>
              Sign in with WytPass SSO
            </button>

            <p className="text-center text-sm text-white/40 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-semibold">Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
