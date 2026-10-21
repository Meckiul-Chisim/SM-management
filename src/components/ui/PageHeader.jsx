function PageHeader({ title, description }) {
  return (
    <div className="workspace-enter mb-8">
      <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.125rem]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-xl text-[0.9375rem] leading-6 text-muted">
          {description}
        </p>
      )}
    </div>
  )
}

export default PageHeader
