import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, CloudSun, Coffee, Download, ExternalLink, Gauge, Laptop, Moon, Pause, Play, RotateCcw, Smartphone, Sparkles, TimerReset, Volume2, VolumeX, WifiOff, X } from 'lucide-react'
import { BoardingPass } from '../components/BoardingPass'
import { FlightCard } from '../components/FlightCard'
import { FlightMap } from '../components/FlightMap'
import type { AppState, FlightOption, FlightRecord, FlightSession, Preferences } from '../types'
import { durationChoices, getFlightsForDuration } from '../data/flights'
import { getPhase, getSessionMetrics } from '../utils/flight'
import { formatDate, formatDistance, formatMinutes, formatTimer } from '../utils/time'
import { getStats } from '../utils/stats'

interface CommonProps {
  onNavigate: (path: string) => void
}

export function HomePage({ onNavigate, state }: CommonProps & { state: AppState }) {
  const previewFlight = getFlightsForDuration(state.preferences.defaultDuration)[0]
  return (
    <main className="page page--home">
      <div className="home-grid">
        <section className="home-copy reveal">
          <div className="eyebrow eyebrow--accent"><span className="eyebrow-dot" /> FOCUS FLIGHT / 01</div>
          <h1>Your next destination:<br /><em>deep focus.</em></h1>
          <p className="hero-text">Turn your study session into a flight. Choose your time, board your flight, and focus until you land.</p>
          <div className="hero-actions">
            <button className="button button--primary button--large" onClick={() => onNavigate('/choose-time')}><PlaneGlyph /> START A FLIGHT <ArrowRight size={17} /></button>
            {state.activeSession && <button className="button button--quiet" onClick={() => onNavigate('/focus')}><Play size={15} /> Continue flight</button>}
          </div>
          <div className="home-meta"><span><span className="status-dot status-dot--live" /> No account. No noise.</span><span>Local by design</span></div>
        </section>
        <section className="home-visual reveal reveal--delay" aria-label="Flight preview">
          <div className="visual-topline"><span className="mono">FF / {previewFlight.flightNumber.replace('FF ', '')}</span><span className="status-pill"><span className="status-dot" /> READY TO BOARD</span></div>
          <FlightMap flight={previewFlight} progress={0.28} />
          <div className="visual-caption"><div><span className="eyebrow">NEXT DEPARTURE</span><strong>{previewFlight.originCode} <span>→</span> {previewFlight.destinationCode}</strong></div><div className="visual-caption__duration"><span className="eyebrow">DEFAULT FLIGHT</span><strong>{formatMinutes(state.preferences.defaultDuration)}</strong></div></div>
        </section>
      </div>
      <div className="home-bottom"><div className="mini-feature"><Sparkles size={16} /><span><strong>Not a Pomodoro.</strong> A place to go.</span></div><div className="mini-feature"><Gauge size={16} /><span>Every flight has an exact arrival.</span></div><div className="mini-feature"><WifiOff size={16} /><span>Works offline, stays on your device.</span></div></div>
    </main>
  )
}

function PlaneGlyph() {
  return <span className="cta-plane" aria-hidden="true">↗</span>
}

export function DurationPage({ onNavigate, state, onSelectDuration }: CommonProps & { state: AppState; onSelectDuration: (duration: number) => void }) {
  const [custom, setCustom] = useState(state.selectedDuration.toString())
  const validCustom = Number(custom) >= 5 && Number(custom) <= 240
  return (
    <main className="page page--narrow">
      <button className="back-link" onClick={() => onNavigate('/')}><ArrowLeft size={15} /> Home</button>
      <div className="section-heading"><div className="eyebrow eyebrow--accent">TIME / 01</div><h1>How long do you<br /><em>want to focus?</em></h1><p>Pick the time you have. We’ll find a route with an exact arrival.</p></div>
      <div className="duration-grid" role="list">
        {durationChoices.map((duration) => <button key={duration} className={`duration-choice ${state.selectedDuration === duration ? 'duration-choice--selected' : ''}`} onClick={() => onSelectDuration(duration)}><strong>{duration}</strong><span>min</span>{state.selectedDuration === duration && <Check size={16} />}</button>)}
      </div>
      <div className="custom-duration"><div><span className="eyebrow">CUSTOM ROUTE</span><strong>Choose your own flight time</strong></div><div className="custom-input"><input type="number" min="5" max="240" value={custom} onChange={(event) => setCustom(event.target.value)} aria-label="Custom focus duration in minutes" /><span>min</span><button className="button button--secondary" disabled={!validCustom} onClick={() => onSelectDuration(Number(custom))}>USE TIME</button></div></div>
      <div className="page-footer-actions"><button className="button button--primary button--large" onClick={() => onNavigate('/flights')}>VIEW AVAILABLE FLIGHTS <ArrowRight size={17} /></button><span className="helper-text">Flights are generated with your exact duration.</span></div>
    </main>
  )
}

