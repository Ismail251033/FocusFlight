import type { FlightRecord } from '../types'

function isSameDay(timestamp: number, reference = Date.now()) {
  const a = new Date(timestamp)
  const b = new Date(reference)
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isThisWeek(timestamp: number, reference = Date.now()) {
  const date = new Date(timestamp)
  const now = new Date(reference)
  const day = (now.getDay() + 6) % 7
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
  start.setHours(0, 0, 0, 0)
  return date >= start && date <= now
}

export function getStats(history: FlightRecord[]) {
  const landed = history.filter((record) => record.status === 'LANDED')
  return {
    today: landed.filter((record) => isSameDay(record.completedAt)).reduce((sum, record) => sum + record.focusMinutes, 0),
    week: landed.filter((record) => isThisWeek(record.completedAt)).reduce((sum, record) => sum + record.focusMinutes, 0),
    completed: landed.length,
    longest: landed.reduce((max, record) => Math.max(max, record.durationMinutes), 0),
    total: landed.reduce((sum, record) => sum + record.focusMinutes, 0),
  }
}
