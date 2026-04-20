// src/components/MatchBanner.jsx
/**
 * @component MatchBanner
 * @description A compact live match info strip displayed below the TopNav.
 * Shows the IPL match teams, venue, match time, and current phase status.
 * Styled in team brand colours with a pulsing "LIVE" indicator.
 *
 * @param {{ data: import('../mockData').MockData['liveMatch'], venue: Object }} props
 */
import { motion } from 'framer-motion'
import { Trophy, MapPin, Clock } from 'lucide-react'

export default function MatchBanner({ data, venue }) {
  return (
    <motion.div
      id="match-banner"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="w-full bg-[#080D24] border-b border-[#4F35D215]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2">

        {/* Competition label */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Trophy size={13} className="text-[#D4AF37]" />
          <span className="font-sora text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
            {data.competition}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Home team */}
          <span
            className="font-sora text-sm font-bold px-2.5 py-0.5 rounded-md"
            style={{
              background: `${data.teams.home.color}30`,
              color: data.teams.home.accent,
              border: `1px solid ${data.teams.home.color}50`,
            }}
          >
            {data.teams.home.short}
          </span>
          <span className="font-dm text-xs text-[#F0EEFF40]">vs</span>
          {/* Away team */}
          <span
            className="font-sora text-sm font-bold px-2.5 py-0.5 rounded-md"
            style={{
              background: `${data.teams.away.color}30`,
              color: '#F0EEFF',
              border: `1px solid ${data.teams.away.color}50`,
            }}
          >
            {data.teams.away.short}
          </span>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4F35D215] border border-[#4F35D230] flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F35D2] animate-pulse" />
          <span className="font-dm text-[11px] font-medium text-[#C8BDFF]">{data.phase}</span>
        </div>

        {/* Venue + time — pushed right on wide screens */}
        <div className="flex items-center gap-4 sm:ml-auto flex-wrap gap-y-1">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-[#F0EEFF40]" />
            <span className="font-dm text-[11px] text-[#F0EEFF50]">{venue.venueName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-[#F0EEFF40]" />
            <span className="font-dm text-[11px] text-[#F0EEFF50]">KO {venue.matchTime}</span>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
