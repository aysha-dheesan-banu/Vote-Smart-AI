import React, { useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'
import { getConstituency } from '../utils/api'
import { ProgressContext } from '../App'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const PARTY_COLORS = { BJP: '#FF6600', INC: '#1E90FF', AAP: '#00BCD4', TMC: '#00A86B', SP: '#FF0000', BSP: '#1565C0', JDU: '#4CAF50', Others: '#888888', AITC: '#00A86B' }

export default function Constituency() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { setProgress } = useContext(ProgressContext)

  const search = async () => {
    if (!query.trim()) { toast.error('Enter a constituency name'); return }
    setLoading(true)
    try {
      const result = await getConstituency(query.trim())
      setData(result)
      setProgress('constituency', true)
    } catch {
      toast.error('Failed to fetch constituency data')
    }
    setLoading(false)
  }

  const QUICK_PICKS = ['Varanasi', 'Mumbai North', 'Kolkata North', 'Bengaluru South', 'Hyderabad']

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader icon="🗺️" title="My Constituency" subtitle="Explore your parliamentary constituency in detail" badge="Lok Sabha 2024" />

      <div className="card mb-6">
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input className="input pl-9" placeholder="Enter constituency name (e.g. Varanasi)" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
          </div>
          <button onClick={search} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? '...' : <><MapPin size={15} /> Search</>}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PICKS.map(q => (
            <button key={q} onClick={() => { setQuery(q); }} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all">
              {q}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="card animate-pulse h-48" />}

      {data && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Hero card */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">🗺️</div>
              <div>
                <h2 className="font-sora font-bold text-xl">{data.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="badge-primary">{data.type}</span>
                  <span className="text-sm text-white/60">{data.state}</span>
                </div>
                {data.description && <p className="text-sm text-white/50 mt-2">{data.description}</p>}
              </div>
            </div>
          </div>

          {/* Current rep */}
          <div className="card">
            <h3 className="font-sora font-semibold mb-3">Current Representative</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="font-semibold">{data.currentRep}</p>
                <span className="text-xs px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: PARTY_COLORS[data.party] || '#888' }}>{data.party}</span>
              </div>
            </div>
          </div>

          {/* Election history */}
          {data.results && data.results.length > 0 && (
            <div className="card">
              <h3 className="font-sora font-semibold mb-3">Election History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/40 text-xs">
                      <th className="text-left pb-2">Year</th>
                      <th className="text-left pb-2">Winner</th>
                      <th className="text-left pb-2">Party</th>
                      <th className="text-right pb-2">Margin</th>
                      <th className="text-right pb-2">Turnout</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {data.results.map((r, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="py-2 font-semibold">{r.year}</td>
                        <td className="py-2 text-white/80">{r.winner}</td>
                        <td className="py-2"><span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: PARTY_COLORS[r.party] || '#888' }}>{r.party}</span></td>
                        <td className="py-2 text-right text-white/60">{r.margin?.toLocaleString()}</td>
                        <td className="py-2 text-right text-secondary">{r.turnout}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Issues + Map */}
          <div className="grid md:grid-cols-2 gap-4">
            {data.issues && (
              <div className="card">
                <h3 className="font-sora font-semibold mb-3">Key Local Issues</h3>
                <div className="flex flex-wrap gap-2">
                  {data.issues.map((issue, i) => (
                    <span key={i} className="badge bg-white/10 text-white/70 border border-white/10">{issue}</span>
                  ))}
                </div>
              </div>
            )}

            {data.coordinates && (
              <div className="rounded-2xl overflow-hidden h-40 border border-border">
                <MapContainer center={[data.coordinates.lat, data.coordinates.lng]} zoom={10} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[data.coordinates.lat, data.coordinates.lng]}>
                    <Popup>{data.name}, {data.state}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <Footer />
    </div>
  )
}
