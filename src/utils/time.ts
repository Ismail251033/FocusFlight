import type { ClockFormat } from '../types'

export function formatTimer(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export function formatMinutes(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes))
  if (safe < 60) return `${safe} min`
  const hours = Math.floor(safe / 60)
  const remainder = safe % 60
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`
}

export function formatClock(timestamp: number, format: ClockFormat): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
  }).format(new Date(timestamp))
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(timestamp))
}

export function formatDistance(distance: number): string {
  return `${Math.round(distance).toLocaleString('en-US')} mi`
}
