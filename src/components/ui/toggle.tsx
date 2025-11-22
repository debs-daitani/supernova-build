import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ToggleProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, disabled, label, description, id }, ref) => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium leading-none cursor-pointer',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <button
          ref={ref}
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
            checked ? 'bg-gradient-pink-purple' : 'bg-gray-200',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>
    )
  }
)
Toggle.displayName = 'Toggle'

export { Toggle }
