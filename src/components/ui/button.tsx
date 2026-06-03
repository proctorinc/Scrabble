import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 text-sm font-semibold transition-[transform,filter,box-shadow] outline-none focus-visible:ring-4 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-border bg-button-primary text-button-primary shadow-[var(--shadow-brutal-sm)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:brightness-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        secondary:
          "border-border bg-button-secondary text-button-secondary shadow-[var(--shadow-brutal-sm)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        ghost:
          "border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-surface-hover hover:text-foreground",
        outline:
          "border-border bg-button-outline text-foreground shadow-[var(--shadow-brutal-sm)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-xl px-3.5 text-sm",
        lg: "h-13 px-6 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
