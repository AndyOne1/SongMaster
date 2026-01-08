import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300',
          {
            // Default luxury card
            'bg-luxury-850/80 backdrop-blur-md border border-white/8 shadow-card':
              variant === 'default',
            'hover:border-amber-500/20 hover:shadow-glow-amber': variant === 'default',
            // Glass card
            'bg-luxury-800/40 backdrop-blur-xl border border-white/5':
              variant === 'glass',
            // Elevated card
            'bg-luxury-850 border border-white/10 shadow-lg':
              variant === 'elevated',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'
