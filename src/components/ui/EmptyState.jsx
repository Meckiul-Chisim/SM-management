import { Link } from 'react-router-dom'
import Card from './Card.jsx'

function EmptyState({ title, description }) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      <Link to="/dashboard" className="mt-5 text-sm font-semibold text-brand-800 underline-offset-4 hover:underline">
        Go to dashboard
      </Link>
    </Card>
  )
}

export default EmptyState
