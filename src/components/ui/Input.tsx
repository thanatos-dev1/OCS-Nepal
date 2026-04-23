'use client';

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
  suffix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, suffix, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full rounded-md border bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-text-disabled",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
              error
                ? "border-error focus:ring-error"
                : "border-border hover:border-border-strong",
              suffix && "pr-10",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
