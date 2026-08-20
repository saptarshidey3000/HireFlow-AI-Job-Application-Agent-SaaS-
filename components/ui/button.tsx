import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border-2 text-sm font-semibold whitespace-nowrap transition-all duration-120 outline-none select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:ring-2 focus-visible:ring-[#3fa98a]/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[#145a46] bg-[#2b8a70] text-white shadow-[3px_3px_0px_0px_#08251e] hover:bg-[#3fa98a] hover:border-[#2b8a70] hover:shadow-[4px_4px_0px_0px_#08251e]",
        outline:
          "border-[#384843] bg-[#1a1a1a] text-[#f5f5f5] shadow-[3px_3px_0px_0px_#000000] hover:border-[#3fa98a] hover:bg-[#242424] hover:text-white hover:shadow-[4px_4px_0px_0px_#0d3b2e]",
        secondary:
          "border-[#384843] bg-[#242424] text-white shadow-[3px_3px_0px_0px_#000000] hover:border-[#3fa98a] hover:bg-[#2d3835] hover:shadow-[4px_4px_0px_0px_#0d3b2e]",
        ghost:
          "border-transparent bg-transparent text-[#a7a7a7] hover:border-[#384843] hover:bg-[#242424] hover:text-white hover:shadow-[2px_2px_0px_0px_#000000]",
        destructive:
          "border-[#8b2323] bg-[#e05a5a] text-white shadow-[3px_3px_0px_0px_#000000] hover:bg-[#eb7171] hover:shadow-[4px_4px_0px_0px_#000000]",
        link: "border-transparent text-[#3fa98a] underline-offset-4 hover:underline shadow-none hover:translate-x-0 hover:translate-y-0 active:translate-x-0 active:translate-y-0",
      },
      size: {
        default:
          "h-9.5 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6.5 gap-1 rounded-[4px] px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[5px] px-3 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-11 gap-2.5 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9.5 p-0",
        "icon-xs": "size-6.5 rounded-[4px] p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-[5px] p-0",
        "icon-lg": "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
