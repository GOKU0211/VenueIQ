// src/components/QueueTracker.jsx
/**
 * @component QueueTracker
 * @description Displays a list of venue zones with colour-coded wait time badges.
 * Badge colours: green (< 5 min), amber (5–15 min), red (> 15 min).
 * Each row shows the zone name, a mini progress bar for capacity, and a timed badge.
 * Data sourced entirely from the queues array in mockData.
 *
 * @param {{ data: import('../mockData').MockData['queues'] }} props
 */
import { motion } from 'framer-motion'
import { Timer, DoorOpen, UtensilsCrossed, ShowerHead, ShoppingBag } from 'lucide-react'

/** Maps zone IDs to Lucide icons */
const ZONE_ICONS = {
  'gate-a':    DoorOpen,
  'gate-b':    DoorOpen,
  'gate-c':    DoorOpen,
  'food-court':UtensilsCrossed,
  'restrooms': ShowerHead,
  'merch':     ShoppingBag,
}

/**
 * Returns Tailwind-compatible colour classes for a given wait time.
 * @param {number} min
 */
function waitColor(min) {
  if (min < 5)  return { bg: 'bg-[#1DBFA820]', border: 'border-[#1DBFA840]', text: 'text-[#1DBFA8]', bar: '#1DBFA8', label: 'Low' }
  if (min <= 15) return { bg: 'bg-[#F59E0B20]', border: 'border-[#F59E0B40]', text: 'text-[#F59E0B]', bar: '#F59E0B', label: 'Moderate' }
  return         { bg: 'bg-[#EF444420]', border: 'border-[#EF444440]', text: 'text-[#EF4444]', bar: '#EF4444', label: 'Busy' }
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const row = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease: 'easeOut' } },
}

export default function QueueTracker({ data }) {
  return (
    <section id="queue-tracker" className="py-4 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5"
      >
        <h2 className="font-sora text-2xl font-bold text-[#F0EEFF] flex items-center gap-2">
          <Timer size={22} className="text-[#1DBFA8]" />
          Queue Tracker
        </h2>
        <p className="font-dm text-sm text-[#F0EEFF60] mt-1">Live wait times across all venue zones</p>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4 mb-4 flex-wrap"
      >
        {[
          { label: 'Under 5 min', color: '#1DBFA8' },
          { label: '5–15 min',    color: '#F59E0B' },
          { label: 'Over 15 min', color: '#EF4444' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            <span className="font-dm text-xs text-[#F0EEFF60]">{l.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Zone list */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {data.map(zone => {
          const c = waitColor(zone.waitMin)
          const Icon = ZONE_ICONS[zone.id] || Timer
          return (
            <motion.div
              key={zone.id}
              variants={row}
              id={`queue-row-${zone.id}`}
              className="glass rounded-xl border border-[#4F35D220] px-4 py-3.5 flex items-center gap-4"
            >
              {/* Zone icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg} border ${c.border}`}>
                <Icon size={18} className={c.text} />
              </div>

              {/* Zone info */}
              <div className="flex-1 min-w-0">
                <p className="font-sora text-sm font-semibold text-[#F0EEFF] truncate">{zone.zone}</p>
                {/* Capacity bar */}
                <div className="w-full h-1 bg-[#F0EEFF10] rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: c.bar }}
                    initial={{ width: 0 }}
                    animate={{ width: `${zone.capacity}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
                <p className="font-dm text-[10px] text-[#F0EEFF40] mt-1">{zone.capacity}% capacity</p>
              </div>

              {/* Wait badge */}
              <div className={`flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl border ${c.bg} ${c.border}`}>
                <span className={`font-sora text-lg font-bold leading-none ${c.text}`}>{zone.waitMin}</span>
                <span className={`font-dm text-[10px] font-medium ${c.text}`}>min</span>
              </div>

              {/* Status label */}
              <div className={`hidden sm:flex flex-shrink-0 text-xs font-dm font-medium px-2.5 py-1 rounded-full border ${c.bg} ${c.border} ${c.text}`}>
                {c.label}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
