import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-medium",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/90",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Educational variants
        warm: "bg-gradient-to-r from-primary to-accent text-white shadow-medium hover:shadow-elevated hover:scale-[1.02]",
        nature: "bg-gradient-to-r from-secondary to-emerald-500 text-white shadow-medium hover:shadow-elevated hover:scale-[1.02]",
        glass: "backdrop-blur-md bg-white/20 text-foreground border border-white/30 hover:bg-white/30",
        // Subject-specific variants
        science: "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/90 hover:shadow-medium",
        history: "bg-accent text-white shadow-soft hover:bg-accent/90 hover:shadow-medium",
        math: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-medium",
        // Hotspot variant
        hotspot: "rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-hotspot hover:scale-110 animate-pulse-glow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
        iconLg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
