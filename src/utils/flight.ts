import type { FlightPhase, FlightPhaseKey, FlightSession } from '../types'

export const phaseDefinitions: Record<FlightPhaseKey, FlightPhase> = {
  boarding: { key: 'boarding', label: 'BOARDING', eyebrow: 'PREPARE FOR DEPARTURE', description: 'Settle in. Your runway is clear.' },
  takeoff: { key: 'takeoff', label: 'TAKEOFF', eyebrow: 'LEAVING THE GATE', description: 'The session is lifting off.' },
  cruise: { key: 'cruise', label: 'CRUISING', eyebrow: 'DEEP FOCUS ALTITUDE', description: 'Stay with the route. You are in the air.' },
  descent: { key: 'descent', label: 'DESCENT', eyebrow: 'DESTINATION IN SIGHT', description: 'Bring the final stretch home.' },
  landing: { key: 'landing', label: 'LANDING', eyebrow: 'FINAL APPROACH', description: 'One last calm push before arrival.' },
}

export function getPhase(progress: number): FlightPhase {
  const percentage = Math.max(0, Math.min(1, progress)) * 100
  if (percentage < 5) return phaseDefinitions.boarding
  if (percentage < 15) return phaseDefinitions.takeoff
  if (percentage < 80) return phaseDefinitions.cruise
  if (percentage < 95) return phaseDefinitions.descent
  return phaseDefinitions.landing
}

export function getSessionMetrics(session: FlightSession, now: number) {
  const clock = session.status === 'paused' && session.pausedAt ? session.pausedAt : now
  const elapsedMs = Math.min(session.durationMs, Math.max(0, clock - session.startTime - session.totalPausedMs))
  const remainingMs = Math.max(0, session.durationMs - elapsedMs)
  const progress = session.durationMs === 0 ? 1 : elapsedMs / session.durationMs
  return { elapsedMs, remainingMs, progress, phase: getPhase(progress) }
}

export function interpolatePoint(start: { x: number; y: number }, end: { x: number; y: number }, progress: number) {
  const safe = Math.max(0, Math.min(1, progress))
  return { x: start.x + (end.x - start.x) * safe, y: start.y + (end.y - start.y) * safe }
}