export function FlightsPage({ onNavigate, state, onSelectFlight }: CommonProps & { state: AppState; onSelectFlight: (flight: FlightOption) => void }) {
  const flights = useMemo(() => getFlightsForDuration(state.selectedDuration), [state.selectedDuration])
  return (
    <main className="page">
      <div className="page-topline"><button className="back-link" onClick={() => onNavigate('/choose-time')}><ArrowLeft size={15} /> Change time</button><span className="mono">{state.selectedDuration} MIN / EXACT DURATION</span></div>
      <div className="section-heading section-heading--split"><div><div className="eyebrow eyebrow--accent">FLIGHT BOARD / 02</div><h1>Choose your<br /><em>flight.</em></h1></div><p>Every route below lands after exactly <strong>{state.selectedDuration} minutes</strong>. Pick the one that feels like the right departure.</p></div>
      <div className="flight-board">{flights.map((flight) => <FlightCard key={flight.id} flight={flight} selected={state.selectedFlightId === flight.id} onSelect={() => onSelectFlight(flight)} />)}</div>
      <div className="page-note"><span className="status-dot status-dot--live" /> Eight local routes. No booking required. Your focus pass is digital.</div>
    </main>
  )
}

export function FlightDetailsPage({ onNavigate, flight, state, onContinue }: CommonProps & { flight: FlightOption; state: AppState; onContinue: () => void }) {
  return (
    <main className="page">
      <button className="back-link" onClick={() => onNavigate('/flights')}><ArrowLeft size={15} /> All flights</button>
      <div className="detail-layout">
        <section className="detail-copy"><div className="eyebrow eyebrow--accent">FLIGHT DETAILS / {flight.flightNumber}</div><h1>{flight.originCode} <span className="title-arrow">→</span><br /><em>{flight.destinationCode}</em></h1><p className="hero-text">A quiet route from {flight.origin} to {flight.destination}, with {flight.durationMinutes} minutes reserved for the work that matters.</p><div className="detail-specs"><div><span>ROUTE</span><strong>{flight.origin} → {flight.destination}</strong></div><div><span>AIRCRAFT</span><strong>{flight.aircraft}</strong></div><div><span>DISTANCE</span><strong>{formatDistance(flight.distance)}</strong></div><div><span>EXACT TIME</span><strong>{formatMinutes(flight.durationMinutes)}</strong></div></div><button className="button button--primary button--large" onClick={() => onNavigate('/dnd')}>VIEW BOARDING PASS <ArrowRight size={17} /></button></section>
        <section className="detail-pass"><BoardingPass flight={flight} clockFormat={state.preferences.clockFormat} onBoard={onContinue} actionLabel="CONTINUE TO DND" /></section>
      </div>
    </main>
  )
}

