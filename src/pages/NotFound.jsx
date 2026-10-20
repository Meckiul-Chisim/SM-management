import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader.jsx'

function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-12 text-center sm:py-20">
      <PageHeader
        eyebrow="404"
        title="This page isn't here"
        description="The address may be incorrect, or the page may have moved."
      />
      <Link
        to="/dashboard"
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
      >
        Back to dashboard
      </Link>
    </div>
  )
}

export default NotFound
