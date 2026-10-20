import { ArrowRight, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from './Card.jsx'

function EmptyState({ title, description }) {
  return (
    <Card className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-800">
        <Layers3 size={23} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      <Link to="/dashboard" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-800 hover:underline">
        Back to overview <ArrowRight size={15} />
      </Link>
    </Card>
  )
}

export default EmptyState
