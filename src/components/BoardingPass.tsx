import { Barcode, Clock3, DoorOpen, Plane } from 'lucide-react'
import type { ClockFormat, FlightOption } from '../types'
import { formatClock, formatDate } from '../utils/time'

interface BoardingPassProps {
  flight: FlightOption
  clockFormat: ClockFormat
  onBoard?: () => void
  actionLabel?: string
}

export function BoardingPass({ flight, clockFormat, onBoard, actionLabel = 'BOARD FLIGHT' }: BoardingPassProps) {
  const departure = Date.now()
  const arrival = departure + flight.durationMinutes * 60_000
  return (
    <section className="boarding-pass" aria-label="Focus Flight boarding pass">
      <div className="boarding-pass__top">
        <div className="boarding-pass__brand"><span className="boarding-mini-mark"><Plane size={13} /></span><span>FOCUS FLIGHT</span></div>
        <span className="mono boarding-pass__flight">{flight.flightNumber}</span>
      </div>
      <div className="boarding-pass__main">
        <div className="boarding-route"><div><strong>{flight.originCode}</strong><span>{flight.origin}</span></div><span className="boarding-route__path"><span /><Plane size={16} /></span><div className="boarding-route__arrival"><strong>{flight.destinationCode}</strong><span>{flight.destination}</span></div></div>
        <div className="boarding-times"><div><span>DEPARTURE</span><strong>{formatClock(departure, clockFormat)}</strong><small>{formatDate(departure)}</small></div><div><span>ARRIVAL</span><strong>{formatClock(arrival, clockFormat)}</strong><small>{formatDate(arrival)}</small></div></div>
      </div>
      <div className="boarding-pass__stub">
        <div><span>GATE</span><strong>{flight.gate}</strong></div><div><span>SEAT</span><strong>{flight.seat}</strong></div><div><span>CLASS</span><strong>FOCUS</strong></div><div><span>FLIGHT TIME</span><strong>{flight.durationMinutes} MIN</strong></div>
      </div>
      <div className="boarding-pass__barcode" aria-hidden="true"><Barcode size={20} /><span className="barcode-bars">|||| ||| |||||| | ||||| || ||||||| ||| ||||</span><span className="barcode-code">{flight.flightNumber.replace(' ', '')} · {flight.originCode} · {flight.destinationCode}</span></div>
      {onBoard && <button className="button button--primary boarding-pass__button" onClick={onBoard}><DoorOpen size={17} /> {actionLabel}</button>}
      <p className="boarding-pass__note">Digital focus pass · not a real travel ticket</p>
      <Clock3 className="boarding-pass__watermark" size={80} aria-hidden="true" />
    </section>
  )
}
