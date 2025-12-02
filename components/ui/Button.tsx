import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200",
          variant === "primary" &&
            "bg-black text-white border border-black hover:bg-gray-900 hover:-translate-y-0.5 hover:shadow-md active:scale-98",
          variant === "secondary" &&
            "bg-transparent text-black border border-gray-300 hover:border-black hover:bg-gray-50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
