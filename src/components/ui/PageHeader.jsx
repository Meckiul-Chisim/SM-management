function PageHeader({ title, description, eyebrow }) {
  return (
    <div className="mb-7">
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}

export default PageHeader
