import { PRODUCT_NAME } from '../../app/navigation.js'

// Eyebrow label, title, one line of context, and the page's main action(s) on the right.
// `eyebrow` replaces the default product label (the dashboard uses it for its greeting).
function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="haven-page-heading mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="haven-page-eyebrow mb-2">{(eyebrow || `${PRODUCT_NAME} workspace`).toUpperCase()}</p>
        <h1 className="text-[1.625rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[0.9375rem] leading-6 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export default PageHeader
