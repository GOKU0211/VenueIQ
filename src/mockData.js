// src/mockData.js
/**
 * @fileoverview
 * Central mock data store for VenueIQ.
 * All strings, values, and venue GPS coordinates displayed across the app
 * originate here. Venue gate coordinates are real-world GPS positions for
 * Wankhede Stadium, Mumbai — host of IPL 2026 MI vs DC match.
 * Replace with a live API response in production.
 */

/** @type {import('./types').MockData} */
export const MOCK_DATA = {
  venue: {
    name: 'VenueIQ',
    tagline: 'Your smart venue companion',
    eventName: 'IPL 2026 · MI vs DC',
    eventDate: 'April 20, 2026',
    capacity: 33_108,
    venueName: 'Wankhede Stadium',
    venueCity: 'Mumbai, Maharashtra',
    matchTime: '19:30 IST',
    /* Venue centroid — used as fallback reference point */
    venueLat: 18.9383,
    venueLng: 72.8254,
  },

  dashboard: {
    gateStatus: {
      label: 'Gate Status',
      value: 'Open',
      subtext: 'Gates 1, 5, 7 fully operational',
      trend: 'Gate 3 opening at 18:00',
      status: 'ok',
    },
    avgWaitTime: {
      label: 'Avg Wait Time',
      value: '11 min',
      subtext: 'Across all entry gates',
      trend: '↑ 4 min from 30 min ago',
      status: 'warn',
    },
    activeAlerts: {
      label: 'Active Alerts',
      value: '4',
      subtext: 'Stadium-wide notifications',
      trend: '1 new in last 10 min',
      status: 'alert',
    },
    crowdDensity: {
      label: 'Crowd Density',
      value: '72%',
      subtext: '23,838 of 33,108 seated',
      trend: '↑ Filling up fast — 65 min to KO',
      status: 'warn',
      percent: 72,
    },
  },

  /**
   * Real-world gate coordinates for Wankhede Stadium, Mumbai.
   * Gate positions sourced from public satellite imagery.
   * Operational status and wait times are mock values.
   *
   * @type {Array<GateData>}
   */
  gates: [
    {
      id: 'gate-1',
      name: 'Gate 1 — North Stand',
      shortName: 'Gate 1',
      lat: 18.9411,
      lng: 72.8252,
      waitMin: 8,
      capacity: 55,
      operational: true,
      closingSoon: false,
      closingAt: null,
      landmark: 'Near Churchgate Flyover, opposite Eros Cinema',
      sections: ['North Stand Upper', 'Press Box'],
      venueName: 'Wankhede Stadium',
    },
    {
      id: 'gate-3',
      name: 'Gate 3 — East Pavilion',
      shortName: 'Gate 3',
      lat: 18.9396,
      lng: 72.8271,
      waitMin: 14,
      capacity: 80,
      operational: true,
      closingSoon: false,
      closingAt: null,
      landmark: 'Facing Marine Drive, near Trident Hotel entrance',
      sections: ['Sunil Gavaskar Stand', 'Sachin Tendulkar Stand'],
      venueName: 'Wankhede Stadium',
    },
    {
      id: 'gate-5',
      name: 'Gate 5 — South Stand',
      shortName: 'Gate 5',
      lat: 18.9365,
      lng: 72.8254,
      waitMin: 4,
      capacity: 30,
      operational: true,
      closingSoon: false,
      closingAt: null,
      landmark: 'Behind Mumbai Cricket Association building, D Road',
      sections: ['Vijay Merchant Pavilion', 'Garware Pavilion'],
      venueName: 'Wankhede Stadium',
    },
    {
      id: 'gate-7',
      name: 'Gate 7 — VIP West',
      shortName: 'Gate 7 VIP',
      lat: 18.9395,
      lng: 72.8235,
      waitMin: 22,
      capacity: 95,
      operational: true,
      closingSoon: true,
      closingAt: '18:45',
      landmark: 'Wankhede Stadium Rd, near MHCC Club — VIP only',
      sections: ['VIP Lounge', 'Corporate Boxes', 'Media'],
      venueName: 'Wankhede Stadium',
    },
    {
      id: 'gate-9',
      name: 'Gate 9 — NE Corner',
      shortName: 'Gate 9',
      lat: 18.9408,
      lng: 72.8268,
      waitMin: 3,
      capacity: 20,
      operational: false,
      closingSoon: false,
      closingAt: null,
      landmark: 'Currently closed — use Gate 1 or Gate 3',
      sections: [],
      venueName: 'Wankhede Stadium',
    },
  ],

  navigation: {
    /* Legacy static navigation — used only as fallback when GPS is unavailable */
    userLocation: 'Churchgate Station, Mumbai',
    destination: 'Gate 1 — North Stand',
    estimatedTime: '8 min walk',
    distance: '600 m',
    steps: [
      { id: 1, icon: 'navigation', text: 'Exit Churchgate Station from the Western Railway Gate' },
      { id: 2, icon: 'arrow-up',   text: 'Walk south on Veer Nariman Road for 250m' },
      { id: 3, icon: 'turn-right', text: 'Turn right on Wankhede Stadium Road' },
      { id: 4, icon: 'arrow-up',   text: 'Continue for 200m past the BCCI signage' },
      { id: 5, icon: 'flag',       text: 'Gate 1 entrance — present ticket QR for scanning' },
    ],
  },

  queues: [
    { id: 'gate-1',    zone: 'Gate 1 — North Stand',   waitMin: 8,  capacity: 55 },
    { id: 'gate-3',    zone: 'Gate 3 — East Pavilion', waitMin: 14, capacity: 80 },
    { id: 'gate-5',    zone: 'Gate 5 — South Stand',   waitMin: 4,  capacity: 30 },
    { id: 'gate-7',    zone: 'Gate 7 — VIP West',      waitMin: 22, capacity: 95 },
    { id: 'food-court',zone: 'Food Court (Level 2)',    waitMin: 9,  capacity: 65 },
    { id: 'restrooms', zone: 'Restrooms (Gate 1 side)', waitMin: 3,  capacity: 25 },
    { id: 'merch',     zone: 'MI Merchandise Store',   waitMin: 17, capacity: 85 },
  ],

  alerts: [
    { id: 1, type: 'info',    text: '🔵  Gates open — carry your Paytm/BookMyShow e-ticket QR code for entry.' },
    { id: 2, type: 'warning', text: '🟡  Gate 7 (VIP West) heavily congested — VIP guests use Gate 3 as alternative.' },
    { id: 3, type: 'info',    text: '🔵  MI vs DC — Toss at 19:00 IST. DY Patil pitchside entertainment starts at 17:30.' },
    { id: 4, type: 'success', text: '🟢  Gate 5 South Stand now open with minimal wait — recommended for Garware Pavilion ticket holders.' },
    { id: 5, type: 'warning', text: '🟡  No outside food/beverages allowed. Water bottles up to 500ml permitted.' },
    { id: 6, type: 'info',    text: '🔵  Shuttle bus service from Churchgate Station running every 12 minutes till 18:45.' },
    { id: 7, type: 'success', text: '🟢  Gate 9 closes at 18:00 — please proceed to alternate entry.' },
  ],

  liveMatch: {
    competition: 'TATA IPL 2026',
    teams: {
      home: { name: 'Mumbai Indians', short: 'MI', color: '#004BA0', accent: '#D4AF37' },
      away: { name: 'Delhi Capitals', short: 'DC', color: '#0078BC', accent: '#EF1C25' },
    },
    venue: 'Wankhede Stadium, Mumbai',
    status: 'Pre-Match',
    matchTime: '19:30 IST',
    phase: 'Gates Open',
  },

  chat: {
    assistantName: 'VenueIQ Assistant',
    welcomeMessage: "Hi! I'm your VenueIQ AI companion for today's MI vs DC at Wankhede. Ask me about directions, queues, food, or anything about the venue!",
    suggestions: [
      'Which gate should I use right now?',
      'Where is the nearest restroom?',
      'How do I get to Garware Pavilion?',
      'Is Gate 9 open today?',
    ],
  },
}
