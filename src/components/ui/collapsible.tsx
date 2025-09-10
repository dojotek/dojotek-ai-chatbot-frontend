import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleProps {
  children: React.ReactNode
  title: string
  defaultOpen?: boolean
  className?: string
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ children, title, defaultOpen = false, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)

    return (
      <div
        ref={ref}
        className={cn("rounded-md border bg-white", className)}
        {...props}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors"
        >
          <span>{title}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <div className="border-t">
            <div className="p-10">
              {children}
            </div>
            <div className="border-t h-10"></div>
          </div>
        )}
      </div>
    )
  }
)
Collapsible.displayName = "Collapsible"

export { Collapsible }
