import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    tone: {
      neutral: "bg-muted text-muted-foreground",
      primary: "bg-primary/12 text-primary",
      success: "bg-success/12 text-success",
      warning: "bg-warning/15 text-amber-600 dark:text-warning",
      danger: "bg-danger/12 text-danger",
      info: "bg-secondary/15 text-cyan-700 dark:text-secondary",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
