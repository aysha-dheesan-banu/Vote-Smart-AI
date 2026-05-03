import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({ baseURL: BASE })

// Generic section loader — fetches any JSON data file from backend
export const getData = (section) =>
  api.get(`/api/data/${section}`).then(r => r.data)

export async function streamChat(messages, language, onChunk) {
  const response = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, language }),
  })
  if (!response.ok) throw new Error('Chat API error')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}

export const factCheck     = (claim)                => api.post('/api/factcheck', { claim }).then(r => r.data)
export const getConstituency = (query)              => api.post('/api/constituency', { query }).then(r => r.data)
export const getCandidates  = ()                    => getData('candidates')
export const debate         = (question, candidates)=> api.post('/api/candidates/debate', { question, candidates }).then(r => r.data)
export const valuesMatch    = (responses)           => api.post('/api/values/match', { responses }).then(r => r.data)
export const getTimeline    = ()                    => getData('timeline')
export const checkRegistration = (messages)         => api.post('/api/registration/check', { messages, language: 'en' }).then(r => r.data)
export const getQuizQuestions = ()                  => api.get('/api/quiz/questions').then(r => r.data)
export const generateCertificate = (name, score, total) =>
  api.post('/api/quiz/certificate', null, { params: { name, score, total } }).then(r => r.data)