export function DndPage({ onNavigate, flight, sequenceStep, onStartSequence, instructionsOpen, setInstructionsOpen }: CommonProps & { flight: FlightOption; sequenceStep: number | null; onStartSequence: () => void; instructionsOpen: boolean; setInstructionsOpen: (open: boolean) => void }) {
  const steps = ['BOARDING', 'DOORS CLOSING', 'TAKEOFF', 'FOCUS MODE']
  if (sequenceStep !== null) {
    return <main className="page page--centered boarding-sequence"><div className="sequence-orbit"><span /><span /><span /></div><div className="eyebrow eyebrow--accent">{flight.flightNumber} / DEPARTURE</div><h1>{steps[sequenceStep]}</h1><p>{sequenceStep === 0 ? 'Please prepare for departure.' : sequenceStep === 1 ? 'Cabin doors are closing.' : sequenceStep === 2 ? 'Your runway is clear.' : 'You are in the air. Stay with the route.'}</p><div className="sequence-progress">{steps.map((step, index) => <span key={step} className={index <= sequenceStep ? 'sequence-progress__dot sequence-progress__dot--active' : 'sequence-progress__dot'} aria-label={step} />)}</div></main>
  }
  return (
    <main className="page page--narrow">
      <button className="back-link" onClick={() => onNavigate(`/flight/${flight.id}`)}><ArrowLeft size={15} /> Boarding pass</button>
      <div className="dnd-card"><div className="dnd-icon"><Moon size={22} /></div><div className="eyebrow eyebrow--accent">FINAL PREPARATION / 03</div><h1>Ready for<br /><em>takeoff?</em></h1><p className="hero-text">To get the most from your flight, turn on Do Not Disturb. Focus Flight cannot change your device settings for you.</p><button className="dnd-toggle" onClick={() => setInstructionsOpen(!instructionsOpen)}><CircleHelp size={17} /> HOW TO ENABLE DND <ChevronDown size={16} className={instructionsOpen ? 'rotate-180' : ''} /></button>{instructionsOpen && <div className="dnd-instructions"><div><Smartphone size={18} /><strong>On mobile</strong><p>Open Control Center or Quick Settings, then choose Focus / Do Not Disturb before returning here.</p></div><div><Laptop size={18} /><strong>On desktop</strong><p>Use macOS Focus from the menu bar, or Windows Quick Settings → Focus sessions / Notifications.</p></div></div>}<button className="button button--primary button--large dnd-confirm" onClick={onStartSequence}><Check size={17} /> I’VE ENABLED DND <ArrowRight size={17} /></button><span className="helper-text">This only starts your digital focus flight. It does not change system settings.</span></div>
    </main>
  )
}

export function FocusPage({ onNavigate, flight, session, now, clockFormat, onPause, onResume, onEnd }: CommonProps & { flight: FlightOption; session: FlightSession; now: number; clockFormat: '12h' | '24h'; onPause: () => void; onResume: () => void; onEnd: () => void }) {
  const [pauseOpen, setPauseOpen] = useState(false)
  const metrics = getSessionMetrics(session, now)
  const altitude = Math.round(31000 * Math.sin(Math.min(1, metrics.progress) * Math.PI))
  const distanceRemaining = Math.max(0, Math.round(flight.distance * (1 - metrics.progress)))
  return (
    <main className="focus-page">
      <div className="focus-head"><div><span className="mono focus-flight-number">{flight.flightNumber}</span><span className="focus-route">{flight.originCode} <span>→</span> {flight.destinationCode}</span></div><div className="focus-head__right"><span className="status-pill status-pill--quiet"><span className="status-dot status-dot--live" /> {metrics.phase.label}</span><button className="focus-menu" onClick={() => setPauseOpen(true)} aria-label="Pause flight"><Pause size={16} /></button></div></div>
      <div className="focus-layout"><section className="focus-timer"><div className="eyebrow">{metrics.phase.eyebrow}</div><div className="timer-value" aria-live="polite">{formatTimer(Math.ceil(metrics.remainingMs / 1000))}</div><div className="timer-label">remaining</div><div className="focus-progress"><span style={{ width: `${metrics.progress * 100}%` }} /></div><div className="focus-phase-copy"><strong>{metrics.phase.label}</strong><span>{metrics.phase.description}</span></div>{session.status === 'paused' ? <button className="button button--primary button--large" onClick={onResume}><Play size={17} /> RESUME FLIGHT</button> : <button className="button button--quiet" onClick={() => setPauseOpen(true)}><Pause size={15} /> Pause flight</button>}</section><section className="focus-route-panel"><FlightMap flight={flight} progress={metrics.progress} /><div className="focus-stats"><div><span>ALTITUDE</span><strong>{altitude.toLocaleString('en-US')} ft</strong></div><div><span>DISTANCE REMAINING</span><strong>{distanceRemaining} mi</strong></div><div><span>GATE</span><strong>{flight.gate}</strong></div></div></section></div>
      <div className="focus-footer"><span>Focus mode is quiet by design.</span><span className="mono">{flight.aircraft} · SEAT {flight.seat}</span></div>
      {pauseOpen && <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="pause-title"><button className="modal-close" onClick={() => setPauseOpen(false)} aria-label="Close"><X size={17} /></button><div className="dnd-icon"><Pause size={20} /></div><h2 id="pause-title">Pause flight?</h2><p>Your plane will hold its position and the timer will stop until you return.</p><div className="modal-actions"><button className="button button--primary" onClick={() => { onPause(); setPauseOpen(false) }}><Pause size={15} /> PAUSE FLIGHT</button><button className="button button--danger" onClick={() => { if (window.confirm('End this flight and save the focused time?')) onEnd() }}>END FLIGHT</button></div></div></div>}
    </main>
  )
}

