'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className={clsx('flex items-start gap-3 cursor-pointer', className)}>
          <div className="relative mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              {...props}
            />
            <div className={clsx(
              'w-[22px] h-[22px] border-2 border-[rgba(100,116,139,0.5)] rounded-md',
              'flex items-center justify-center',
              'transition-all duration-300',
              'peer-checked:bg-[#F59E0B] peer-checked:border-[#F59E0B]',
              'peer-focus:ring-2 peer-focus:ring-[rgba(245,158,11,0.3)]',
              error && 'border-[#EF4444]'
            )}>
              <Check
                size={14}
                className="text-[#0F172A] opacity-0 scale-0 transition-all duration-200 peer-checked:opacity-100 peer-checked:scale-100"
                strokeWidth={3}
              />
            </div>
          </div>
          {label && (
            <span className="text-sm text-[#64748B] leading-relaxed">{label}</span>
          )}
        </label>
        {error && (
          <p className="mt-2 text-sm text-[#EF4444]">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
