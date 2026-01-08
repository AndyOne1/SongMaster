import { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-luxury-950/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-luxury-850/95 backdrop-blur-xl shadow-2xl',
          'max-h-[90vh] overflow-auto animate-scale-in',
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-champagne-500 hover:text-ivory-100 hover:bg-luxury-800/50 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {title && (
          <div className="border-b border-white/5 px-6 py-4">
            <h2 className="font-display text-xl font-semibold text-ivory-100">{title}</h2>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
