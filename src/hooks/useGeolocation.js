// src/hooks/useGeolocation.js
/**
 * @hook useGeolocation
 * @description Continuously watches the device's real-time GPS position using
 * the browser Geolocation API (`navigator.geolocation.watchPosition`).
 * Updates automatically as the user moves.
 *
 * @returns {{ location: GeolocationCoords|null, error: string|null, loading: boolean }}
 */
import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat:      position.coords.latitude,
          lng:      position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        })
        setLoading(false)
        setError(null)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied. Please enable location permissions.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.')
            break
          case err.TIMEOUT:
            setError('Location request timed out.')
            break
          default:
            setError('An unknown error occurred getting your location.')
        }
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { location, error, loading }
}
