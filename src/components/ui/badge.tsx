import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase",
  {
    variants: {
      variant: {
        default:
          "border-badge-default-accent bg-badge-default-surface text-badge-default",
        blue:
          "border-badge-blue-accent bg-badge-blue text-player-blue",
        rose:
          "border-badge-rose-accent bg-badge-rose text-player-rose",
        gold:
          "border-badge-gold-accent bg-badge-gold text-player-gold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
