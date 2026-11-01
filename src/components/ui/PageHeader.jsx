// Title, one line of context, and the page's main action(s) aligned to the right.
// `eyebrow` is a small gold label above the title (used for the dashboard greeting).
function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="workspace-enter mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-[1.75rem] font-medium leading-tight tracking-[-0.025em] text-ink sm:text-[2.25rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-[0.9375rem] leading-6 text-muted">{description}</p>}
        <div className="gold-rule mt-4 w-24" aria-hidden="true" />
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export default PageHeader
