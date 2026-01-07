import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed: boolean
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          pressed ? 'bg-primary-600' : 'bg-gray-700',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            pressed ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    )
  }
)
Toggle.displayName = 'Toggle'
