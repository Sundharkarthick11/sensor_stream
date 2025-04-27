
import * as React from "react"

import { cn } from "@/lib/utils"

const Grid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid sm:grid-cols-2 lg:grid-cols-4 gap-4",
      className
    )}
    {...props}
  />
))
Grid.displayName = "Grid"

export { Grid }
