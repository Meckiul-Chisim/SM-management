import Card from './Card.jsx'

// Used when a list has nothing to show. Pass `action` (a Button or Link) when the
// person can do something about it; leave it out when they cannot.
function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <Card className={`flex flex-col items-center justify-center px-6 py-10 text-center ${className}`}>
      {Icon && (
        <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-surface text-muted">
          <Icon size={20} aria-hidden="true" />
        </span>
      )}
      <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
      {description && <p className="mt-1.5 max-w-md text-sm leading-6 text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  )
}

export default EmptyState
