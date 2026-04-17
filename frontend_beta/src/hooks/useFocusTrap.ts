import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps keyboard focus within a container while `isOpen` is true.
 * Returns a ref to attach to the modal container element.
 * When closed, returns focus to the element that triggered the modal.
 */
export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Save the element that had focus before the modal opened
    triggerRef.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    // Focus the first focusable element
    const focusFirst = () => {
      const first = container.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(focusFirst, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableEls = container.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (focusableEls.length === 0) return

      const first = focusableEls[0]
      const last = focusableEls[focusableEls.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      // Return focus to trigger when modal closes
      triggerRef.current?.focus()
    }
  }, [isOpen])

  return containerRef
}
