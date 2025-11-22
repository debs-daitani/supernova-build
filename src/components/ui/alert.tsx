import * as React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  title?: string
  children: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, children, ...props }, ref) => {
    const icons = {
      default: Info,
      success: CheckCircle,
      error: XCircle,
      warning: AlertCircle,
      info: Info,
    }

    const Icon = icons[variant]

    const variantStyles = {
      default: 'bg-gray-50 border-gray-200 text-gray-900',
      success: 'bg-green-50 border-green-200 text-green-900',
      error: 'bg-red-50 border-red-200 text-red-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900',
    }

    const iconStyles = {
      default: 'text-gray-500',
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          <Icon className={cn('h-5 w-5 flex-shrink-0', iconStyles[variant])} />
          <div className="flex-1">
            {title && (
              <h5 className="mb-1 font-medium leading-none tracking-tight">
                {title}
              </h5>
            )}
            <div className="text-sm [&_p]:leading-relaxed">{children}</div>
          </div>
        </div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

export { Alert }
