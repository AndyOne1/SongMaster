import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-300',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-luxury-950',
          'disabled:opacity-50 disabled:pointer-events-none',
          variant === 'primary' && [
            'bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl',
            'hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30',
          ],
          variant === 'secondary' && [
            'bg-luxury-800/80 text-ivory-100 border border-white/8 rounded-xl backdrop-blur-sm',
            'hover:bg-luxury-750 hover:border-white/12',
          ],
          variant === 'ghost' && [
            'text-ivory-300 hover:text-ivory-100',
            'hover:bg-luxury-800/50 rounded-lg',
          ],
          variant === 'gold' && [
            'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-luxury-950 rounded-xl font-semibold',
            'hover:from-amber-200 hover:via-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20',
          ],
          variant === 'outline' && [
            'border border-white/20 text-ivory-200 hover:text-ivory-100 hover:bg-luxury-800/50',
            'hover:border-white/30 rounded-xl',
          ],
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-5 py-2.5 text-sm',
          size === 'lg' && 'px-8 py-3.5 text-base',
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
