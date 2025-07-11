import React, { InputHTMLAttributes, ReactNode, ForwardedRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type InputVariant = "default" | "outline" | "filled";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  borderColor?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  register?: UseFormRegisterReturn<string>;
  eyeIcon?: ReactNode;
  error?: {
    message?: string;
    type?: string;
  };
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "default",
      borderColor = "border-blue-800",
      icon,
      iconPosition = "left",
      eyeIcon,
      register,
      className = "",
      containerClassName = "",
      type,
      disabled,
      ...props
    },
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const baseClasses = [
      "px-3 py-2 rounded-lg w-full focus:outline-none",
      "transition-all duration-200",
      disabled ? "opacity-70 cursor-not-allowed" : "",
    ].join(" ");

    const variantClasses = {
      default: "border bg-white",
      outline: "border bg-transparent",
      filled: "border-0 bg-gray-100",
    };

    const conditionalClasses = [
      variantClasses[variant],
      borderColor,
      eyeIcon ? "pr-10" : "",
      icon && iconPosition === "left" ? "pl-10" : "",
      icon && iconPosition === "right" ? "pr-10" : "",
    ].join(" ");

    return (
      <div className={`relative ${containerClassName}`}>
        <div className="relative flex items-center">
          {icon && iconPosition === "left" && (
            <span className="absolute left-3 text-gray-500">{icon}</span>
          )}

          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={`${baseClasses} ${conditionalClasses} ${className}`}
            {...register}
            {...props}
          />

          {eyeIcon && (
            <span className="absolute right-3 text-gray-500 cursor-pointer">
              {eyeIcon}
            </span>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
