import { MapPin, Plane } from 'lucide-react'
import type { FlightOption } from '../types'
import { interpolatePoint } from '../utils/flight'

interface FlightMapProps {
  flight: FlightOption
  progress: number
  compact?: boolean
}

export function FlightMap({ flight, progress, compact = false }: FlightMapProps) {
  const point = interpolatePoint(flight.originPoint, flight.destinationPoint, progress)
  const path = `M ${flight.originPoint.x} ${flight.originPoint.y} Q 50 18 ${flight.destinationPoint.x} ${flight.destinationPoint.y}`
  return (
    <div className={`flight-map ${compact ? 'flight-map--compact' : ''}`}>
      <div className="flight-map__header">
        <span className="eyebrow">LIVE ROUTE</span>
        <span className="map-progress">{Math.round(progress * 100)}%</span>
      </div>
      <div className="flight-map__canvas">
        <div className="map-grid" aria-hidden="true" />
        <svg viewBox="0 0 100 100" role="img" aria-label={`Flight path from ${flight.origin} to ${flight.destination}`}>
          <path d={path} className="route-shadow" />
          <path d={path} className="route-line" pathLength="1" style={{ strokeDashoffset: 1 - progress }} />
          <circle cx={flight.originPoint.x} cy={flight.originPoint.y} r="2.7" className="route-node route-node--origin" />
          <circle cx={flight.destinationPoint.x} cy={flight.destinationPoint.y} r="2.7" className="route-node route-node--destination" />
          <g transform={`translate(${point.x - 3.8} ${point.y - 3.8}) rotate(-18 3.8 3.8)`} className="route-plane">
            <Plane size={7.6} fill="currentColor" strokeWidth={1.4} />
          </g>
        </svg>
        <div className="map-label map-label--origin" style={{ left: `${flight.originPoint.x}%`, top: `${flight.originPoint.y}%` }}>
          <MapPin size={12} /> <span>{flight.originCode}</span>
        </div>
        <div className="map-label map-label--destination" style={{ left: `${flight.destinationPoint.x}%`, top: `${flight.destinationPoint.y}%` }}>
          <MapPin size={12} /> <span>{flight.destinationCode}</span>
        </div>
      </div>
      <div className="flight-map__route-labels">
        <div><span className="eyebrow">ORIGIN</span><strong>{flight.origin}</strong></div>
        <span className="route-arrow">→</span>
        <div className="route-labels__right"><span className="eyebrow">DESTINATION</span><strong>{flight.destination}</strong></div>
      </div>
    </div>
  )
}
