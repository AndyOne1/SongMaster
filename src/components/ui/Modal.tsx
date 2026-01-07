import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-6',
          'shadow-2xl max-h-[90vh] overflow-auto',
          className
        )}
      >
        {title && (
          <h2 className="mb-4 text-xl font-semibold text-gray-100">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
