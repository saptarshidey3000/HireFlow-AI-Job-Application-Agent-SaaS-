import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-md border border-transparent bg-[#242424] px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-[#707070] focus:border-[#2B8A70] focus:shadow-[0_0_0_2px_rgba(43,138,112,0.15)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
