import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110",
        secondary: "bg-secondary text-secondary-foreground hover:brightness-110",
        outline: "border border-border bg-card hover:bg-muted",
        ghost: "hover:bg-muted",
        danger: "bg-danger text-white hover:brightness-110",
        soft: "bg-primary/10 text-primary hover:bg-primary/15",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-5",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export function Button({ className, variant, size, loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
