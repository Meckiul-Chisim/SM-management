import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="This address does not match a page in the workspace."
      action={<Link to="/dashboard" className="text-sm font-semibold text-brand-800 underline underline-offset-4">Go to dashboard</Link>}
    />
  )
}

export default NotFound
