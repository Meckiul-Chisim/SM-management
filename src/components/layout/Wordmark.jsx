// The Haven mark: a simple arch (a doorway, a shelter) in moss with a sage opening.
function Wordmark({ name = 'Haven' }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" className="shrink-0">
        <path d="M3 24V12.5C3 7.2 7.5 3 13 3s10 4.2 10 9.5V24z" fill="var(--color-brand-700)" />
        <path d="M8.5 24v-8c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v8z" fill="var(--color-canvas)" />
      </svg>
      <span className="truncate font-display text-[1.2rem] font-semibold tracking-[-0.03em] text-ink">
        {name}
      </span>
    </span>
  )
}

export default Wordmark
