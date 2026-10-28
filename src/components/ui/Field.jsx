import { useId } from 'react'

// Label + control + hint + error, wired together for assistive technology.
// aria-invalid and aria-describedby are added only when they apply.
function Wrapper({ label, hint, error, required, children, className, id }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="field-help">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}

function describe(id, hint, error) {
  if (error) return `${id}-error`
  return hint ? `${id}-hint` : undefined
}

export function TextField({ label, hint, error, required, className = '', type = 'text', ...props }) {
  const id = useId()
  return (
    <Wrapper {...{ label, hint, error, required, className, id }}>
      <input
        id={id}
        type={type}
        className="field"
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describe(id, hint, error)}
        {...props}
      />
    </Wrapper>
  )
}

export function TextareaField({ label, hint, error, required, className = '', ...props }) {
  const id = useId()
  return (
    <Wrapper {...{ label, hint, error, required, className, id }}>
      <textarea
        id={id}
        className="field"
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describe(id, hint, error)}
        {...props}
      />
    </Wrapper>
  )
}

export function SelectField({ label, hint, error, required, className = '', children, ...props }) {
  const id = useId()
  return (
    <Wrapper {...{ label, hint, error, required, className, id }}>
      <select
        id={id}
        className="field"
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describe(id, hint, error)}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  )
}
