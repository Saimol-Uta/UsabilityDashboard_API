import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
  /** If true, renders as a right-side drawer instead of a centered modal */
  drawer?: boolean
}

export default function Modal({ isOpen, onClose, title, children, maxWidth, drawer }: ModalProps) {
  const containerRef = useFocusTrap(isOpen)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const variant = drawer ? 'drawer' : 'default'

  const content = (
    <div
      className={`modal-overlay ${drawer ? 'modal-overlay-drawer' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      /* ACCESIBILIDAD: aria-labelledby vincula al <h3> visible (WCAG 4.1.2) */
      aria-labelledby={title ? 'modal-dialog-title' : undefined}
      aria-label={!title ? 'Diálogo' : undefined}
    >
      <div
        ref={containerRef}
        className={drawer ? 'drawer-content' : 'modal-content'}
        style={maxWidth && !drawer ? { width: `min(95vw, ${maxWidth})` } : undefined}
      >
        {title && (
          <div className={`modal-header modal-header--${variant}`}>
            {/* ACCESIBILIDAD: id vinculado al aria-labelledby del dialog (WCAG 4.1.2) */}
            <h3 id="modal-dialog-title" className={`modal-title modal-title--${variant}`}>{title}</h3>
            <button
              onClick={onClose}
              className={`modal-close-btn modal-close-btn--${variant}`}
              aria-label="Cerrar diálogo"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
