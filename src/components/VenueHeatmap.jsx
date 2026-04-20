// src/components/VenueHeatmap.jsx
/**
 * @component VenueHeatmap
 * @description Live crowd density heatmap for Wankhede Stadium rendered as an
 * interactive SVG top-down view. Sections are donut-arc segments coloured on a
 * teal → blue → amber → orange → red heat scale proportional to real-time
 * crowd density. High-density zones breathe with a Framer Motion pulse.
 * A live simulation hook slightly randomises densities every 6 seconds to
 * emulate a real data stream. Gate markers and food court hotspots are overlaid
 * on the stadium boundary.
 *
 * @param {{ sections: Array, gates: Array, totalPresent: number, capacity: number }} props
 */
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Users, RefreshCw, Info } from 'lucide-react'

/* ── Stadium SVG constants ── */
const CX = 400, CY = 235
const OUTER = { rx: 335, ry: 195 }
const INNER = { rx: 118, ry: 70 }

/** Convert degree angle to {x, y} on an ellipse */
const ep = (rx, ry, deg) => {
  const a = (deg * Math.PI) / 180
  return { x: +(CX + rx * Math.cos(a)).toFixed(2), y: +(CY + ry * Math.sin(a)).toFixed(2) }
}

/**
 * Builds the SVG path for a donut arc segment.
 * @param {number} start - Start angle in degrees
 * @param {number} end   - End angle in degrees
 */
function arcPath(start, end) {
  const p1 = ep(OUTER.rx, OUTER.ry, start)
  const p2 = ep(OUTER.rx, OUTER.ry, end)
  const p3 = ep(INNER.rx, INNER.ry, end)
  const p4 = ep(INNER.rx, INNER.ry, start)
  const la = (end - start) > 180 ? 1 : 0
  return `M${p1.x} ${p1.y} A${OUTER.rx} ${OUTER.ry} 0 ${la} 1 ${p2.x} ${p2.y} L${p3.x} ${p3.y} A${INNER.rx} ${INNER.ry} 0 ${la} 0 ${p4.x} ${p4.y} Z`
}

/** Mid-point for section labels at ~68% of radial depth */
function labelPt(start, end) {
  const mid = (start + end) / 2
  const f = 0.62
  return ep(
    INNER.rx + (OUTER.rx - INNER.rx) * f,
    INNER.ry + (OUTER.ry - INNER.ry) * f,
    mid
  )
}

/**
 * Maps a density % to a heat color on the scale:
 * teal → blue → amber → orange → red
 */
function heatColor(pct) {
  if (pct < 40)  return '#1DBFA8'
  if (pct < 55)  return '#3B82F6'
  if (pct < 70)  return '#F59E0B'
  if (pct < 82)  return '#F97316'
  return '#EF4444'
}
function heatOpacity(pct) { return 0.52 + (pct / 100) * 0.42 }

/** Number of simulated "people dots" per density level */
function dotCount(pct) { return Math.round(pct / 100 * 14) }

/* ── Static section definitions (60° arcs, clockwise from East) ── */
const BASE_SECTIONS = [
  { id: 'east',  label: 'Garware Pavilion',   start:  0, end:  60, density: 58, shortLabel: 'GP'  },
  { id: 'se',    label: 'Vijay Merchant Stand',start: 60, end: 120, density: 44, shortLabel: 'VM'  },
  { id: 'sw',    label: 'South West Block',   start:120, end: 180, density: 50, shortLabel: 'SW'  },
  { id: 'west',  label: 'VIP / Media West',   start:180, end: 240, density: 91, shortLabel: 'VIP' },
  { id: 'nw',    label: 'North Stand',        start:240, end: 300, density: 76, shortLabel: 'NS'  },
  { id: 'ne',    label: 'Sachin Tendulkar Stand', start:300, end:360, density: 82, shortLabel: 'STS'},
]

/* Gates on the outer ring (angle on the ellipse) */
const GATE_MARKERS = [
  { id: 'gate-1', label: 'G1', angle: 270, operational: true,  closingSoon: false },
  { id: 'gate-3', label: 'G3', angle: 345, operational: true,  closingSoon: false },
  { id: 'gate-5', label: 'G5', angle: 90,  operational: true,  closingSoon: false },
  { id: 'gate-7', label: 'G7', angle: 185, operational: true,  closingSoon: true  },
  { id: 'gate-9', label: 'G9', angle: 320, operational: false, closingSoon: false },
]

/* Food court hotspots (cx%, cy% relative to SVG 800×470) */
const FOOD_COURTS = [
  { id: 'fc-1', label: 'Food Court A', cx: 595, cy: 135, density: 68 },
  { id: 'fc-2', label: 'Food Court B', cx: 210, cy: 330, density: 54 },
  { id: 'fc-3', label: 'Merch Store',  cx: 610, cy: 320, density: 82 },
]

/* ── Legend items ── */
const LEGEND = [
  { label: '< 40%',  color: '#1DBFA8' },
  { label: '40–55%', color: '#3B82F6' },
  { label: '55–70%', color: '#F59E0B' },
  { label: '70–82%', color: '#F97316' },
  { label: '> 82%',  color: '#EF4444' },
]

export default function VenueHeatmap({ totalPresent, capacity }) {
  const [sections, setSections] = useState(BASE_SECTIONS)
  const [tick, setTick]         = useState(0)
  const [tooltip, setTooltip]   = useState(null)

  /* Simulate live data — slight random drift every 6 s */
  useEffect(() => {
    const id = setInterval(() => {
      setSections(prev => prev.map(s => ({
        ...s,
        density: Math.min(99, Math.max(10, s.density + (Math.random() * 6 - 3))),
      })))
      setTick(t => t + 1)
    }, 6000)
    return () => clearInterval(id)
  }, [])

  /* Deterministic dot positions per section (seeded from id) */
  const dotsBySectionId = useMemo(() =>
    Object.fromEntries(sections.map(s => [
      s.id,
      Array.from({ length: dotCount(s.density) }, (_, i) => {
        const mid = (s.start + s.end) / 2
        const spreadDeg = (s.end - s.start) * 0.38
        const angle = mid - spreadDeg + (i / dotCount(s.density)) * spreadDeg * 2
        const frac  = 0.28 + (((i * 137) % 7) / 10) * 0.65
        return ep(
          INNER.rx + (OUTER.rx - INNER.rx) * frac,
          INNER.ry + (OUTER.ry - INNER.ry) * frac,
          angle
        )
      }),
    ])),
  [sections])

  const totalDensity = Math.round((totalPresent / capacity) * 100)

  return (
    <section id="venue-heatmap" className="py-4 px-4 sm:px-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.4 }} className="mb-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-sora text-2xl font-bold text-[#F0EEFF] flex items-center gap-2">
              <Flame size={22} className="text-[#EF4444]" />
              Live Crowd Heatmap
            </h2>
            <p className="font-dm text-sm text-[#F0EEFF60] mt-1">
              Real-time density across Wankhede Stadium · simulated live feed
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#4F35D225]">
            <RefreshCw size={12} className="text-[#4F35D2] animate-spin" style={{ animationDuration:'4s' }}/>
            <span className="font-dm text-xs text-[#F0EEFF60]">Live · updates every 6s</span>
          </div>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
        className="flex flex-wrap gap-3 mb-4">
        {[
          { label:'Present',   value: totalPresent.toLocaleString(), color:'#F0EEFF' },
          { label:'Capacity',  value: `${totalDensity}%`,             color: heatColor(totalDensity) },
          { label:'Hot Zones', value: sections.filter(s=>s.density>75).length, color:'#EF4444' },
          { label:'Cool Zones',value: sections.filter(s=>s.density<55).length, color:'#1DBFA8' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl border border-[#4F35D220] px-4 py-2.5 flex items-center gap-3">
            <span className="font-sora text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
            <span className="font-dm text-xs text-[#F0EEFF50]">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* ── Main SVG heatmap ── */}
      <motion.div initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }}
        transition={{ duration:0.5 }}
        className="glass rounded-2xl border border-[#4F35D225] overflow-hidden relative">

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-10 glass rounded-xl border border-[#4F35D230] px-4 py-2.5 text-center pointer-events-none"
            >
              <p className="font-sora text-sm font-semibold text-[#F0EEFF]">{tooltip.label}</p>
              <p className="font-dm text-xs mt-0.5" style={{ color: heatColor(tooltip.density) }}>
                {Math.round(tooltip.density)}% density
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <svg
          viewBox="0 0 800 470"
          className="w-full"
          style={{ maxHeight: 480 }}
          aria-label="Wankhede Stadium crowd heatmap"
        >
          {/* ── defs: radial gradients for glow ── */}
          <defs>
            {sections.map(s => (
              <radialGradient key={`rg-${s.id}`} id={`rg-${s.id}`} gradientUnits="userSpaceOnUse"
                cx={labelPt(s.start, s.end).x} cy={labelPt(s.start, s.end).y} r="160">
                <stop offset="0%"   stopColor={heatColor(s.density)} stopOpacity={heatOpacity(s.density)}/>
                <stop offset="100%" stopColor={heatColor(s.density)} stopOpacity={heatOpacity(s.density) * 0.35}/>
              </radialGradient>
            ))}
            {FOOD_COURTS.map(f => (
              <radialGradient key={`rg-${f.id}`} id={`rg-${f.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={heatColor(f.density)} stopOpacity="0.8"/>
                <stop offset="100%" stopColor={heatColor(f.density)} stopOpacity="0"/>
              </radialGradient>
            ))}
          </defs>

          {/* ── Background ── */}
          <rect width="800" height="470" fill="#0A0F2C"/>

          {/* ── Outer stadium boundary (shadow) ── */}
          <ellipse cx={CX} cy={CY} rx={OUTER.rx+10} ry={OUTER.ry+10}
            fill="none" stroke="#4F35D210" strokeWidth="20"/>

          {/* ── Section arcs (heatmap fill) ── */}
          {sections.map(s => {
            const hot = s.density > 75
            return (
              <motion.path
                key={s.id}
                d={arcPath(s.start, s.end)}
                fill={`url(#rg-${s.id})`}
                stroke="#0A0F2C"
                strokeWidth="1.5"
                cursor="pointer"
                onMouseEnter={() => setTooltip(s)}
                onMouseLeave={() => setTooltip(null)}
                animate={hot ? {
                  opacity: [1, 0.72, 1],
                } : { opacity: 1 }}
                transition={hot ? { duration: 2.8, repeat: Infinity, ease:'easeInOut' } : {}}
              />
            )
          })}

          {/* ── Outer ring stroke ── */}
          <ellipse cx={CX} cy={CY} rx={OUTER.rx} ry={OUTER.ry}
            fill="none" stroke="#4F35D240" strokeWidth="1.5"/>

          {/* ── Outfield (between pitch and seating) ── */}
          <ellipse cx={CX} cy={CY} rx={INNER.rx+2} ry={INNER.ry+2}
            fill="none" stroke="#1DBFA830" strokeWidth="1"/>

          {/* ── Cricket pitch ── */}
          <ellipse cx={CX} cy={CY} rx={INNER.rx} ry={INNER.ry}
            fill="#1a3a1a" stroke="#2d5a2d" strokeWidth="1.5"/>
          {/* Pitch strip */}
          <rect x={CX-8} y={CY - INNER.ry * 0.75} width="16" height={INNER.ry * 1.5}
            rx="2" fill="#3a6e2a" stroke="#4a8a36" strokeWidth="0.5"/>
          {/* Crease lines */}
          <line x1={CX-28} y1={CY - INNER.ry * 0.46} x2={CX+28} y2={CY - INNER.ry * 0.46}
            stroke="#ffffff60" strokeWidth="1.5"/>
          <line x1={CX-28} y1={CY + INNER.ry * 0.46} x2={CX+28} y2={CY + INNER.ry * 0.46}
            stroke="#ffffff60" strokeWidth="1.5"/>
          {/* Stumps */}
          {[-6,-2,2].map(x => (
            <g key={x}>
              <line x1={CX+x} y1={CY - INNER.ry * 0.46} x2={CX+x} y2={CY - INNER.ry * 0.46 - 10}
                stroke="#ffffff90" strokeWidth="1.5"/>
              <line x1={CX+x} y1={CY + INNER.ry * 0.46} x2={CX+x} y2={CY + INNER.ry * 0.46 + 10}
                stroke="#ffffff90" strokeWidth="1.5"/>
            </g>
          ))}
          {/* Pitch label */}
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="#ffffff40" fontFamily="DM Sans, sans-serif" fontWeight="500">
            PITCH
          </text>

          {/* ── Animated people dots ── */}
          {sections.map(s =>
            (dotsBySectionId[s.id] || []).map((pt, i) => (
              <motion.circle
                key={`${s.id}-d${i}`}
                cx={pt.x} cy={pt.y} r="2.5"
                fill={heatColor(s.density)}
                animate={{ opacity: [0.5, 1, 0.5], r: [2, 3, 2] }}
                transition={{
                  duration: 2 + (i % 5) * 0.4,
                  delay: (i * 0.18) % 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))
          )}

          {/* ── Food court hotspots ── */}
          {FOOD_COURTS.map(f => (
            <g key={f.id}>
              <motion.ellipse cx={f.cx} cy={f.cy} rx="32" ry="22"
                fill={`url(#rg-${f.id})`}
                animate={{ rx: [28, 36, 28], ry: [18, 26, 18] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut',
                  delay: f.cx % 3 }}
              />
              <text x={f.cx} y={f.cy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fill="#ffffffA0" fontFamily="DM Sans, sans-serif" fontWeight="600">
                {f.label.split(' ').slice(-1)[0]}
              </text>
            </g>
          ))}

          {/* ── Section labels ── */}
          {sections.map(s => {
            const p = labelPt(s.start, s.end)
            const d = Math.round(s.density)
            const hot = d > 75
            return (
              <g key={`lbl-${s.id}`} style={{ pointerEvents:'none' }}>
                <text x={p.x} y={p.y - 7} textAnchor="middle" dominantBaseline="middle"
                  fontSize="9" fill="#F0EEFFb0" fontFamily="Sora, sans-serif" fontWeight="700">
                  {s.shortLabel}
                </text>
                <text x={p.x} y={p.y + 7} textAnchor="middle" dominantBaseline="middle"
                  fontSize="9" fill={heatColor(d)} fontFamily="DM Sans, sans-serif" fontWeight="600">
                  {d}%
                </text>
              </g>
            )
          })}

          {/* ── Gate markers ── */}
          {GATE_MARKERS.map(g => {
            const outer = ep(OUTER.rx + 18, OUTER.ry + 18, g.angle)
            const inner = ep(OUTER.rx - 2,  OUTER.ry - 2,  g.angle)
            const fill  = !g.operational ? '#EF4444' : g.closingSoon ? '#F59E0B' : '#1DBFA8'
            return (
              <g key={g.id}>
                {/* Connector tick */}
                <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                  stroke={fill} strokeWidth="1.5" opacity="0.6"/>
                {/* Gate dot */}
                <motion.circle cx={outer.x} cy={outer.y} r="10"
                  fill={fill} fillOpacity="0.15"
                  stroke={fill} strokeWidth="1.5"
                  animate={g.closingSoon
                    ? { r:[8,13,8], strokeOpacity:[0.4,1,0.4] }
                    : {}
                  }
                  transition={g.closingSoon
                    ? { duration:1.6, repeat:Infinity, ease:'easeInOut' }
                    : {}
                  }
                />
                <text x={outer.x} y={outer.y+0.5} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fill={fill} fontFamily="Sora, sans-serif" fontWeight="800">
                  {g.label}
                </text>
              </g>
            )
          })}

          {/* ── Center logo mark ── */}
          <text x={CX} y={CY - INNER.ry - 14} textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fill="#F0EEFF30" fontFamily="Sora, sans-serif" fontWeight="700"
            letterSpacing="1">
            WANKHEDE STADIUM
          </text>
        </svg>

        {/* ── Legend ── */}
        <div className="px-5 py-3 border-t border-[#4F35D215] flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Info size={12} className="text-[#F0EEFF40]"/>
            <span className="font-dm text-[11px] text-[#F0EEFF40]">Crowd density</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {LEGEND.map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ background: l.color }}/>
                <span className="font-dm text-[11px] text-[#F0EEFF60]">{l.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 sm:ml-auto">
            {[
              { color:'#1DBFA8', label:'Gate open' },
              { color:'#F59E0B', label:'Closing soon' },
              { color:'#EF4444', label:'Gate closed' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
                  style={{ borderColor: l.color, background: `${l.color}20` }}/>
                <span className="font-dm text-[11px] text-[#F0EEFF50]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
