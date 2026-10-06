import type { AppState, Preferences } from '../types'

const STORAGE_KEY = 'focus-flight-state-v1'

export const defaultPreferences: Preferences = {
  defaultDuration: 45,
  sound: true,
  reducedMotion: false,
  clockFormat: '24h',
  theme: 'dark',
}

export function createInitialState(): AppState {
  return {
    selectedDuration: defaultPreferences.defaultDuration,
    selectedFlightId: null,
    activeSession: null,
    history: [],
    lastRecordId: null,
    preferences: defaultPreferences,
  }
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return createInitialState()
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return createInitialState()
    const parsed = JSON.parse(saved) as Partial<AppState>
    return {
      ...createInitialState(),
      ...parsed,
      preferences: { ...defaultPreferences, ...(parsed.preferences ?? {}) },
    }
  } catch {
    return createInitialState()
  }
}

export function persistState(state: AppState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearSavedState() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
