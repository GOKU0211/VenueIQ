// src/components/NavigationAssistant.jsx
/**
 * @component NavigationAssistant
 * @description Live GPS-powered navigation panel for VenueIQ.
 *
 * Operational flow:
 * 1. Requests the user's real-time device GPS via `useGeolocation` hook
 * 2. Calculates distance + bearing from the user to every operational gate
 *    at Wankhede Stadium using the Haversine formula
 * 3. Scores each gate by a weighted combination of walk distance + queue wait time
 * 4. Highlights the single best-recommended gate
 * 5. Generates context-aware step-by-step directions based on bearing &
 *    whether the user is near or far from the venue
 * 6. Displays a live compass needle that always points toward the recommended gate
 *
 * Falls back to a permission-denied state with static directions when GPS
 * access is unavailable.
 *
 * @param {{ gates: Array, venue: Object, navFallback: Object }} props
 */
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Navigation2, MapPin, Clock, Flag, DoorOpen,
  ArrowUp, CornerUpRight, AlertTriangle, Locate,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Compass, Timer,
} from 'lucide-react'
import { useGeolocation }    from '../hooks/useGeolocation'
import {
  scoreGates, formatDistance, generateDirections, bearingToCardinal,
} from '../utils/geoUtils'

/* ── Icon map for direction steps ── */
const STEP_ICONS = {
  'navigation':  Navigation2,
  'map-pin':     MapPin,
  'arrow-up':    ArrowUp,
  'door-open':   DoorOpen,
  'turn-right':  CornerUpRight,
  'flag':        Flag,
}

/* ── Animations ── */
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const stepAnim  = { hidden: { opacity:0, x:-18 }, visible: { opacity:1, x:0, transition:{ duration:0.38, ease:'easeOut' } } }

/* ── Wait badge colours ── */
function waitStyle(min, operational) {
  if (!operational) return { text:'text-[#F0EEFF40]', bg:'bg-[#F0EEFF10]', border:'border-[#F0EEFF15]', label:'Closed' }
  if (min < 5)   return { text:'text-[#1DBFA8]', bg:'bg-[#1DBFA815]', border:'border-[#1DBFA830]', label:'Low wait' }
  if (min <= 15) return { text:'text-[#F59E0B]', bg:'bg-[#F59E0B15]', border:'border-[#F59E0B30]', label:'Moderate' }
  return           { text:'text-[#EF4444]', bg:'bg-[#EF444415]', border:'border-[#EF444430]', label:'Busy' }
}

/**
 * @component CompassRose
 * @description Animated SVG compass that rotates its needle to point toward
 * the recommended gate based on the calculated bearing.
 * @param {{ bearing: number }} props
 */
function CompassRose({ bearing }) {
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 96 96" className="w-full h-full">
        {/* Outer ring */}
        <circle cx="48" cy="48" r="46" fill="none" stroke="#4F35D230" strokeWidth="1.5"/>
        <circle cx="48" cy="48" r="38" fill="#0A0F2C" stroke="#4F35D220" strokeWidth="1"/>
        {/* Cardinal letters */}
        {[['N',48,12],['S',48,88],['E',88,52],['W',8,52]].map(([l,x,y]) => (
          <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            className="font-sora" fontSize="10" fill={l==='N' ? '#1DBFA8' : '#F0EEFF40'} fontWeight="700">
            {l}
          </text>
        ))}
        {/* Tick marks */}
        {Array.from({length:36}).map((_,i) => {
          const angle = (i * 10 * Math.PI) / 180
          const r1 = i % 9 === 0 ? 34 : 37, r2 = 41
          return (
            <line key={i}
              x1={48 + r1*Math.sin(angle)} y1={48 - r1*Math.cos(angle)}
              x2={48 + r2*Math.sin(angle)} y2={48 - r2*Math.cos(angle)}
              stroke={i%9===0?'#4F35D260':'#4F35D225'} strokeWidth={i%9===0?1.5:0.8}/>
          )
        })}
        {/* Needle — rotates to bearing */}
        <motion.g
          animate={{ rotate: bearing }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          style={{ originX:'48px', originY:'48px', transformOrigin: '48px 48px' }}
        >
          {/* North tip — teal */}
          <polygon points="48,16 44,48 48,44 52,48" fill="#1DBFA8"/>
          {/* South tip — muted */}
          <polygon points="48,80 44,48 48,52 52,48" fill="#4F35D260"/>
          {/* Centre dot */}
          <circle cx="48" cy="48" r="4" fill="#0A0F2C" stroke="#4F35D2" strokeWidth="1.5"/>
        </motion.g>
      </svg>
    </div>
  )
}

