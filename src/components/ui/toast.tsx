import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
  title?: string
  description?: string
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", title, description, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
          variant === "default" && "bg-white border-gray-200",
          variant === "destructive" && "bg-red-600 text-white border-red-700",
          className
        )}
        {...props}
      >
        <div className="grid gap-1">
          {title && (
            <div className={cn("text-sm font-semibold", variant === "destructive" && "text-white")}>
              {title}
            </div>
          )}
          {description && (
            <div className={cn("text-sm opacity-90", variant === "destructive" && "text-white")}>
              {description}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100",
              variant === "destructive" && "text-white"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }
