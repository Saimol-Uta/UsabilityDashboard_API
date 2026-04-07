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

  const content = (
    <div
      className={`modal-overlay ${drawer ? 'modal-overlay-drawer' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={containerRef}
        className={drawer ? 'drawer-content' : 'modal-content'}
        style={maxWidth && !drawer ? { width: `min(95vw, ${maxWidth})` } : undefined}
      >
        {title && (
          <div className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between ${drawer ? 'bg-gradient-to-r from-slate-900 to-blue-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
            <h3 className={`text-[18px] font-semibold ${drawer ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors ${drawer ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
