// src/utils/geoUtils.js
/**
 * @fileoverview
 * Geospatial utility functions for VenueIQ.
 * Implements the Haversine formula for accurate distance calculations,
 * bearing/compass heading, cardinal direction labels, and gate scoring
 * to recommend the optimal gate for each attendee.
 */

const R = 6371000 // Earth's radius in metres

/**
 * Converts degrees to radians.
 * @param {number} deg
 * @returns {number}
 */
const toRad = deg => (deg * Math.PI) / 180

/**
 * Calculates the great-circle distance between two GPS coordinates
 * using the Haversine formula.
 * @param {number} lat1 - Origin latitude
 * @param {number} lng1 - Origin longitude
 * @param {number} lat2 - Destination latitude
 * @param {number} lng2 - Destination longitude
 * @returns {number} Distance in metres
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Calculates the initial compass bearing from point 1 to point 2.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Bearing in degrees (0 = North, clockwise)
 */
export function getBearing(lat1, lng1, lat2, lng2) {
  const φ1 = toRad(lat1), φ2 = toRad(lat2)
  const Δλ = toRad(lng2 - lng1)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

/**
 * Converts a compass bearing in degrees to a human-readable 8-point cardinal label.
 * @param {number} bearing - 0–360 degrees
 * @returns {string} e.g. "North", "North-East"
 */
export function bearingToCardinal(bearing) {
  const dirs = [
    'North', 'North-East', 'East', 'South-East',
    'South', 'South-West', 'West', 'North-West',
  ]
  return dirs[Math.round(bearing / 45) % 8]
}

/**
 * Formats a distance in metres to a readable string.
 * @param {number} metres
 * @returns {string}
 */
export function formatDistance(metres) {
  if (metres < 1000) return `${Math.round(metres)} m`
  return `${(metres / 1000).toFixed(1)} km`
}

/**
 * Scores each gate by combining normalised wait time and distance.
 * Lower score = better recommendation.
 * Formula: score = (waitMin / maxWait) * 0.5 + (distM / maxDist) * 0.5
 *
 * @param {{ lat: number, lng: number }} userCoords
 * @param {Array<import('../mockData').GateData>} gates
 * @returns {Array<import('../mockData').GateData & { distanceM: number, bearing: number, score: number }>}
 */
export function scoreGates(userCoords, gates) {
  const withDist = gates.map(gate => ({
    ...gate,
    distanceM: haversineDistance(userCoords.lat, userCoords.lng, gate.lat, gate.lng),
    bearing:   getBearing(userCoords.lat, userCoords.lng, gate.lat, gate.lng),
  }))

  const maxWait = Math.max(...withDist.map(g => g.waitMin))
  const maxDist = Math.max(...withDist.map(g => g.distanceM))

  return withDist
    .map(g => ({
      ...g,
      score: g.operational
        ? (g.waitMin / maxWait) * 0.5 + (g.distanceM / maxDist) * 0.5
        : Infinity,
    }))
    .sort((a, b) => a.score - b.score)
}

/**
 * Builds a dynamic step-by-step directions array based on bearing and distance.
 * @param {number} bearing - Compass degrees to the gate
 * @param {number} distanceM - Distance in metres
 * @param {{ name: string, landmark: string }} gate
 * @returns {Array<{ id: number, text: string, icon: string }>}
 */
export function generateDirections(bearing, distanceM, gate) {
  const cardinal = bearingToCardinal(bearing)
  const dist     = formatDistance(distanceM)

  const isNearVenue = distanceM < 600

  if (!isNearVenue) {
    // User is still travelling to the venue — macro directions
    return [
      { id: 1, icon: 'navigation', text: `Head ${cardinal} toward ${gate.venueName}` },
      { id: 2, icon: 'map-pin',    text: `Your destination is ${formatDistance(distanceM)} away — follow signage for ${gate.venueName}` },
      { id: 3, icon: 'arrow-up',   text: `Enter the venue precinct from the ${cardinal} approach road` },
      { id: 4, icon: 'door-open',  text: `Look for ${gate.name} — ${gate.landmark}` },
      { id: 5, icon: 'flag',       text: `Proceed to the security checkpoint and have your ticket QR ready` },
    ]
  }

  // User is near the venue — gate-level directions
  return [
    { id: 1, icon: 'navigation',  text: `Walk ${cardinal} for approximately ${dist}` },
    { id: 2, icon: 'arrow-up',    text: `Follow the crowd-flow signboards toward ${gate.name}` },
    { id: 3, icon: 'door-open',   text: `${gate.landmark} — you will see the gate entrance on your ${bearing > 180 ? 'left' : 'right'}` },
    { id: 4, icon: 'turn-right',  text: `Join the queue lane — current wait: ${gate.waitMin} min` },
    { id: 5, icon: 'flag',        text: `Present your e-ticket QR at the scanner and proceed to your section` },
  ]
}
