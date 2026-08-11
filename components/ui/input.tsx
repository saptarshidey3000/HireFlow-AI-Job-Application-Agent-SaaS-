import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-transparent bg-[#242424] px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-[#707070] focus:border-[#2B8A70] focus:shadow-[0_0_0_2px_rgba(43,138,112,0.15)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
