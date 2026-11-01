import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { ToastContext } from './toastContext.js'

const ICONS = { success: CheckCircle2, info: Info, error: TriangleAlert }
const DURATION = 5000
const ACTION_DURATION = 8000 // toasts with an Undo button stay a little longer

// Short confirmations ("Post saved") shown in a polite live region, so screen
// readers announce them without stealing focus.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  // show(message, tone, { actionLabel, onAction }) - the action (for example Undo) is optional.
  const show = useCallback((message, tone = 'success', action = null) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current.slice(-2), { id, message, tone, action }])
    timers.current.set(id, setTimeout(() => dismiss(id), action ? ACTION_DURATION : DURATION))
  }, [dismiss])

  // Clear any pending timers when the provider unmounts.
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone] || Info
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl glass px-4 py-3 text-sm text-ink" style={{ animation: 'rise 360ms var(--ease-luxe) both' }}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${toast.tone === 'error' ? 'text-danger' : 'text-brand-700'}`} aria-hidden="true" />
              <p className="flex-1 leading-5">{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => { toast.action.onAction(); dismiss(toast.id) }}
                  className="-my-1 rounded-full px-3 py-1 text-sm font-semibold text-brand-800 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-700"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-m-1 rounded p-1 text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-700"
                aria-label="Dismiss message"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
