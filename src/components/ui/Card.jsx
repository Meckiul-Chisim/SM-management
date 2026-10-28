// A frosted-glass surface (see .glass in styles/index.css): a soft border, light
// inner edge and gentle blur. Cards only exist where content needs a container.
// Pass glass={false} for a flat, opaque surface (e.g. inside lists).
function Card({ as: Tag = 'section', children, className = '', tone = 'default', glass = true, ...props }) {
  const toneClass = tone === 'brand' ? 'border-brand-100 bg-brand-50 text-ink' : glass ? 'glass' : 'border-line bg-panel'
  return (
    <Tag className={`rounded-2xl border ${toneClass} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export default Card
