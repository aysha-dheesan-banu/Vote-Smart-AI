export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-2">Official Resources</h4>
            <ul className="space-y-1">
              {[
                { label: 'ECI Official Site', url: 'https://eci.gov.in' },
                { label: 'Voter Registration', url: 'https://voters.eci.gov.in' },
                { label: 'NVSP Portal', url: 'https://nvsp.in' },
              ].map(l => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-white/50 hover:text-secondary transition-colors">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-2">Helplines</h4>
            <ul className="space-y-1 text-xs text-white/50">
              <li>Voter Helpline: <span className="text-gold">1950</span></li>
              <li>ECI Toll-free: <span className="text-gold">1800-111-950</span></li>
              <li>cVIGIL App for violations</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-white/30 border-t border-border pt-4">
          <p>VoteSmart AI — Empowering Indian Voters with AI</p>
        </div>
      </div>
    </footer>
  )
}
