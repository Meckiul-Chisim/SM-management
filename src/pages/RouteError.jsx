import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

// Shown if a page crashes. Saved data is untouched, so reloading is safe.
function RouteError() {
  useDocumentTitle('Something went wrong')
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center text-ink">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm leading-6 text-muted">
        This page ran into a problem. Your saved workspace has not been changed. Try reloading, or go back to the dashboard.
      </p>
      <div className="mt-2 flex gap-2">
        <Button onClick={() => window.location.reload()}>Reload page</Button>
        <Link to="/dashboard" className="inline-flex min-h-11 items-center rounded-lg border border-line bg-panel px-4 text-sm font-semibold sm:min-h-10">
          Dashboard
        </Link>
      </div>
    </div>
  )
}

export default RouteError
