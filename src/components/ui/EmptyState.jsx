import { Construction } from 'lucide-react'
import Card from './Card.jsx'

function EmptyState({ title, description }) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
        <Construction size={22} aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
    </Card>
  )
}

export default EmptyState
