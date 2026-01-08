import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-white/10 bg-luxury-850/60 px-4 py-3 text-ivory-100',
          'placeholder:text-champagne-500/40',
          'focus:outline-none focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/10',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
