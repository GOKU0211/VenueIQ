// src/components/TopNav.jsx
/**
 * @component TopNav
 * @description Sticky navigation bar shown after the hero screen is dismissed.
 * Displays the VenueIQ brand logo and a tabbed navigation strip for switching
 * between Dashboard, Navigation, and Queues sections.
 * Each tab is uniquely ID'd for browser testing.
 *
 * @param {{ activeTab: string, onTabChange: (tab: string) => void }} props
 */
import { motion } from 'framer-motion'
import { LayoutDashboard, Navigation2, Timer, Zap, Flame } from 'lucide-react'

const TABS = [
  { id: 'dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { id: 'navigation', label: 'Navigate',  icon: Navigation2     },
  { id: 'queues',     label: 'Queues',    icon: Timer           },
  { id: 'heatmap',   label: 'Heatmap',   icon: Flame           },
]

export default function TopNav({ activeTab, onTabChange }) {
  return (
    <motion.nav
      id="top-nav"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-30 glass border-b border-[#4F35D225]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between h-14 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F35D2] to-[#1DBFA8] flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-sora font-bold text-base">
            <span className="text-[#F0EEFF]">Venue</span>
            <span className="text-[#1DBFA8]">IQ</span>
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg
                  font-dm text-sm font-medium transition-colors duration-200 cursor-pointer
                  ${active ? 'text-[#F0EEFF]' : 'text-[#F0EEFF50] hover:text-[#F0EEFF80]'}
                `}
              >
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-[#4F35D225] border border-[#4F35D240]"
                    transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                  />
                )}
                <Icon size={15} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
