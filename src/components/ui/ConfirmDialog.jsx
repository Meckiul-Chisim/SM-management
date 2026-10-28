import Button from './Button.jsx'
import Modal from './Modal.jsx'

// Asks before something that cannot be undone. `children` can hold extra detail or
// options (for example a checkbox). Focus starts on Cancel, the safe choice.
function ConfirmDialog({ title, description, confirmLabel = 'Delete', onConfirm, onCancel, children, tone = 'danger' }) {
  return (
    <Modal title={title} description={description} onClose={onCancel} role="alertdialog" dismissOnBackdrop>
      {children && <div className="mb-5 text-sm leading-6 text-muted">{children}</div>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} data-autofocus>Cancel</Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
