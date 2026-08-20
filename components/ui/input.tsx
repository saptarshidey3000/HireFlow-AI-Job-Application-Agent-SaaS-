import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border-2 border-[#384843] bg-[#141414] px-3.5 py-2 text-sm font-medium text-white transition-all outline-none placeholder:text-[#707070] shadow-[2px_2px_0px_0px_#000000] focus:border-[#3fa98a] focus:shadow-[3px_3px_0px_0px_#0d3b2e] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
