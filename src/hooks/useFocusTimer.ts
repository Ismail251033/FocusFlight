import { useEffect, useState } from 'react'
import type { FlightSession } from '../types'
import { getSessionMetrics } from '../utils/flight'

/** Timestamp-driven timer hook used by focus surfaces that need an isolated clock. */
export function useFocusTimer(session: FlightSession | null) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!session) return
    const tick = () => setNow(Date.now())
    tick()
    const interval = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [session])

  return session ? getSessionMetrics(session, now) : null
}
