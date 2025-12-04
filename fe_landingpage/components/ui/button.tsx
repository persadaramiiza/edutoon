import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-2 border-brand-olive/20 bg-white text-brand-olive hover:bg-brand-olive/10 hover:border-brand-olive/50",
        secondary: "bg-brand-yellow text-white hover:bg-brand-yellow/90 shadow-sm",
        ghost: "hover:bg-brand-cream/50 hover:text-brand-orange",
        link: "text-primary underline-offset-4 hover:underline",
        brand:
          "bg-brand-orange text-white hover:bg-[#E05500] shadow-[0_4px_0_rgb(164,22,35)] hover:shadow-[0_2px_0_rgb(164,22,35)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] border-b-0",
        fun: "bg-white border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white shadow-[0_4px_0_#FFB563] hover:shadow-[0_2px_0_#FFB563] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-full gap-1.5 px-4 has-[>svg]:px-3 text-xs",
        lg: "h-12 rounded-full px-8 has-[>svg]:px-6 text-base",
        icon: "size-10 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
