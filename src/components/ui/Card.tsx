import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-gray-700 bg-gray-800 p-4',
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'
