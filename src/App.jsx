// src/App.jsx
/**
 * @component App
 * @description Root application component for VenueIQ.
 * Manages hero → app view transition and tab routing.
 * Passes gate GPS data and venue info to NavigationAssistant for live GPS navigation.
 * All displayed data originates from MOCK_DATA — no scattered hardcoded strings.
 * Page transitions: Framer Motion fade + slide-up (300ms).
 */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { MOCK_DATA }            from './mockData'
import HeroScreen               from './components/HeroScreen'
import TopNav                   from './components/TopNav'
import AlertsBanner             from './components/AlertsBanner'
import LiveDashboard            from './components/LiveDashboard'
import NavigationAssistant      from './components/NavigationAssistant'
import QueueTracker             from './components/QueueTracker'
import AIChatButton             from './components/AIChatButton'
import MatchBanner              from './components/MatchBanner'
import VenueHeatmap             from './components/VenueHeatmap'

/** Framer Motion page-transition variants (fade + slide-up, 300ms) */
const pageVariants = {
  initial: { opacity: 0, y: 24 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.2, ease: 'easeIn'  } },
}

/** Maps tab IDs to their section components with correct props */
function TabContent({ tab }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="pb-24"
      >
        {tab === 'dashboard'  && <LiveDashboard data={MOCK_DATA.dashboard} />}
        {tab === 'navigation' && (
          <NavigationAssistant
            gates={MOCK_DATA.gates}
            venue={MOCK_DATA.venue}
            navFallback={MOCK_DATA.navigation}
          />
        )}
        {tab === 'queues'   && <QueueTracker data={MOCK_DATA.queues} />}
        {tab === 'heatmap'  && (
          <VenueHeatmap
            totalPresent={Math.round(MOCK_DATA.venue.capacity * 0.72)}
            capacity={MOCK_DATA.venue.capacity}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  /** 'hero' | 'app' */
  const [view,      setView] = useState('hero')
  /** 'dashboard' | 'navigation' | 'queues' | 'heatmap' */
  const [activeTab, setTab]  = useState('dashboard')

  return (
    <div className="min-h-screen bg-navy font-dm">
      <AnimatePresence mode="wait">

        {/* ── Hero landing ── */}
        {view === 'hero' && (
          <motion.div key="hero" variants={pageVariants} initial="initial" animate="enter" exit="exit">
            <HeroScreen
              data={MOCK_DATA.venue}
              matchData={MOCK_DATA.liveMatch}
              onStart={() => setView('app')}
            />
          </motion.div>
        )}

        {/* ── Main app ── */}
        {view === 'app' && (
          <motion.div key="app" variants={pageVariants} initial="initial" animate="enter" exit="exit"
            className="flex flex-col min-h-screen">

            {/* Live alerts ticker — always on top */}
            <AlertsBanner data={MOCK_DATA.alerts} />

            {/* Sticky navigation bar */}
            <TopNav activeTab={activeTab} onTabChange={setTab} />

            {/* Match score banner — below nav */}
            <MatchBanner data={MOCK_DATA.liveMatch} venue={MOCK_DATA.venue} />

            {/* Main content */}
            <main className="flex-1">
              <TabContent tab={activeTab} />
            </main>

            {/* Floating AI chat */}
            <AIChatButton chatData={MOCK_DATA.chat} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
