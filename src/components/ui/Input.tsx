'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, showPasswordToggle, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#F1F5F9] mb-2.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              'w-full px-5 py-4 bg-[#1E293B] border border-[rgba(100,116,139,0.3)] rounded-xl',
              'text-[#F1F5F9] font-sans text-base',
              'placeholder:text-[#64748B]',
              'transition-all duration-300',
              'focus:border-[#F59E0B] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]',
              'hover:border-[rgba(100,116,139,0.5)]',
              error && 'border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
              showPasswordToggle && 'pr-12',
              className
            )}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-[#EF4444]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
