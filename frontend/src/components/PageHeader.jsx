import { motion } from 'framer-motion'

export default function PageHeader({ icon, title, subtitle, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {badge && (
        <span className="badge-primary mb-3 inline-flex">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="text-3xl">{icon}</span>}
        <h1 className="section-title">{title}</h1>
      </div>
      {subtitle && <p className="text-white/60 text-sm max-w-xl">{subtitle}</p>}
    </motion.div>
  )
}