/**
 * @component GateCard
 * @description Displays a single gate's status, distance, wait time, and sections.
 * When `gate.closingSoon` is true the card pulsates with an amber glow ring and
 * shows a countdown warning badge, alerting attendees to use the gate quickly.
 * @param {{ gate: Object, isRecommended: boolean, distanceM: number }} props
 */
function GateCard({ gate, isRecommended, distanceM }) {
  const [expanded, setExpanded] = useState(false)
  const s = waitStyle(gate.waitMin, gate.operational)
  const isClosingSoon = gate.operational && gate.closingSoon

  return (
    <motion.div
      layout
      id={`gate-card-${gate.id}`}
      className={`relative rounded-xl border overflow-hidden transition-colors duration-300
        ${isRecommended
          ? 'border-[#1DBFA840] bg-[#1DBFA808]'
          : isClosingSoon
            ? 'border-[#F59E0B60] bg-[#141B3C60]'
            : gate.operational
              ? 'border-[#4F35D225] bg-[#141B3C60]'
              : 'border-[#F0EEFF10] bg-[#0A0F1888] opacity-60'
        }`}
      /* Pulsating amber glow ring when gate is about to close */
      animate={isClosingSoon ? {
        boxShadow: [
          '0 0 0 0px #F59E0B00',
          '0 0 0 5px #F59E0B45',
          '0 0 0 0px #F59E0B00',
        ],
      } : {}}
      transition={isClosingSoon
        ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
        : {}}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Operational indicator */}
        {gate.operational
          ? <CheckCircle2 size={16} className={isRecommended ? 'text-[#1DBFA8]' : 'text-[#4F35D2]'} />
          : <XCircle     size={16} className="text-[#F0EEFF30]" />
        }

        {/* Gate name + distance */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`font-sora text-sm font-semibold truncate
              ${gate.operational ? 'text-[#F0EEFF]' : 'text-[#F0EEFF40]'}`}>
              {gate.shortName}
            </p>
            {isRecommended && (
              <span className="text-[10px] font-sora font-bold px-2 py-0.5 rounded-full bg-[#1DBFA820] text-[#1DBFA8] border border-[#1DBFA840] whitespace-nowrap">
                ★ BEST ROUTE
              </span>
            )}
            {/* ── Closing Soon badge — pulses independently ── */}
            {isClosingSoon && (
              <motion.span
                animate={{ opacity: [1, 0.45, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-1 text-[10px] font-sora font-bold px-2 py-0.5 rounded-full
                  bg-[#F59E0B20] text-[#F59E0B] border border-[#F59E0B50] whitespace-nowrap"
              >
                <Timer size={9} />
                Closing {gate.closingAt}
              </motion.span>
            )}
          </div>
          {distanceM !== undefined && gate.operational && (
            <p className="font-dm text-xs text-[#F0EEFF50] mt-0.5">
              {formatDistance(distanceM)} · {bearingToCardinal(gate.bearing)} from you
            </p>
          )}
        </div>

        {/* Wait badge */}
        <div className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg border flex-shrink-0 ${s.bg} ${s.border}`}>
          <span className={`font-sora text-sm font-bold leading-none ${s.text}`}>
            {gate.operational ? `${gate.waitMin}m` : '—'}
          </span>
          <span className={`font-dm text-[9px] font-medium ${s.text}`}>{s.label}</span>
        </div>

        {/* Expand toggle */}
        {gate.operational && gate.sections.length > 0 && (
          <button onClick={() => setExpanded(e => !e)}
            className="text-[#F0EEFF30] hover:text-[#F0EEFF60] transition-colors flex-shrink-0">
            {expanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
          </button>
        )}
      </div>

      {/* Expanded: sections served */}
      <AnimatePresence>
        {expanded && gate.sections.length > 0 && (
          <motion.div
            initial={{ height:0, opacity:0 }}
            animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t border-[#4F35D215]">
              <p className="font-dm text-[10px] text-[#F0EEFF40] uppercase tracking-wider mt-2 mb-1.5">Sections served</p>
              <div className="flex flex-wrap gap-1.5">
                {gate.sections.map(s => (
                  <span key={s} className="font-dm text-[11px] px-2 py-0.5 rounded-md bg-[#4F35D215] text-[#C8BDFF] border border-[#4F35D220]">
                    {s}
                  </span>
                ))}
              </div>
              <p className="font-dm text-[11px] text-[#F0EEFF50] mt-2 italic">{gate.landmark}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Main component ── */
export default function NavigationAssistant({ gates, venue, navFallback }) {
  const { location, error, loading } = useGeolocation()
  const [showAllGates, setShowAllGates] = useState(false)

  /* Score gates only when we have a real GPS fix */
  const scoredGates = useMemo(() => {
    if (!location) return null
    return scoreGates({ lat: location.lat, lng: location.lng }, gates)
  }, [location, gates])

  const bestGate  = scoredGates?.[0]
  const directions = useMemo(() => {
    if (!bestGate) return navFallback.steps
    return generateDirections(bestGate.bearing, bestGate.distanceM, bestGate)
  }, [bestGate, navFallback])

  const displayGates = showAllGates ? scoredGates : scoredGates?.slice(0, 3)

  return (
    <section id="navigation-assistant" className="py-4 px-4 sm:px-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
        transition={{ duration:0.4 }} className="mb-5">
        <h2 className="font-sora text-2xl font-bold text-[#F0EEFF] flex items-center gap-2">
          <Navigation2 size={22} className="text-[#4F35D2]" />
          Navigation Assistant
        </h2>
        <p className="font-dm text-sm text-[#F0EEFF60] mt-1">
          Real-time route to your best gate · {venue.venueName}
        </p>
      </motion.div>

      {/* ── GPS State ── */}
      {loading && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="glass rounded-xl border border-[#4F35D230] px-5 py-4 flex items-center gap-3 mb-4">
          <Locate size={18} className="text-[#4F35D2] animate-pulse" />
          <div>
            <p className="font-sora text-sm font-semibold text-[#F0EEFF]">Acquiring GPS signal…</p>
            <p className="font-dm text-xs text-[#F0EEFF50]">Please allow location access when prompted</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="glass rounded-xl border border-[#EF444430] px-5 py-4 flex items-start gap-3 mb-4">
          <AlertTriangle size={18} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-sora text-sm font-semibold text-[#EF4444]">Location unavailable</p>
            <p className="font-dm text-xs text-[#F0EEFF60] mt-0.5">{error}</p>
            <p className="font-dm text-xs text-[#F0EEFF40] mt-1">Showing static directions to nearest gate instead.</p>
          </div>
        </motion.div>
      )}

      {/* ── Live Location Strip ── */}
      {location && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.35 }}
          className="glass rounded-xl border border-[#1DBFA830] px-4 py-3 flex items-center gap-3 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1DBFA8] animate-pulse flex-shrink-0"/>
          <div className="flex-1 min-w-0">
            <p className="font-sora text-xs font-semibold text-[#1DBFA8]">Live GPS · ±{location.accuracy}m accuracy</p>
            <p className="font-dm text-xs text-[#F0EEFF50] font-mono truncate">
              {location.lat.toFixed(5)}°N, {location.lng.toFixed(5)}°E
            </p>
          </div>
          <Locate size={16} className="text-[#1DBFA8] flex-shrink-0"/>
        </motion.div>
      )}

      {/* ── Recommendation Header + Compass ── */}
      {bestGate && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4 }}
          className="glass rounded-2xl border border-[#1DBFA830] px-5 py-4 mb-4
            flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ boxShadow:'0 8px 32px #1DBFA815' }}>

          {/* Compass */}
          <div className="flex flex-col items-center gap-1">
            <CompassRose bearing={bestGate.bearing} />
            <p className="font-dm text-[10px] text-[#F0EEFF40] uppercase tracking-wider">Compass</p>
          </div>

          {/* Recommendation details */}
          <div className="flex-1 min-w-0">
            <p className="font-dm text-[10px] text-[#1DBFA8] uppercase tracking-widest font-semibold">
              Recommended Gate
            </p>
            <h3 className="font-sora text-xl font-bold text-[#F0EEFF] mt-0.5 leading-tight">
              {bestGate.name}
            </h3>
            <p className="font-dm text-sm text-[#F0EEFF70] mt-1 leading-relaxed">
              {bestGate.landmark}
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1DBFA815] border border-[#1DBFA830]">
                <MapPin size={12} className="text-[#1DBFA8]"/>
                <span className="font-dm text-xs text-[#1DBFA8] font-medium">
                  {formatDistance(bestGate.distanceM)} · {bearingToCardinal(bestGate.bearing)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1DBFA815] border border-[#1DBFA830]">
                <Clock size={12} className="text-[#1DBFA8]"/>
                <span className="font-dm text-xs text-[#1DBFA8] font-medium">
                  {bestGate.waitMin} min queue
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4F35D215] border border-[#4F35D230]">
                <Compass size={12} className="text-[#8B6BF8]"/>
                <span className="font-dm text-xs text-[#8B6BF8] font-medium">
                  {Math.round(bestGate.bearing)}° · {bearingToCardinal(bestGate.bearing)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Step-by-step directions ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.4, delay:0.1 }}
        className="glass rounded-2xl border border-[#4F35D225] overflow-hidden mb-4">

        <div className="px-5 py-3 border-b border-[#4F35D215] flex items-center justify-between">
          <p className="font-sora text-xs font-semibold text-[#F0EEFF50] uppercase tracking-widest">
            {location ? 'Live Directions' : 'Suggested Route'}
          </p>
          {bestGate && (
            <span className="font-dm text-xs text-[#F0EEFF40]">
              to {bestGate.shortName}
            </span>
          )}
        </div>

        <div className="px-5 py-5">
          <motion.ol variants={container} initial="hidden" animate="visible"
            className="flex flex-col gap-0">
            {directions.map((step, idx) => {
              const Icon  = STEP_ICONS[step.icon] || ArrowUp
              const isLast = idx === directions.length - 1
              return (
                <motion.li key={step.id} variants={stepAnim}
                  className="relative flex gap-4">
                  {!isLast && (
                    <div className="absolute left-[19px] top-[40px] bottom-0 w-[2px]"
                      style={{ background:'linear-gradient(to bottom, #4F35D260, transparent)'}}/>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-1
                    ${isLast
                      ? 'bg-[#1DBFA820] border border-[#1DBFA840]'
                      : 'bg-[#4F35D220] border border-[#4F35D240]'}`}>
                    <Icon size={16} className={isLast ? 'text-[#1DBFA8]' : 'text-[#8B6BF8]'} />
                  </div>
                  <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-dm text-[10px] font-medium text-[#4F35D2] uppercase tracking-wider">
                        Step {idx + 1}
                      </span>
                      {isLast && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1DBFA820] text-[#1DBFA8]">
                          Destination
                        </span>
                      )}
                    </div>
                    <p className="font-dm text-sm text-[#F0EEFF90] mt-0.5 leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </motion.ol>
        </div>
      </motion.div>

      {/* ── All Gates List ── */}
      {scoredGates && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ delay:0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-sora text-sm font-semibold text-[#F0EEFF80]">
              All Entry Gates
            </p>
            <span className="font-dm text-xs text-[#F0EEFF40]">
              {gates.filter(g=>g.operational).length} of {gates.length} operational
            </span>
          </div>
          <motion.div variants={container} initial="hidden" animate="visible"
            className="flex flex-col gap-2">
            {displayGates.map(gate => (
              <GateCard
                key={gate.id}
                gate={gate}
                isRecommended={gate.id === bestGate?.id}
                distanceM={gate.distanceM}
              />
            ))}
          </motion.div>

          {scoredGates.length > 3 && (
            <button
              onClick={() => setShowAllGates(v => !v)}
              className="w-full mt-3 py-2.5 rounded-xl border border-[#4F35D225] text-[#F0EEFF50]
                hover:text-[#F0EEFF80] hover:border-[#4F35D240] transition-colors font-dm text-sm flex items-center justify-center gap-1.5"
            >
              {showAllGates
                ? <><ChevronUp size={14}/> Show less</>
                : <><ChevronDown size={14}/> Show all {scoredGates.length} gates</>
              }
            </button>
          )}
        </motion.div>
      )}
    </section>
  )
}
