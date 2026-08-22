import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border border-primary/30 bg-primary/15 text-primary shadow-[0_0_10px_rgba(27,58,107,0.25)]",
        secondary:
          "border border-white/20 bg-white/10 text-foreground",
        destructive:
          "border border-destructive/30 bg-destructive/15 text-destructive shadow-[0_0_10px_rgba(220,38,38,0.2)]",
        outline:
          "border border-white/20 bg-white/8 text-foreground",
        success:
          "border border-success/35 bg-success/15 text-success shadow-[0_0_12px_rgba(16,185,129,0.3)]",
        warning:
          "border border-warning/35 bg-warning/15 text-warning",
        accent:
          "border border-accent/35 bg-accent/15 text-accent shadow-[0_0_12px_rgba(249,115,22,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
