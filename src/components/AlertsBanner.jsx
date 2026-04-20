// src/components/AlertsBanner.jsx
/**
 * @component AlertsBanner
 * @description A horizontally scrolling marquee ticker strip showing live venue
 * announcements. Alerts are sourced entirely from mockData.alerts.
 * The strip pauses on hover. Supports info, warning, and success alert types
 * with appropriate colour accents.
 *
 * @param {{ data: import('../mockData').MockData['alerts'] }} props
 */
import { motion } from 'framer-motion'
import { Radio } from 'lucide-react'

/** Colour map per alert type */
const TYPE_STYLE = {
  info:    'text-[#C8BDFF]',
  warning: 'text-[#F59E0B]',
  success: 'text-[#1DBFA8]',
  alert:   'text-[#EF4444]',
}

export default function AlertsBanner({ data }) {
  // Duplicate alerts so the ticker feels infinite
  const repeated = [...data, ...data, ...data]

  return (
    <motion.div
      id="alerts-banner"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-[#0D1235] border-y border-[#4F35D225] overflow-hidden"
    >
      <div className="flex items-center">
        {/* Static prefix label */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#4F35D2] flex-shrink-0 z-10">
          <Radio size={14} className="text-white animate-pulse" />
          <span className="font-sora text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">
            Live Alerts
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative">
          {/* Left fade mask */}
          <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #0D1235, transparent)' }} />
          {/* Right fade mask */}
          <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #0D1235, transparent)' }} />

          <div className="ticker-track inline-flex items-center gap-8 py-2.5 px-4">
            {repeated.map((alert, i) => (
              <span
                key={`${alert.id}-${i}`}
                className={`font-dm text-sm font-medium whitespace-nowrap ${TYPE_STYLE[alert.type] ?? 'text-[#F0EEFF90]'}`}
              >
                {alert.text}
                <span className="ml-8 text-[#F0EEFF20]">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
