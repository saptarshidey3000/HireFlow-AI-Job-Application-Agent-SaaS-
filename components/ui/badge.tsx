import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-[rgba(43,138,112,0.15)] text-[#3FA98A]",
        processing: "bg-[rgba(214,168,79,0.15)] text-[#D6A84F]",
        error: "bg-[rgba(224,90,90,0.15)] text-[#E05A5A]",
        muted: "bg-[rgba(255,255,255,0.06)] text-[#A7A7A7]",
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
