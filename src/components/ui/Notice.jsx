import { CircleAlert, Info, TriangleAlert, CheckCircle2, X } from 'lucide-react'

const icons = { info: Info, warning: TriangleAlert, success: CheckCircle2, danger: CircleAlert }

// Inline message. Warnings and errors use role="alert" so they are announced at once.
function Notice({ tone = 'info', children, onDismiss, className = '' }) {
  const Icon = icons[tone] || Info
  const urgent = tone === 'danger' || tone === 'warning'
  return (
    <div className={`notice notice-${tone} flex items-start gap-2.5 ${className}`} role={urgent ? 'alert' : undefined}>
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="-m-1 rounded p-1 opacity-80 hover:opacity-100" aria-label="Dismiss message">
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default Notice
