import { BarChart3, Home, Plane, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { Brand } from './Brand'

interface NavigationProps {
  path: string
  onNavigate: (path: string) => void
  children?: ReactNode
}

const items = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/flights', label: 'Flights', icon: Plane },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function Navigation({ path, onNavigate, children }: NavigationProps) {
  const isFocus = path === '/focus' || path === '/landing'
  return (
    <>
      <header className={`topbar ${isFocus ? 'topbar--focus' : ''}`}>
        <Brand onClick={() => onNavigate('/')} />
        {!isFocus && <nav className="desktop-nav" aria-label="Main navigation">
          {items.map(({ path: itemPath, label, icon: Icon }) => (
            <button key={itemPath} className={path === itemPath ? 'nav-link nav-link--active' : 'nav-link'} onClick={() => onNavigate(itemPath)}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>}
        <div className="topbar-slot">{children}</div>
      </header>
      {!isFocus && <nav className="mobile-nav" aria-label="Mobile navigation">
        {items.map(({ path: itemPath, label, icon: Icon }) => (
          <button key={itemPath} className={path === itemPath ? 'mobile-nav__item mobile-nav__item--active' : 'mobile-nav__item'} onClick={() => onNavigate(itemPath)}>
            <Icon size={17} /> <span>{label}</span>
          </button>
        ))}
      </nav>}
    </>
  )
}
