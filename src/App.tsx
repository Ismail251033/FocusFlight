import { useEffect, useMemo, useState } from 'react'
import { Navigation } from './components/Navigation'
import { getFlightById } from './data/flights'
import { DndPage, DurationPage, FlightDetailsPage, FlightsPage, FocusPage, HomePage, LandingPage, SettingsPage, StatsPage, SummaryPage } from './pages/Pages'
import { clearSavedState, createInitialState, loadState, persistState } from './store/storage'
import type { AppState, FlightOption, FlightRecord, FlightSession } from './types'
import { getSessionMetrics } from './utils/flight'

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function playTone(frequency: number, duration = 0.08) {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.035, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + duration)
  } catch {
    // Browsers may block audio until a user gesture. The visual flow still works.
  }
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [path, setPath] = useState(() => window.location.pathname || '/')
  const [now, setNow] = useState(() => Date.now())
  const [boardingStep, setBoardingStep] = useState<number | null>(null)
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  const updateState = (update: (previous: AppState) => AppState) => setState(update)
  const navigate = (nextPath: string) => {
    if (nextPath === path) return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectedFlight = useMemo(() => state.selectedFlightId ? getFlightById(state.selectedFlightId, state.selectedDuration) : undefined, [state.selectedFlightId, state.selectedDuration])
  const activeFlight = useMemo(() => state.activeSession ? getFlightById(state.activeSession.flightId, state.activeSession.durationMinutes) : undefined, [state.activeSession])
  const lastRecord = useMemo<FlightRecord | undefined>(() => state.lastRecordId ? state.history.find((record) => record.id === state.lastRecordId) : state.history[0], [state.history, state.lastRecordId])
  const lastRecordFlight = lastRecord ? getFlightById(lastRecord.flightId, lastRecord.durationMinutes) : undefined

  useEffect(() => persistState(state), [state])

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || '/')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = state.preferences.theme
    document.documentElement.dataset.reducedMotion = String(state.preferences.reducedMotion)
  }, [state.preferences.theme, state.preferences.reducedMotion])

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!state.activeSession || path !== '/focus') return
    const tick = () => setNow(Date.now())
    tick()
    const interval = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [state.activeSession, path])

  const finishSession = () => {
    updateState((previous) => {
      const session = previous.activeSession
      if (!session) return previous
      const flight = getFlightById(session.flightId, session.durationMinutes)
      if (!flight) return previous
      const metrics = getSessionMetrics(session, Date.now())
      const record: FlightRecord = {
        id: createId(),
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        origin: flight.origin,
        originCode: flight.originCode,
        destination: flight.destination,
        destinationCode: flight.destinationCode,
        durationMinutes: flight.durationMinutes,
        focusMinutes: Math.max(1, Math.round(metrics.elapsedMs / 60_000)),
        status: 'LANDED',
        completedAt: Date.now(),
      }
      return { ...previous, activeSession: null, history: [record, ...previous.history], lastRecordId: record.id }
    })
    if (state.preferences.sound) playTone(540, 0.16)
    navigate('/landing')
  }

  useEffect(() => {
    if (!state.activeSession || path !== '/focus') return
    const metrics = getSessionMetrics(state.activeSession, now)
    if (metrics.remainingMs <= 0 && state.activeSession.status === 'active') finishSession()
    // finishSession intentionally reads the current persisted session and only runs at zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, state.activeSession, path])

  useEffect(() => {
    if (boardingStep === null || !selectedFlight) return
    const delay = state.preferences.reducedMotion ? 260 : 860
    if (state.preferences.sound) playTone(boardingStep === 2 ? 430 : 300 + boardingStep * 70)
    const timeout = window.setTimeout(() => {
      if (boardingStep < 3) {
        setBoardingStep((current) => current === boardingStep ? boardingStep + 1 : current)
        return
      }
      const session: FlightSession = {
        id: createId(),
        flightId: selectedFlight.id,
        durationMinutes: selectedFlight.durationMinutes,
        durationMs: selectedFlight.durationMinutes * 60_000,
        startTime: Date.now(),
        pausedAt: null,
        totalPausedMs: 0,
        status: 'active',
      }
      updateState((previous) => ({ ...previous, activeSession: session }))
      setBoardingStep(null)
      navigate('/focus')
    }, delay)
    return () => window.clearTimeout(timeout)
  }, [boardingStep, selectedFlight, state.preferences.reducedMotion, state.preferences.sound])

  const chooseDuration = (duration: number) => {
    updateState((previous) => ({ ...previous, selectedDuration: duration, selectedFlightId: null }))
    navigate('/flights')
  }

  const chooseFlight = (flight: FlightOption) => {
    updateState((previous) => ({ ...previous, selectedDuration: flight.durationMinutes, selectedFlightId: flight.id }))
    navigate(`/flight/${flight.id}`)
  }

  const pauseFlight = () => updateState((previous) => previous.activeSession ? ({ ...previous, activeSession: { ...previous.activeSession, status: 'paused', pausedAt: Date.now() } }) : previous)
  const resumeFlight = () => updateState((previous) => {
    const session = previous.activeSession
    if (!session || !session.pausedAt) return previous
    return { ...previous, activeSession: { ...session, status: 'active', totalPausedMs: session.totalPausedMs + (Date.now() - session.pausedAt), pausedAt: null } }
  })
  const endFlight = () => {
    const session = state.activeSession
    const flight = activeFlight
    if (!session || !flight) return
    const metrics = getSessionMetrics(session, Date.now())
    const record: FlightRecord = {
      id: createId(), flightId: flight.id, flightNumber: flight.flightNumber, origin: flight.origin, originCode: flight.originCode, destination: flight.destination, destinationCode: flight.destinationCode,
      durationMinutes: flight.durationMinutes, focusMinutes: Math.max(1, Math.round(metrics.elapsedMs / 60_000)), status: 'ENDED', completedAt: Date.now(),
    }
    updateState((previous) => ({ ...previous, activeSession: null, history: [record, ...previous.history], lastRecordId: record.id }))
    navigate('/summary')
  }

  const updatePreferences = (patch: Partial<AppState['preferences']>) => updateState((previous) => ({ ...previous, preferences: { ...previous.preferences, ...patch } }))
  const resetData = () => {
    if (!window.confirm('Reset your local Focus Flight data?')) return
    clearSavedState()
    setState(createInitialState())
    navigate('/')
  }

  const renderPage = () => {
    if (path === '/') return <HomePage onNavigate={navigate} state={state} />
    if (path === '/choose-time') return <DurationPage onNavigate={navigate} state={state} onSelectDuration={chooseDuration} />
    if (path === '/flights') return <FlightsPage onNavigate={navigate} state={state} onSelectFlight={chooseFlight} />
    if (path.startsWith('/flight/')) return selectedFlight ? <FlightDetailsPage onNavigate={navigate} flight={selectedFlight} state={state} onContinue={() => navigate('/dnd')} /> : <FlightsPage onNavigate={navigate} state={state} onSelectFlight={chooseFlight} />
    if (path === '/dnd') return selectedFlight ? <DndPage onNavigate={navigate} flight={selectedFlight} sequenceStep={boardingStep} onStartSequence={() => setBoardingStep(0)} instructionsOpen={instructionsOpen} setInstructionsOpen={setInstructionsOpen} /> : <FlightsPage onNavigate={navigate} state={state} onSelectFlight={chooseFlight} />
    if (path === '/focus') return state.activeSession && activeFlight ? <FocusPage onNavigate={navigate} flight={activeFlight} session={state.activeSession} now={now} clockFormat={state.preferences.clockFormat} onPause={pauseFlight} onResume={resumeFlight} onEnd={endFlight} /> : <HomePage onNavigate={navigate} state={state} />
    if (path === '/landing') return lastRecord && lastRecordFlight ? <LandingPage onNavigate={navigate} record={lastRecord} flight={lastRecordFlight} /> : <HomePage onNavigate={navigate} state={state} />
    if (path === '/summary') return lastRecord && lastRecordFlight ? <SummaryPage onNavigate={navigate} record={lastRecord} flight={lastRecordFlight} /> : <StatsPage onNavigate={navigate} history={state.history} />
    if (path === '/stats') return <StatsPage onNavigate={navigate} history={state.history} />
    if (path === '/settings') return <SettingsPage onNavigate={navigate} preferences={state.preferences} onUpdate={updatePreferences} onReset={resetData} />
    return <HomePage onNavigate={navigate} state={state} />
  }

  return <div className={`app ${path === '/focus' ? 'app--focus' : ''}`}><Navigation path={path} onNavigate={navigate}>{state.activeSession && path !== '/focus' && <button className="header-flight-pill" onClick={() => navigate('/focus')}><span className="status-dot status-dot--live" /> IN FLIGHT <span className="mono">{activeFlight?.flightNumber}</span></button>}</Navigation>{renderPage()}<footer className="app-footer"><span>FOCUS FLIGHT</span><span>Deep work, boarded.</span></footer></div>
}
