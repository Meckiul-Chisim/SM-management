import { Link } from 'react-router-dom'
import { buttonClasses } from './buttonStyles.js'

// A link that looks like a button, for actions that navigate (e.g. "New post").
function ButtonLink({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  )
}

export default ButtonLink