export function LandingPage({ onNavigate, record, flight }: CommonProps & { record: FlightRecord; flight: FlightOption }) {
  return <main className="page page--centered landing-page"><div className="landing-mark"><PlaneGlyph /></div><div className="eyebrow eyebrow--accent">ARRIVAL CONFIRMED / {flight.destinationCode}</div><h1>Landed.</h1><p className="hero-text">{flight.flightNumber} · {flight.originCode} → {flight.destinationCode}<br /><strong>{record.durationMinutes} MINUTES COMPLETED</strong></p><p className="landing-message">Nice work. Your focus flight has landed.</p><div className="landing-actions"><button className="button button--primary button--large" onClick={() => onNavigate('/choose-time')}>BOOK ANOTHER FLIGHT <ArrowRight size={17} /></button><button className="button button--quiet" onClick={() => onNavigate('/summary')}>VIEW SUMMARY</button></div><div className="landing-line"><span /><span>FINAL APPROACH COMPLETE</span><span /></div></main>
}

export function SummaryPage({ onNavigate, record, flight }: CommonProps & { record: FlightRecord; flight: FlightOption }) {
  return <main className="page page--narrow"><button className="back-link" onClick={() => onNavigate('/stats')}><ArrowLeft size={15} /> Statistics</button><div className="section-heading"><div className="eyebrow eyebrow--accent">FLIGHT COMPLETED / {record.status}</div><h1>One route<br /><em>in the books.</em></h1><p>You’re building your focus habit, one calm departure at a time.</p></div><div className="summary-card"><div className="summary-route"><div><strong>{flight.originCode}</strong><span>{flight.origin}</span></div><span>→</span><div><strong>{flight.destinationCode}</strong><span>{flight.destination}</span></div></div><div className="summary-grid"><div><span>DURATION</span><strong>{formatMinutes(record.durationMinutes)}</strong></div><div><span>FOCUS TIME</span><strong>{formatMinutes(record.focusMinutes)}</strong></div><div><span>FLIGHT</span><strong>{record.flightNumber}</strong></div><div><span>STATUS</span><strong className={record.status === 'LANDED' ? 'text-accent' : ''}>{record.status}</strong></div></div><div className="summary-date">Arrived {formatDate(record.completedAt)}</div></div><div className="page-footer-actions"><button className="button button--primary button--large" onClick={() => onNavigate('/choose-time')}>BOOK ANOTHER FLIGHT <ArrowRight size={17} /></button><button className="button button--quiet" onClick={() => onNavigate('/stats')}>VIEW ALL STATS</button></div></main>
}

export function StatsPage({ onNavigate, history }: CommonProps & { history: FlightRecord[] }) {
  const stats = getStats(history)
  return <main className="page"><div className="section-heading section-heading--split"><div><div className="eyebrow eyebrow--accent">FLIGHT LOG / 04</div><h1>Your focus<br /><em>in motion.</em></h1></div><p>A private record of the time you chose to show up. Stored on this device, never sent away.</p></div><div className="stats-grid"><Stat label="Today" value={formatMinutes(stats.today)} icon={<CloudSun size={17} />} /><Stat label="This week" value={formatMinutes(stats.week)} icon={<TimerReset size={17} />} /><Stat label="Flights completed" value={String(stats.completed)} icon={<Check size={17} />} /><Stat label="Longest flight" value={formatMinutes(stats.longest)} icon={<Gauge size={17} />} /><div className="stat-card stat-card--wide"><span className="eyebrow">TOTAL FOCUS TIME</span><strong>{formatMinutes(stats.total)}</strong><span className="stat-card__caption">Every minute is a small arrival.</span></div></div><section className="history-section"><div className="section-bar"><div><div className="eyebrow">HISTORY</div><h2>Recent flights</h2></div><button className="button button--quiet" onClick={() => onNavigate('/choose-time')}>BOOK ANOTHER <ArrowRight size={15} /></button></div>{history.length === 0 ? <div className="empty-state"><PlaneGlyph /><h3>Your log is clear.</h3><p>Your first landing will appear here.</p><button className="button button--secondary" onClick={() => onNavigate('/choose-time')}>TAKE A FLIGHT</button></div> : <div className="history-list">{history.slice(0, 12).map((record) => <HistoryRow key={record.id} record={record} />)}</div>}</section></main>
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="stat-card"><div className="stat-card__icon">{icon}</div><span className="eyebrow">{label}</span><strong>{value}</strong></div>
}

