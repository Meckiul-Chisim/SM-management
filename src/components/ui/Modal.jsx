import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import IconButton from './IconButton.jsx'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Dialogs that are open, top-most last. Escape closes only the top one, and the
// page behind stays locked until the last one closes.
const openDialogs = []
let previousOverflow = ''

// Accessible dialog:
//   - focus moves inside when it opens and returns to the opener when it closes
//   - Tab and Shift+Tab stay inside it
//   - Escape closes it (only the top-most dialog)
//   - the page behind does not scroll
// Clicking the backdrop closes it only when dismissOnBackdrop is set, so a form
// is never lost by an accidental click.
function Modal({ title, description, onClose, children, wide = false, dismissOnBackdrop = false, role = 'dialog' }) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const token = {}
    const opener = document.activeElement
    if (openDialogs.length === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    openDialogs.push(token)

    // Start on the first field or action in the body; fall back to the dialog itself.
    const dialog = dialogRef.current
    const body = dialog.querySelector('[data-modal-body]')
    const first = dialog.querySelector('[data-autofocus]') || body.querySelector(FOCUSABLE)
    ;(first || dialog).focus()

    function onKeyDown(event) {
      if (openDialogs[openDialogs.length - 1] !== token) return
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = [...dialog.querySelectorAll(FOCUSABLE)].filter((item) => item.offsetParent !== null || item === document.activeElement)
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === firstItem || document.activeElement === dialog)) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      openDialogs.splice(openDialogs.indexOf(token), 1)
      if (openDialogs.length === 0) document.body.style.overflow = previousOverflow
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus()
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-scrim p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (dismissOnBackdrop && event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`flex max-h-[92dvh] w-full flex-col rounded-t-xl border border-line bg-panel shadow-2xl outline-none sm:max-h-[88dvh] sm:rounded-xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-sm leading-5 text-muted">{description}</p>}
          </div>
          <IconButton label="Close dialog" onClick={onClose} className="-mr-2 -mt-1">
            <X size={18} aria-hidden="true" />
          </IconButton>
        </div>
        <div data-modal-body className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </section>
    </div>,
    document.body,
  )
}

export default Modal
