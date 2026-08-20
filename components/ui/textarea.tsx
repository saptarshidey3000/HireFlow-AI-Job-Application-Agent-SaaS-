import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-md border-2 border-[#384843] bg-[#141414] px-3.5 py-2.5 text-sm font-medium text-white transition-all outline-none placeholder:text-[#707070] shadow-[2px_2px_0px_0px_#000000] focus:border-[#3fa98a] focus:shadow-[3px_3px_0px_0px_#0d3b2e] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
