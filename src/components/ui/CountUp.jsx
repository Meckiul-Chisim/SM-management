import { useCountUp } from '../../hooks/useCountUp.js'

// A number that counts up when it first appears. The real value is always in the
// accessible name, so screen readers never hear the in-between numbers.
function CountUp({ value, className = '' }) {
  const shown = useCountUp(value)
  return (
    <span className={className} aria-label={String(value)}>
      <span aria-hidden="true">{shown}</span>
    </span>
  )
}

export default CountUp
