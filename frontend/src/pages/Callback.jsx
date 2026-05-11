import React, { useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AuthContext } from '../App'

export default function Callback() {
  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext)

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      const error = params.get('error')

      if (error) {
        toast.error(`Auth Error: ${error}`)
        navigate('/login')
        return
      }

      if (!code) {
        navigate('/login')
        return
      }

      // 1. Verify state
      const savedState = sessionStorage.getItem('oauth_state')
      if (state !== savedState) {
        toast.error('Invalid state - potential CSRF attack')
        navigate('/login')
        return
      }

      const verifier = sessionStorage.getItem('pkce_verifier')
      
      const isProd = window.location.hostname === 'project.dhilip.in'
      // Force https://wytnet.com in production if the env var is missing or points to the old IP
      const ssoUrl = (isProd && (!import.meta.env.VITE_SSO_URL || import.meta.env.VITE_SSO_URL.includes('72.61.174.122')))
        ? 'https://wytnet.com' 
        : (import.meta.env.VITE_SSO_URL || 'http://localhost:8000')

      const redirectUri = window.location.origin + '/callback'
      
      try {
        // 2. Exchange code for tokens
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: import.meta.env.VITE_CLIENT_ID || 'client_5XUv807ZGIcV5LG0R-CE6w',
          code_verifier: verifier,
        })

        console.log('Exchanging code for tokens at:', `${ssoUrl}/oauth/token`)
        
        const resp = await fetch(`${ssoUrl}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        }).catch(err => {
          if (ssoUrl.startsWith('http://') && window.location.protocol === 'https:') {
            throw new Error('Insecure connection blocked. Your SSO URL must be HTTPS in production.')
          }
          throw err
        })

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}))
          throw new Error(errData.error_description || 'Failed to exchange code')
        }

        const tokens = await resp.json()

        // 3. Save tokens
        localStorage.setItem('access_token', tokens.access_token)
        if (tokens.refresh_token) localStorage.setItem('refresh_token', tokens.refresh_token)
        if (tokens.id_token) localStorage.setItem('id_token', tokens.id_token)

        // 4. Get User Info
        const userResp = await fetch(`${ssoUrl}/oauth/userinfo`, {
          headers: { 'Authorization': `Bearer ${tokens.access_token}` }
        })
        
        if (!userResp.ok) throw new Error('Failed to fetch user info')
        const userData = await userResp.json()
        
        const user = {
          id: userData.sub,
          name: userData.name || userData.email?.split('@')[0] || 'User',
          email: userData.email,
          picture: userData.picture
        }

        localStorage.setItem('vs_user', JSON.stringify(user))
        setUser(user)
        
        // 5. Cleanup and redirect
        sessionStorage.removeItem('oauth_state')
        sessionStorage.removeItem('pkce_verifier')

        toast.success(`Welcome, ${user.name}!`)
        navigate('/home', { replace: true })
      } catch (err) {
        console.error('SSO Callback Error:', err)
        toast.error(err.message || 'Login failed')
        navigate('/login', { replace: true })
      }
    }

    handleCallback()
  }, [navigate, setUser])

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">🗳️</div>
        <h2 className="text-xl font-sora font-bold">Completing sign in...</h2>
        <p className="text-white/50 text-sm mt-2">Please wait while we verify your credentials.</p>
      </div>
    </div>
  )
}
