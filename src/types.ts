export type FlightStatus = 'active' | 'paused'
export type RecordStatus = 'LANDED' | 'ENDED'
export type Theme = 'dark' | 'light'
export type ClockFormat = '12h' | '24h'

export interface Coordinates {
  x: number
  y: number
}

export interface FlightOption {
  id: string
  flightNumber: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  durationMinutes: number
  gate: string
  seat: string
  distance: number
  aircraft: string
  originPoint: Coordinates
  destinationPoint: Coordinates
  accent: string
}

export interface FlightSession {
  id: string
  flightId: string
  durationMinutes: number
  durationMs: number
  startTime: number
  pausedAt: number | null
  totalPausedMs: number
  status: FlightStatus
}

export interface FlightRecord {
  id: string
  flightId: string
  flightNumber: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  durationMinutes: number
  focusMinutes: number
  status: RecordStatus
  completedAt: number
}

export interface Preferences {
  defaultDuration: number
  sound: boolean
  reducedMotion: boolean
  clockFormat: ClockFormat
  theme: Theme
}

export interface AppState {
  selectedDuration: number
  selectedFlightId: string | null
  activeSession: FlightSession | null
  history: FlightRecord[]
  lastRecordId: string | null
  preferences: Preferences
}

export type FlightPhaseKey = 'boarding' | 'takeoff' | 'cruise' | 'descent' | 'landing'

export interface FlightPhase {
  key: FlightPhaseKey
  label: string
  eyebrow: string
  description: string
}
