import HavenLogo from './HavenLogo.jsx'

function Wordmark({ name = 'Haven' }) {
  return (
    <span className="flex items-center gap-2.5">
      <HavenLogo />
      <span className="truncate font-display text-[1.2rem] font-semibold tracking-[-0.03em] text-ink">
        {name}
      </span>
    </span>
  )
}

export default Wordmark
