// src/components/LiveDashboard.jsx
/**
 * @component LiveDashboard
 * @description Displays 4 real-time stat cards: Gate Status, Average Wait Time,
 * Active Alerts, and Crowd Density %. Each card is color-coded by status
 * (ok = teal, warn = amber, alert = red) and includes a trend line.
 * Animated with Framer Motion staggered entrance.
 *
 * @param {{ data: import('../mockData').MockData['dashboard'] }} props
 */
import { motion } from 'framer-motion'
import { DoorOpen, Clock, Bell, Users } from 'lucide-react'

const ICONS = {
  gateStatus:    DoorOpen,
  avgWaitTime:   Clock,
  activeAlerts:  Bell,
  crowdDensity:  Users,
}

const STATUS_STYLES = {
  ok:    { border: 'border-[#1DBFA840]', badge: 'bg-[#1DBFA820] text-[#1DBFA8]', glow: '#1DBFA830', dot: 'bg-[#1DBFA8]' },
  warn:  { border: 'border-[#F59E0B40]', badge: 'bg-[#F59E0B20] text-[#F59E0B]', glow: '#F59E0B20', dot: 'bg-[#F59E0B]' },
  alert: { border: 'border-[#EF444440]', badge: 'bg-[#EF444420] text-[#EF4444]', glow: '#EF444420', dot: 'bg-[#EF4444]' },
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const card = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

/**
 * @component StatCard
 * @description Individual stat card for the dashboard grid.
 */
function StatCard({ id, label, value, subtext, trend, status, percent, icon: Icon }) {
  const s = STATUS_STYLES[status]
  return (
    <motion.div
      variants={card}
      id={`stat-card-${id}`}
      className={`relative glass rounded-2xl p-5 border ${s.border} flex flex-col gap-3 overflow-hidden`}
      style={{ boxShadow: `0 8px 32px ${s.glow}` }}
    >
      {/* Subtle corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-40 pointer-events-none"
        style={{ background: s.glow, transform: 'translate(30%, -30%)' }} />

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${s.badge}`}>
          <Icon size={18} />
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-dm font-medium px-2 py-0.5 rounded-full ${s.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
          {status === 'ok' ? 'Normal' : status === 'warn' ? 'Elevated' : 'Alert'}
        </span>
      </div>

      {/* Value */}
      <div>
        <p className="font-sora text-3xl font-bold text-[#F0EEFF] leading-none">{value}</p>
        <p className="font-dm text-xs text-[#F0EEFF60] mt-1">{subtext}</p>
      </div>

      {/* Crowd density progress bar */}
      {percent !== undefined && (
        <div className="w-full h-1.5 bg-[#F0EEFF10] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #1DBFA8, #4F35D2)' }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
          />
        </div>
      )}

      {/* Label + trend */}
      <div>
        <p className="font-sora text-sm font-semibold text-[#F0EEFF90]">{label}</p>
        <p className="font-dm text-xs text-[#F0EEFF50] mt-0.5">{trend}</p>
      </div>
    </motion.div>
  )
}

export default function LiveDashboard({ data }) {
  const entries = [
    { id: 'gate',    icon: ICONS.gateStatus,   ...data.gateStatus   },
    { id: 'wait',    icon: ICONS.avgWaitTime,   ...data.avgWaitTime  },
    { id: 'alerts',  icon: ICONS.activeAlerts,  ...data.activeAlerts },
    { id: 'density', icon: ICONS.crowdDensity,  ...data.crowdDensity },
  ]

  return (
    <section id="live-dashboard" className="py-8 px-4 sm:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h2 className="font-sora text-2xl font-bold text-[#F0EEFF]">Live Dashboard</h2>
        <p className="font-dm text-sm text-[#F0EEFF60] mt-1">Real-time venue metrics — updated every 30 seconds</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {entries.map(e => <StatCard key={e.id} {...e} />)}
      </motion.div>
    </section>
  )
}
