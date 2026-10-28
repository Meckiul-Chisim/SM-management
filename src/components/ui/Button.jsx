import { buttonClasses } from './buttonStyles.js'

function Button({ children, variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </button>
  )
}

export default Button
