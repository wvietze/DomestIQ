import * as React from 'react'
import { cn } from '@/lib/utils'

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Material Symbols icon name (e.g. "search", "home", "chevron_right") */
  name: string
  /** Filled variant (FILL=1) instead of outlined */
  filled?: boolean
  /**
   * Accessible label. When provided, the icon is announced to screen readers.
   * When omitted (the default), the icon is treated as decorative and hidden from screen readers.
   */
  label?: string
}

/**
 * Material Symbols icon wrapper.
 *
 * Decorative by default (`aria-hidden="true"`). Pass `label` to make it
 * announced — useful for icon-only buttons where the parent has no text.
 *
 * Pair an icon-only button with `<Icon name="close" label="Dismiss" />`
 * OR set `aria-label` on the parent button and leave the icon decorative.
 */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ name, filled = false, label, className, style, ...rest }, ref) => {
    const isDecorative = !label
    return (
      <span
        ref={ref}
        className={cn('material-symbols-outlined', className)}
        style={{
          ...(filled ? { fontVariationSettings: "'FILL' 1" } : null),
          ...style,
        }}
        aria-hidden={isDecorative || undefined}
        aria-label={label}
        role={label ? 'img' : undefined}
        {...rest}
      >
        {name}
      </span>
    )
  }
)
Icon.displayName = 'Icon'
