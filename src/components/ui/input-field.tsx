import type { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement>;

export function InputField({ className = "", ...props }: InputFieldProps) {
  return (
    <input
      {...props}
      className={`input-field h-9 rounded px-3 font-normal leading-[1.2] transition-[background-color,border-color,box-shadow] duration-200 focus:outline-none disabled:cursor-not-allowed ${className}`.trim()}
    />
  );
}
