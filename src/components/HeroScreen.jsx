// src/components/HeroScreen.jsx
/**
 * @component HeroScreen
 * @description Landing screen shown on first load.
 * Displays the VenueIQ brand, tagline, IPL live match card, and a glowing
 * "Get Started" CTA button that transitions to the main dashboard.
 * Animated with Framer Motion fade + slide-up on mount.
 *
 * @param {{ data: Object, matchData: Object, onStart: () => void }} props
 */
import { motion } from 'framer-motion'
import { Zap, MapPin, Trophy, Clock, Users } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay, ease: 'easeOut' },
  }),
}

export default function HeroScreen({ data, matchData, onStart }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 text-center">

      {/* ── Ambient background orbs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#4F35D2] opacity-10 blur-[130px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#1DBFA8] opacity-[0.07] blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#004BA0] opacity-[0.08] blur-[90px]" />
      </div>

      {/* ── Dot-grid texture ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage:'radial-gradient(circle, #F0EEFF 1px, transparent 1px)', backgroundSize:'32px 32px' }} />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center gap-5 max-w-xl w-full">

        {/* Competition badge */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF3740] bg-[#D4AF3710]">
          <Trophy size={13} className="text-[#D4AF37]" />
          <span className="font-dm text-xs font-medium text-[#D4AF37]">{matchData.competition}</span>
        </motion.div>

        {/* App name */}
        <motion.h1 custom={0.1} variants={fadeUp} initial="hidden" animate="visible"
          className="font-sora text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-none">
          <span className="bg-gradient-to-br from-[#F0EEFF] via-[#C8BDFF] to-[#8B6BF8] bg-clip-text text-transparent">Venue</span>
          <span className="bg-gradient-to-br from-[#1DBFA8] to-[#0E8A7C] bg-clip-text text-transparent">IQ</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p custom={0.2} variants={fadeUp} initial="hidden" animate="visible"
          className="font-dm text-lg sm:text-xl text-[#C8BDFF]">
          {data.tagline}
        </motion.p>

        {/* ── Live Match Card ── */}
        <motion.div custom={0.3} variants={fadeUp} initial="hidden" animate="visible"
          className="w-full glass rounded-2xl border border-[#4F35D230] p-4 mt-1">

          {/* Teams row */}
          <div className="flex items-center justify-between gap-3">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-sora font-black text-lg"
                style={{ background:`linear-gradient(135deg, ${matchData.teams.home.color}, ${matchData.teams.home.color}88)`,
                         border:`2px solid ${matchData.teams.home.accent}40`, color: matchData.teams.home.accent }}>
                {matchData.teams.home.short}
              </div>
              <p className="font-dm text-xs text-[#F0EEFF70] leading-tight text-center">{matchData.teams.home.name}</p>
            </div>

            {/* VS + status */}
            <div className="flex flex-col items-center gap-1">
              <span className="font-sora text-xs font-bold text-[#F0EEFF40]">VS</span>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4F35D220] border border-[#4F35D240]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F35D2] animate-pulse" />
                <span className="font-dm text-[10px] text-[#C8BDFF] font-medium">{matchData.phase}</span>
              </div>
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-sora font-black text-lg text-white"
                style={{ background:`linear-gradient(135deg, ${matchData.teams.away.color}, ${matchData.teams.away.color}88)`,
                         border:`2px solid ${matchData.teams.away.accent}40` }}>
                {matchData.teams.away.short}
              </div>
              <p className="font-dm text-xs text-[#F0EEFF70] leading-tight text-center">{matchData.teams.away.name}</p>
            </div>
          </div>

          {/* Match meta */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-[#4F35D215]">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-[#F0EEFF40]" />
              <span className="font-dm text-[11px] text-[#F0EEFF50]">{data.venueName}, {data.venueCity}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-[#F0EEFF40]" />
              <span className="font-dm text-[11px] text-[#F0EEFF50]">KO {data.matchTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-[#F0EEFF40]" />
              <span className="font-dm text-[11px] text-[#F0EEFF50]">{data.capacity.toLocaleString()} cap.</span>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button custom={0.45} variants={fadeUp} initial="hidden" animate="visible"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          onClick={onStart}
          id="hero-get-started-btn"
          className="btn-glow flex items-center gap-2 px-10 py-4 rounded-2xl bg-[#4F35D2] hover:bg-[#6348E8]
            text-white font-sora font-semibold text-lg transition-colors duration-200 cursor-pointer">
          <Zap size={20} />
          Get Started
        </motion.button>

        <motion.p custom={0.55} variants={fadeUp} initial="hidden" animate="visible"
          className="text-xs text-[#F0EEFF30] font-dm">
          Real-time venue intelligence · GPS navigation · No account required
        </motion.p>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background:'linear-gradient(to top, #0A0F2C, transparent)' }} />
    </div>
  )
}
