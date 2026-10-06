import { ArrowRight, PlaneTakeoff } from 'lucide-react'
import type { FlightOption } from '../types'
import { formatDistance, formatMinutes } from '../utils/time'

interface FlightCardProps {
  flight: FlightOption
  onSelect: () => void
  selected?: boolean
}

export function FlightCard({ flight, onSelect, selected = false }: FlightCardProps) {
  return (
    <button className={`flight-card ${selected ? 'flight-card--selected' : ''}`} onClick={onSelect} aria-label={`Select ${flight.flightNumber}, ${flight.origin} to ${flight.destination}`}>
      <div className="flight-card__topline"><span className="mono flight-number">{flight.flightNumber}</span><span className="flight-card__aircraft"><PlaneTakeoff size={13} /> {flight.aircraft}</span></div>
      <div className="flight-card__route">
        <div><strong>{flight.originCode}</strong><span>{flight.origin}</span></div>
        <div className="flight-card__arrow"><span className="flight-card__line" /><ArrowRight size={17} /></div>
        <div className="flight-card__destination"><strong>{flight.destinationCode}</strong><span>{flight.destination}</span></div>
      </div>
      <div className="flight-card__details"><span>{formatMinutes(flight.durationMinutes)}</span><span>Gate {flight.gate}</span><span>Seat {flight.seat}</span><span>{formatDistance(flight.distance)}</span></div>
    </button>
  )
}
