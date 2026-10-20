function PageHeader({ title, description, eyebrow }) {
  return (
    <div className="workspace-enter mb-8">
      {eyebrow && (
        <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-800">
          <span className="inline-block size-1.5 rounded-sm bg-brand-700" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h1 className="text-[1.75rem] font-semibold tracking-[-0.045em] text-ink sm:text-[2.1rem]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-[0.95rem]">
          {description}
        </p>
      )}
    </div>
  )
}

export default PageHeader
