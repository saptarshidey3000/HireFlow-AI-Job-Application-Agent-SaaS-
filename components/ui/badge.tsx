import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border-[#2b8a70] bg-[#0d3b2e]/60 text-[#3fa98a]",
        processing: "border-[#d6a84f]/70 bg-[#d6a84f]/15 text-[#d6a84f]",
        error: "border-[#e05a5a]/70 bg-[#e05a5a]/15 text-[#e05a5a]",
        muted: "border-[#384843] bg-[#242424] text-[#a7a7a7]",
        success: "border-[#3fa98a] bg-[#0d3b2e] text-[#3fa98a]",
        accent: "border-[#145a46] bg-[#2b8a70] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