function HistoryRow({ record }: { record: FlightRecord }) {
  return <div className="history-row"><div className="history-row__route"><span className="mono">{record.flightNumber}</span><strong>{record.originCode} <span>→</span> {record.destinationCode}</strong></div><div className="history-row__time"><span>{formatMinutes(record.durationMinutes)}</span><span>{formatDate(record.completedAt)}</span></div><span className={record.status === 'LANDED' ? 'history-status history-status--landed' : 'history-status'}>{record.status}</span></div>
}

export function SettingsPage({ preferences, onUpdate, onReset, onNavigate }: CommonProps & { preferences: Preferences; onUpdate: (patch: Partial<Preferences>) => void; onReset: () => void }) {
  return <main className="page page--narrow"><div className="section-heading"><div className="eyebrow eyebrow--accent">FLIGHT CONTROL / 05</div><h1>Make it<br /><em>yours.</em></h1><p>Small choices for a calmer cabin. Everything is saved locally on this device.</p></div><section className="settings-list"><SettingRow icon={<TimerReset size={18} />} title="Default focus duration" description="Preselect this duration on your next departure."><select value={preferences.defaultDuration} onChange={(event) => onUpdate({ defaultDuration: Number(event.target.value) })}>{durationChoices.map((duration) => <option key={duration} value={duration}>{duration} minutes</option>)}</select></SettingRow><SettingRow icon={preferences.sound ? <Volume2 size={18} /> : <VolumeX size={18} />} title="Flight sounds" description="Very subtle boarding, takeoff and landing cues."><Toggle checked={preferences.sound} onChange={(value) => onUpdate({ sound: value })} label="Flight sounds" /></SettingRow><SettingRow icon={<Moon size={18} />} title="Reduced motion" description="Keep the route steady and transitions minimal."><Toggle checked={preferences.reducedMotion} onChange={(value) => onUpdate({ reducedMotion: value })} label="Reduced motion" /></SettingRow><SettingRow icon={<ClockIcon />} title="Clock format" description="Choose how boarding times are displayed."><div className="segmented"><button className={preferences.clockFormat === '24h' ? 'is-active' : ''} onClick={() => onUpdate({ clockFormat: '24h' })}>24h</button><button className={preferences.clockFormat === '12h' ? 'is-active' : ''} onClick={() => onUpdate({ clockFormat: '12h' })}>12h</button></div></SettingRow><SettingRow icon={<Sparkles size={18} />} title="Theme" description="Keep the cockpit dark or switch to a light cabin."><div className="segmented"><button className={preferences.theme === 'dark' ? 'is-active' : ''} onClick={() => onUpdate({ theme: 'dark' })}>Dark</button><button className={preferences.theme === 'light' ? 'is-active' : ''} onClick={() => onUpdate({ theme: 'light' })}>Light</button></div></SettingRow></section><div className="settings-footer"><button className="button button--quiet" onClick={onReset}><RotateCcw size={15} /> Reset local data</button><span className="helper-text">This removes your local flight history and preferences.</span></div><button className="settings-about" onClick={() => onNavigate('/')}><span>FOCUS FLIGHT</span><span>v1.0 · Built for deep work</span></button></main>
}

function ClockIcon() { return <span className="clock-icon">12</span> }

function SettingRow({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return <div className="setting-row"><div className="setting-row__icon">{icon}</div><div className="setting-row__copy"><strong>{title}</strong><span>{description}</span></div><div className="setting-row__control">{children}</div></div>
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button className={`toggle ${checked ? 'toggle--on' : ''}`} onClick={() => onChange(!checked)} role="switch" aria-checked={checked} aria-label={label}><span /></button>
}
