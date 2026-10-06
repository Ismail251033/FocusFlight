import { Plane } from 'lucide-react'

interface BrandProps {
  compact?: boolean
  onClick?: () => void
}

export function Brand({ compact = false, onClick }: BrandProps) {
  return (
    <button className={`brand ${compact ? 'brand--compact' : ''}`} onClick={onClick} aria-label="Focus Flight home">
      <span className="brand-mark" aria-hidden="true"><Plane size={18} strokeWidth={2.4} /></span>
      <span className="brand-name">Focus <strong>Flight</strong></span>
    </button>
  )
}
