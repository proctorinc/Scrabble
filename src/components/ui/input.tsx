import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-2xl border-2 border-border bg-input px-4 py-2 text-sm text-foreground shadow-[var(--shadow-brutal-sm)] outline-none transition placeholder:text-muted-foreground focus-visible:ring-4 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
