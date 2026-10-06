import type { FlightOption } from '../types'

interface RouteSeed {
  id: string
  flightNumber: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  distance: number
  aircraft: string
  originPoint: { x: number; y: number }
  destinationPoint: { x: number; y: number }
  accent: string
}

const routes: RouteSeed[] = [
  { id: 'marrakech-lisbon', flightNumber: 'FF 214', origin: 'Marrakech', originCode: 'RAK', destination: 'Lisbon', destinationCode: 'LIS', distance: 480, aircraft: 'Aero 320', originPoint: { x: 24, y: 66 }, destinationPoint: { x: 35, y: 42 }, accent: '#d4f36a' },
  { id: 'paris-rome', flightNumber: 'FF 728', origin: 'Paris', originCode: 'PAR', destination: 'Rome', destinationCode: 'ROM', distance: 687, aircraft: 'Skyline 7', originPoint: { x: 47, y: 35 }, destinationPoint: { x: 56, y: 63 }, accent: '#f6c76b' },
  { id: 'tokyo-seoul', flightNumber: 'FF 391', origin: 'Tokyo', originCode: 'TYO', destination: 'Seoul', destinationCode: 'SEL', distance: 716, aircraft: 'Horizon 2', originPoint: { x: 83, y: 56 }, destinationPoint: { x: 72, y: 45 }, accent: '#b8a5ff' },
  { id: 'london-amsterdam', flightNumber: 'FF 503', origin: 'London', originCode: 'LON', destination: 'Amsterdam', destinationCode: 'AMS', distance: 358, aircraft: 'Aero 220', originPoint: { x: 43, y: 27 }, destinationPoint: { x: 50, y: 25 }, accent: '#7ed9d1' },
  { id: 'dubai-muscat', flightNumber: 'FF 602', origin: 'Dubai', originCode: 'DXB', destination: 'Muscat', destinationCode: 'MCT', distance: 349, aircraft: 'Gulfstream 4', originPoint: { x: 65, y: 68 }, destinationPoint: { x: 70, y: 74 }, accent: '#ff9f86' },
  { id: 'madrid-barcelona', flightNumber: 'FF 847', origin: 'Madrid', originCode: 'MAD', destination: 'Barcelona', destinationCode: 'BCN', distance: 505, aircraft: 'Atlas 180', originPoint: { x: 36, y: 56 }, destinationPoint: { x: 43, y: 51 }, accent: '#9cc7ff' },
  { id: 'new-york-boston', flightNumber: 'FF 118', origin: 'New York', originCode: 'NYC', destination: 'Boston', destinationCode: 'BOS', distance: 306, aircraft: 'Northstar', originPoint: { x: 12, y: 39 }, destinationPoint: { x: 16, y: 31 }, accent: '#ef8fcb' },
  { id: 'sydney-melbourne', flightNumber: 'FF 936', origin: 'Sydney', originCode: 'SYD', destination: 'Melbourne', destinationCode: 'MEL', distance: 443, aircraft: 'Pacific 3', originPoint: { x: 84, y: 78 }, destinationPoint: { x: 77, y: 88 }, accent: '#f1e27d' },
]

const gates = ['A12', 'B06', 'C03', 'D19', 'E04', 'A27', 'B14', 'C11']
const seats = ['14A', '22F', '08A', '11C', '03D', '18B', '27F', '06A']

export const durationChoices = [15, 25, 30, 45, 60, 90, 120]

export function getFlightsForDuration(durationMinutes: number): FlightOption[] {
  return routes.map((route, index) => ({
    ...route,
    id: `${route.id}-${durationMinutes}`,
    durationMinutes,
    gate: gates[index % gates.length],
    seat: seats[index % seats.length],
  }))
}

export function getFlightById(id: string, durationMinutes?: number): FlightOption | undefined {
  const duration = durationMinutes ?? Number(id.match(/-(\d+)$/)?.[1] ?? 0)
  return getFlightsForDuration(duration).find((flight) => flight.id === id)
}

export function getDefaultFlight(durationMinutes: number): FlightOption {
  return getFlightsForDuration(durationMinutes)[0]
}
