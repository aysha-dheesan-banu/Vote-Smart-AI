export default function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-white/5 rounded-xl w-1/3" />
      <div className="h-4 bg-white/5 rounded w-2/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card space-y-3">
            <div className="h-5 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-5/6" />
            <div className="h-8 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
